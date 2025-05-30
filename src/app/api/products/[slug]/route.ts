import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');

    const product = await collection.findOne({ slug: params.slug });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Filtrar os preços para manter apenas os que foram adicionados manualmente
    if (product.prices) {
      product.prices = product.prices.filter((price: any) => !price.lastImportId);
    } else {
      product.prices = [];
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}
