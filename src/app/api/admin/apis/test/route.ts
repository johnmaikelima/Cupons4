import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import connectDB from '@/lib/mongodb';
import slugify from 'slugify';

const API_URL = 'https://api.lomadee.com/v2';
const APP_TOKEN = '17457627443735fab3c6f';
const SOURCE_ID = '37850948';

export async function GET() {
  try {
    console.log('Iniciando importação...');
    await connectDB();
    console.log('Conectado ao banco de dados');

    // Buscar cupons
    console.log('Buscando cupons da Lomadee...');
    const couponsUrl = `${API_URL}/${APP_TOKEN}/coupon/_all?sourceId=${SOURCE_ID}`;
    console.log('URL da API:', couponsUrl);
    
    const couponsResponse = await fetch(couponsUrl);
    if (!couponsResponse.ok) {
      const errorText = await couponsResponse.text();
      throw new Error(`Erro ao buscar cupons: ${couponsResponse.status} - ${errorText}`);
    }

    const couponsData = await couponsResponse.json();
    console.log('Dados recebidos da API:', {
      status: 'success',
      totalCoupons: couponsData.coupons?.length || 0
    });
    
    if (!couponsData.coupons || !Array.isArray(couponsData.coupons)) {
      console.error('Resposta inválida da API:', couponsData);
      throw new Error('Formato de resposta inválido');
    }

    // Mapear lojas únicas
    const storeMap = new Map();
    for (const coupon of couponsData.coupons) {
      const storeData = coupon.store;
      if (!storeMap.has(storeData.id.toString())) {
        storeMap.set(storeData.id.toString(), {
          name: storeData.name,
          image: storeData.image,
          id: storeData.id,
          affiliateLink: coupon.link // Usa o link do primeiro cupom como link de afiliado da loja
        });
      }
    }

    console.log('Lojas únicas encontradas:', storeMap.size);

    // Salvar lojas
    const savedStores = new Map();
    for (const [externalId, storeData] of storeMap.entries()) {
      try {
        console.log('Salvando loja:', storeData.name);
        
        // Gerar slug apenas com o nome da loja
        const slug = slugify(storeData.name, { lower: true, strict: true });
        
        const store = await Store.findOneAndUpdate(
          { externalId, provider: 'lomadee' },
          {
            name: storeData.name,
            logo: storeData.image,
            active: true,
            provider: 'lomadee',
            externalId: externalId,
            affiliateLink: storeData.affiliateLink,
            slug: slug
          },
          { upsert: true, new: true }
        );
        savedStores.set(externalId, store);
        console.log('Loja salva com sucesso:', store._id);
      } catch (error) {
        console.error(`Erro ao salvar loja ${storeData.name}:`, error);
      }
    }

    console.log('Total de lojas salvas:', savedStores.size);

    // Salvar cupons
    let savedCoupons = 0;
    let errorCoupons = 0;

    for (const couponData of couponsData.coupons) {
      try {
        const store = savedStores.get(couponData.store.id.toString());
        if (!store) {
          console.error(`Loja não encontrada para o cupom ${couponData.id}`);
          continue;
        }

        // Converter data de expiração
        let expiresAt = null;
        if (couponData.vigency) {
          const [day, month, year] = couponData.vigency.split('/');
          if (day && month && year) {
            expiresAt = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              23,
              59,
              59
            );
          }
        }

        // Gerar slug com o nome da loja
        const slug = `cupom-${slugify(store.name, { lower: true, strict: true })}-${couponData.id}`;

        // Atualizar ou criar cupom
        console.log('Salvando cupom:', {
          id: couponData.id,
          store: store.name,
          code: couponData.code
        });

        await Coupon.findOneAndUpdate(
          { externalId: couponData.id, provider: 'lomadee' },
          {
            title: couponData.description,
            description: couponData.description,
            type: 'COUPON',
            code: couponData.code || '',
            store: store._id,
            url: couponData.link,
            affiliateLink: couponData.link,
            slug: slug,
            expiresAt: expiresAt,
            discount: couponData.discount?.toString() || '',
            active: true,
            provider: 'lomadee',
            externalId: couponData.id
          },
          { upsert: true }
        );

        savedCoupons++;
        if (savedCoupons % 10 === 0) {
          console.log(`Progresso: ${savedCoupons} cupons salvos`);
        }
      } catch (error) {
        console.error(`Erro ao salvar cupom ${couponData.id}:`, error);
        errorCoupons++;
      }
    }

    console.log('Resumo da importação:', {
      lojasSalvas: savedStores.size,
      cuponsSalvos: savedCoupons,
      erros: errorCoupons
    });

    return NextResponse.json({
      message: 'Dados importados com sucesso',
      stats: {
        stores: savedStores.size,
        coupons: savedCoupons,
        errors: errorCoupons
      }
    });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao importar dados' },
      { status: 500 }
    );
  }
}
