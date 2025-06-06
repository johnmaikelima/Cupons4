import { NextResponse } from 'next/server';
import { Page } from '@/models/Page';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const page = await Page.findOne({ 
      slug: params.slug,
      active: true 
    });

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
