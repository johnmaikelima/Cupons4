import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedProducts } from '@/services/products';
import { SortDirection } from '@/types/Product';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const sort = (searchParams.get('sort') || 'asc') as SortDirection;

    const response = await getUnifiedProducts(query, sort);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
