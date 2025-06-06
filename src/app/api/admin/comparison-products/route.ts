import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ComparisonProduct, IComparisonProduct } from '@/models/ComparisonProduct';
import { Product } from '@/models/Product';

// GET - Lista todos os produtos
export async function GET(request: Request) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Pega parâmetros da URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 15; // Itens por página
    const skip = (page - 1) * limit;

    await connectDB();
    
    // Busca total de produtos
    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { ean: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } }
          ]
        }
      : {};

    // Busca total e produtos da página atual
    const total = await ComparisonProduct.countDocuments(filter);
    const products = await ComparisonProduct.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Produtos encontrados:', {
      total,
      page,
      limit,
      showing: products.length
    });

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

// POST - Cria um novo produto
export async function POST(request: Request) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');

    // Verifica se já existe um produto com o mesmo EAN
    const existing = await collection.findOne({ ean: data.ean });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um produto com este EAN' },
        { status: 400 }
      );
    }

    // Gera slug a partir do nome
    const slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

    // Adiciona timestamp para garantir unicidade
    const timestamp = new Date().getTime();
    data.slug = `${slug}-${timestamp}`;

    // Adiciona campos de data
    data.createdAt = new Date();
    data.updatedAt = new Date();
    data.prices = data.prices || [];

    const result = await collection.insertOne(data);
    return NextResponse.json({ product: { ...data, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
