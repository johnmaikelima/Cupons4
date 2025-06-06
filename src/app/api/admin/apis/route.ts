import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Api } from '@/models/Api';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { name, provider, appToken, sourceId, baseUrl } = data;

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Nome e provedor são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se já existe uma API com o mesmo nome
    const existingApi = await Api.findOne({ name });
    if (existingApi) {
      return NextResponse.json(
        { error: 'Já existe uma API com este nome' },
        { status: 400 }
      );
    }

    // Cria a nova API
    const api = await Api.create({
      name,
      provider,
      appToken,
      sourceId,
      baseUrl,
      active: true,
      isActive: true,
    });

    return NextResponse.json(api);
  } catch (error: any) {
    console.error('Erro ao criar API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar API' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const apis = await Api.find({ active: true }).sort({ createdAt: -1 });
    return NextResponse.json(apis);
  } catch (error) {
    console.error('Erro ao listar APIs:', error);
    return NextResponse.json(
      { error: 'Erro ao listar APIs' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    const data = await request.json();
    const { name, provider, appToken, sourceId, baseUrl } = data;

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Nome e provedor são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se já existe outra API com o mesmo nome
    const existingApi = await Api.findOne({ name, _id: { $ne: id } });
    if (existingApi) {
      return NextResponse.json(
        { error: 'Já existe uma API com este nome' },
        { status: 400 }
      );
    }

    // Atualiza a API
    const api = await Api.findByIdAndUpdate(
      id,
      {
        name,
        provider,
        appToken,
        sourceId,
        baseUrl,
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
  } catch (error: any) {
    console.error('Erro ao atualizar API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar API' },
      { status: 500 }
    );
  }
}
