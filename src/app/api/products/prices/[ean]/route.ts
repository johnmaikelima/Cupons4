import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ean: string }> }
) {
  try {
    await connectDB();
    const { ean } = await params;

    // Buscar produtos com o mesmo EAN
    const products = await Product.find({ ean });

    // Mapear apenas os dados necessários
    const prices = products
      .filter(p => p.store_price && p.merchant_name && p.aw_deep_link)
      .map(p => ({
        storeName: p.merchant_name,
        price: p.store_price || p.search_price,
        url: p.aw_deep_link,
        lastUpdate: new Date()
      }));

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar preços' },
      { status: 500 }
    );
  }
}
