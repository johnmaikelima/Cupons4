import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongodb';
import slugify from 'slugify';

interface Props {
  params: {
    id: string;
  };
}

// PUT /api/stores/[id]
export async function PUT(request: Request, { params }: Props) {
  try {
    const data = await request.json();
    await connectDB();

    // Gera o slug a partir do nome
    const slug = slugify(data.name, {
      lower: true,
      strict: true
    });

    // Verifica se já existe uma loja com o mesmo slug (exceto a própria loja)
    const existingStore = await Store.findOne({
      slug,
      _id: { $ne: params.id }
    });

    if (existingStore) {
      return NextResponse.json(
        { message: 'Já existe uma loja com este nome' },
        { status: 400 }
      );
    }

    const store = await Store.findByIdAndUpdate(
      params.id,
      {
        ...data,
        slug
      },
      { new: true }
    );

    if (!store) {
      return NextResponse.json(
        { message: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar loja' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[id]
export async function DELETE(_request: Request, { params }: Props) {
  try {
    await connectDB();
    const store = await Store.findByIdAndDelete(params.id);

    if (!store) {
      return NextResponse.json(
        { message: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir loja:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir loja' },
      { status: 500 }
    );
  }
}
