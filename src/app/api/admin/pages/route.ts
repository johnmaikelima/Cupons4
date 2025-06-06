import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Page } from '@/models/Page';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const pages = await Page.find().sort({ createdAt: -1 });
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Erro ao listar páginas:', error);
    return NextResponse.json(
      { error: 'Erro ao listar páginas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Verifica se já existe uma página com o mesmo slug
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return NextResponse.json(
        { error: 'Já existe uma página com este slug' },
        { status: 400 }
      );
    }

    // Cria a nova página
    const page = await Page.create({
      title,
      slug,
      content,
      categoryText, // Adicionando o campo categoryText
      active: true,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Erro ao criar página:', error);
    return NextResponse.json(
      { error: 'Erro ao criar página' },
      { status: 500 }
    );
  }
}
