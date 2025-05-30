import { NextResponse } from 'next/server';
import { searchAmazonProducts } from '@/services/amazon';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    const offers = await searchAmazonProducts(keyword);
    console.log('Amazon API Response:', JSON.stringify(offers, null, 2));
    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error in Amazon search:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}
