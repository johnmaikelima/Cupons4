import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import connectDB from '@/lib/mongodb';
import slugify from 'slugify';

const API_URL = 'https://api.lomadee.com/v2';
const APP_TOKEN = '17457627443735fab3c6f';
const SOURCE_ID = '38041897';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar cupons primeiro
    console.log('Buscando cupons...');
    const couponsResponse = await fetch(
      `${API_URL}/${APP_TOKEN}/coupon/_all?sourceId=${SOURCE_ID}`
    );

    if (!couponsResponse.ok) {
      const errorText = await couponsResponse.text();
      console.error('Erro ao buscar cupons:', {
        status: couponsResponse.status,
        statusText: couponsResponse.statusText,
        errorText
      });
      throw new Error(`Erro na API: ${couponsResponse.statusText} - ${errorText}`);
    }

    const couponsData = await couponsResponse.json();
    console.log('Cupons encontrados:', couponsData.coupons?.length || 0);

    // Conectar ao banco de dados
    await connectDB();

    // Criar um mapa de lojas a partir dos cupons
    const storeMap = new Map();
    for (const coupon of couponsData.coupons || []) {
      const storeData = coupon.store;
      if (!storeMap.has(storeData.id.toString())) {
        storeMap.set(storeData.id.toString(), {
          name: storeData.name,
          image: storeData.image,
          id: storeData.id
        });
      }
    }

    console.log('Lojas únicas encontradas:', storeMap.size);

    // Salvar lojas
    const savedStores = new Map();
    for (const [externalId, storeData] of storeMap.entries()) {
      try {
        const store = await Store.findOneAndUpdate(
          { externalId: externalId, provider: 'lomadee' },
          {
            name: storeData.name,
            logo: storeData.image,
            slug: `${slugify(storeData.name, { lower: true, strict: true })}-${Date.now().toString(36)}`,
            active: true,
            provider: 'lomadee',
            externalId: externalId,
          },
          { upsert: true, new: true }
        );
        console.log('Loja salva:', store.name);
        savedStores.set(externalId, store);
      } catch (error) {
        console.error('Erro ao salvar loja:', externalId, error);
      }
    }

    // Salvar cupons
    const savedCoupons = [];
    for (const couponData of couponsData.coupons || []) {
      try {
        const store = savedStores.get(couponData.store.id.toString());
        if (!store) {
          console.error('Loja não encontrada para o cupom:', couponData.id);
          continue;
        }

        console.log('Dados do cupom da API:', {
          id: couponData.id,
          code: couponData.code,
          vigency: couponData.vigency,
          raw: couponData
        });

        // Tratar a data de expiração
        let expiresAt = null;
        try {
          if (couponData.vigency) {
            // Tentar diferentes formatos de data
            const vigencyStr = couponData.vigency.toString();
            console.log('Processando data:', vigencyStr);
            
            if (vigencyStr.match(/^\d{13}$/)) {
              // Se for timestamp em milissegundos
              expiresAt = new Date(parseInt(vigencyStr));
            } else if (vigencyStr.match(/^\d{10}$/)) {
              // Se for timestamp em segundos
              expiresAt = new Date(parseInt(vigencyStr) * 1000);
            } else {
              // Tentar parse direto
              expiresAt = new Date(vigencyStr);
            }

            // Validar se a data é válida
            if (isNaN(expiresAt.getTime())) {
              console.warn('Data de expiração inválida para o cupom:', couponData.id, vigencyStr);
              expiresAt = null;
            } else {
              console.log('Data processada:', expiresAt.toISOString());
            }
          }
        } catch (error) {
          console.warn('Erro ao processar data de expiração do cupom:', couponData.id, error);
          expiresAt = null;
        }

        // Determinar o tipo do cupom
        let type = 'COUPON';
        if (!couponData.code || couponData.code.toLowerCase().includes('url cuponada')) {
          type = 'URL_CUPONADA';
        }

        const couponToSave = {
          title: couponData.description, // Usar description como título
          description: couponData.description, // Manter description também na descrição por enquanto
          code: couponData.code || '',
          store: store._id,
          url: couponData.link,
          slug: `${slugify(couponData.description, { lower: true, strict: true })}-${Date.now().toString(36)}`,
          expiresAt: expiresAt,
          discount: couponData.discount?.toString() || '',
          active: true,
          provider: 'lomadee',
          externalId: couponData.id.toString(),
          type: type,
        };

        console.log('Salvando cupom:', couponToSave);

        const coupon = await Coupon.findOneAndUpdate(
          { externalId: couponData.id.toString(), provider: 'lomadee' },
          couponToSave,
          { upsert: true, new: true }
        );

        console.log('Cupom salvo:', {
          id: coupon._id,
          title: coupon.title,
          code: coupon.code,
          expiresAt: coupon.expiresAt
        });

        savedCoupons.push(coupon);
      } catch (error) {
        console.error('Erro ao salvar cupom:', couponData.id, error);
      }
    }

    return NextResponse.json({
      message: 'Sincronização concluída com sucesso',
      stats: {
        stores: savedStores.size,
        coupons: savedCoupons.length
      },
      data: couponsData // Retorna os dados dos cupons para exibir na interface
    });
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}
