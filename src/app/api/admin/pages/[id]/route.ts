import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Page } from '@/models/Page';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const page = await Page.findById(params.id);
    if (!page) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar página' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { title, slug, content, categoryText } = data;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se já existe outra página com o mesmo slug
    const existingPage = await Page.findOne({ 
      slug, 
      _id: { $ne: params.id } 
    });
    
    if (existingPage) {
      return NextResponse.json(
        { error: 'Já existe uma página com este slug' },
        { status: 400 }
      );
    }

    // Atualiza a página
    const page = await Page.findByIdAndUpdate(
      params.id,
      {
        title,
        slug,
        content,
        categoryText, // Adicionando o campo categoryText
      },
      { new: true }
    );

    if (!page) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Erro ao atualizar página:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar página' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const page = await Page.findByIdAndDelete(params.id);
    if (!page) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Página excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir página:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir página' },
      { status: 500 }
    );
  }
}
