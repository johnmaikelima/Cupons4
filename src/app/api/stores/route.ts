import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongodb';
import slugify from 'slugify';

// GET /api/stores
export async function GET() {
  try {
    await connectDB();
    const stores = await Store.find().sort({ name: 1 });
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar lojas' },
      { status: 500 }
    );
  }
}

// POST /api/stores
export async function POST(request: Request) {
  try {
    const data = await request.json();
    await connectDB();

    // Gera o slug a partir do nome
    const slug = slugify(data.name, {
      lower: true,
      strict: true
    });

    // Verifica se já existe uma loja com o mesmo slug
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      return NextResponse.json(
        { message: 'Já existe uma loja com este nome' },
        { status: 400 }
      );
    }

    // Adiciona campos padrão
    const storeData = {
      ...data,
      slug,
      description: data.description || `Encontre os melhores cupons e ofertas de ${data.name}. Economize em suas compras com descontos exclusivos.`,
      provider: 'manual'
    };

    const store = await Store.create(storeData);

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    return NextResponse.json(
      { message: 'Erro ao criar loja' },
      { status: 500 }
    );
  }
}
