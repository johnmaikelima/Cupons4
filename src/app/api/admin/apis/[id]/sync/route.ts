import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Api } from '@/models/Api';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { LomadeeService } from '@/services/lomadee';
import { connectDB } from '@/lib/mongodb';
import slugify from 'slugify';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Garantir que params.id está disponível
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      );
    }

    // Conectar ao banco de dados
    await connectDB();

    // Buscar a API
    const api = await Api.findById(id);
    if (!api) {
      return NextResponse.json(
        { error: 'API não encontrada' },
        { status: 404 }
      );
    }

    if (api.provider !== 'lomadee') {
      return NextResponse.json(
        { error: 'API não é do tipo Lomadee' },
        { status: 400 }
      );
    }

    console.log('Iniciando sincronização com a API:', api.name);
    console.log('Credenciais da API:', {
      appToken: api.appToken,
      sourceId: api.sourceId
    });

    const lomadee = new LomadeeService(api.appToken, api.sourceId);

    // Primeiro, buscar e salvar todas as lojas
    console.log('Buscando lojas da API...');
    const stores = await lomadee.getStores();
    console.log('Lojas encontradas:', stores.length);

    // Processa e salva as lojas
    console.log('Processando lojas...');
    const storePromises = stores.map(async (storeData) => {
      try {
        const store = await Store.findOneAndUpdate(
          { externalId: storeData.id.toString(), provider: 'lomadee' },
          {
            name: storeData.name,
            logo: storeData.image,
            url: storeData.link,
            slug: `${slugify(storeData.name, { lower: true, strict: true })}-${Date.now().toString(36)}`,
            active: true,
            provider: 'lomadee',
            hasOffers: storeData.hasOffer,
            externalId: storeData.id.toString(),
          },
          { upsert: true, new: true }
        );
        console.log('Loja salva:', store.name);
        return store;
      } catch (error) {
        console.error('Erro ao salvar loja:', storeData.id, error);
        return null;
      }
    });

    const savedStores = await Promise.all(storePromises);
    const validStores = savedStores.filter(store => store !== null);
    console.log('Total de lojas salvas:', validStores.length);

    // Cria um mapa de lojas para referência rápida
    const storeMap = new Map(
      validStores.map(store => [store.externalId, store])
    );

    // Agora que temos todas as lojas, buscar e processar os cupons
    console.log('Buscando cupons da API...');
    const coupons = await lomadee.getCoupons();
    console.log('Cupons encontrados:', coupons.length);

    // Processa cupons
    console.log('Processando cupons...');
    const couponPromises = coupons.map(async (couponData) => {
      try {
        // Encontra a loja correspondente no mapa
        const store = storeMap.get(couponData.store.id.toString());
        if (!store) {
          console.error('Loja não encontrada para o cupom:', couponData.id);
          return null;
        }

        const coupon = await Coupon.findOneAndUpdate(
          { externalId: couponData.id.toString(), provider: 'lomadee' },
          {
            code: couponData.code,
            description: couponData.description,
            store: store._id,
            url: couponData.link,
            slug: `${slugify(couponData.description, { lower: true, strict: true })}-${Date.now().toString(36)}`,
            expiresAt: new Date(couponData.vigency),
            discount: couponData.discount?.toString() || '',
            active: true,
            provider: 'lomadee',
            externalId: couponData.id.toString(),
          },
          { upsert: true, new: true }
        );
        console.log('Cupom salvo:', coupon.description);
        return coupon;
      } catch (error) {
        console.error('Erro ao salvar cupom:', couponData.id, error);
        return null;
      }
    });

    const savedCoupons = await Promise.all(couponPromises);
    const validCoupons = savedCoupons.filter(coupon => coupon !== null);
    console.log('Total de cupons salvos:', validCoupons.length);

    // Atualiza o lastSync
    api.lastSync = new Date();
    await api.save();

    return NextResponse.json({ 
      message: 'Sincronização concluída com sucesso',
      stats: {
        stores: validStores.length,
        coupons: validCoupons.length,
      }
    });
  } catch (error) {
    console.error('Erro ao sincronizar API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar API';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
