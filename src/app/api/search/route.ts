import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  const SEARCH_LIMIT = 10;
  const PREVIEW_LIMIT = 3;
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const isFull = searchParams.get('full') === 'true';
    const limit = isFull ? SEARCH_LIMIT : PREVIEW_LIMIT;

    const client = await connectDB();
    const db = client.db();

    // Buscar produtos
    const productsCollection = db.collection('comparison_products');
    const products = await productsCollection
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { ean: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(limit)
      .toArray();

    console.log('Produtos encontrados:', products);

    // Buscar lojas
    const storesCollection = db.collection('stores');
    const stores = await storesCollection
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(limit)
      .toArray();

    // Buscar cupons
    const couponsCollection = db.collection('coupons');
    const coupons = await couponsCollection
      .find({
        $or: [
          { code: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      products: products.map(p => ({
        id: p._id,
        type: 'product',
        title: p.name,
        subtitle: `${p.category || 'Produto'} - EAN: ${p.ean || 'N/A'}`,
        url: `/produtos/${p.slug}`,
        image: p.images?.[0] || null
      })),
      stores: stores.map(s => ({
        id: s._id,
        type: 'store',
        title: s.name,
        subtitle: s.description || '',
        url: `/lojas/${s.slug}`,
        image: s.logo || null
      })),
      coupons: coupons.map(c => ({
        id: c._id,
        type: 'coupon',
        title: c.code,
        subtitle: c.description || '',
        url: `/cupons/${c.slug}`,
        image: null
      }))
    });
  } catch (error) {
    console.error('Erro na pesquisa:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar pesquisa' },
      { status: 500 }
    );
  }
}
