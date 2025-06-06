import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Api } from '@/models/Api';
import { connectDB } from '@/lib/mongodb';

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
    const { name, provider, appToken, sourceId } = data;

    if (!name || !provider || !appToken || !sourceId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se já existe outra API com o mesmo nome
    const existingApi = await Api.findOne({ 
      name, 
      _id: { $ne: params.id } 
    });
    
    if (existingApi) {
      return NextResponse.json(
        { error: 'Já existe uma API com este nome' },
        { status: 400 }
      );
    }

    // Atualiza a API
    const api = await Api.findByIdAndUpdate(
      params.id,
      {
        name,
        provider,
        appToken,
        sourceId,
      },
      { new: true }
    );

    if (!api) {
      return NextResponse.json(
        { error: 'API não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(api);
  } catch (error) {
    console.error('Erro ao atualizar API:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar API' },
      { status: 500 }
    );
  }
}
