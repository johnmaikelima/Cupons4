import { NextResponse } from 'next/server';
import { SiteConfig } from '@/models/SiteConfig';
import { connectDB } from '@/lib/mongoose';

export async function PUT(request: Request) {
  try {
    await connectDB();

    const data = await request.json();
    const { logo, name } = data;

    // Atualizar ou criar configuração
    const config = await SiteConfig.findOneAndUpdate(
      {},
      { logo, name },
      { upsert: true, new: true }
    );

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const config = await SiteConfig.findOne();
    if (!config) {
      return NextResponse.json(
        { error: 'Configurações não encontradas' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}
