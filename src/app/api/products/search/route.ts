import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');
    
    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { ean: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    };

    const products = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Remove preços importados e sensibiliza dados
    const sanitizedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      slug: product.slug,
      ean: product.ean,
      description: product.description,
      category: product.category,
      images: product.images,
      prices: (product.prices || []).filter((price: any) => !price.lastImportId)
    }));

    return NextResponse.json({
      products: sanitizedProducts
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}
