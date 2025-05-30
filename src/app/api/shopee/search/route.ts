import { NextResponse } from 'next/server';
import { searchShopeeProducts } from '@/services/shopee';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    const products = await searchShopeeProducts(keyword);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error searching Shopee products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
