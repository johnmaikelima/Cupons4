import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ComparisonProduct } from '@/models/ComparisonProduct';

export async function GET(request: Request) {
  try {
    // Pega parâmetros da URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 20;
    const skip = (page - 1) * limit;

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');
    
    // Busca total de produtos
    const total = await collection.countDocuments({});
    
    // Busca os produtos da página atual
    const products = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar produtos' },
      { status: 500 }
    );
  }
}
