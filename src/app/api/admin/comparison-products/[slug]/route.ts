import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ComparisonProduct } from '@/models/ComparisonProduct';
import { Product } from '@/models/Product';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { slug } = await context.params;
    console.log('Buscando produto com slug:', slug);

    await connectDB();

    // Listar todos os produtos para debug
    const allProducts = await ComparisonProduct.find({}).lean();
    console.log('Todos os produtos:', allProducts.map(p => ({ name: p.name, slug: p.slug })));

    // Buscar o produto de comparação
    const product = await ComparisonProduct.findOne({ slug }).lean();
    console.log('Produto encontrado:', product ? 'Sim' : 'Não');

    if (!product) {
      console.log('Produto não encontrado');
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Filtrar os preços para manter apenas os que foram adicionados manualmente
    if (product.prices) {
      product.prices = product.prices.filter((price: any) => !price.lastImportId);
    } else {
      product.prices = [];
    }
    
    console.log('Retornando produto com', product.prices.length, 'preços');

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const data = await request.json();
    console.log('Dados recebidos:', data);

    const { slug } = await context.params;
    console.log('Atualizando produto com slug:', slug);

    await connectDB();

    // Buscar o produto atual
    const currentProduct = await ComparisonProduct.findOne({ slug }).lean();
    if (!currentProduct) {
      console.log('Produto não encontrado');
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    console.log('Produto encontrado:', currentProduct._id);

    // Atualizar o produto
    const result = await ComparisonProduct.updateOne(
      { _id: currentProduct._id },
      {
        $set: {
          name: data.name,
          description: data.description,
          ean: data.ean,
          category: data.category,
          prices: data.prices,
          technicalSpecs: data.technicalSpecs,
          updatedAt: new Date()
        }
      }
    );

    if (!result.modifiedCount) {
      console.log('Erro ao atualizar produto');
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      );
    }

    // Buscar o produto atualizado
    const product = await ComparisonProduct.findById(currentProduct._id).lean();

    console.log('Produto atualizado com sucesso');
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    await connectDB();

    const { slug } = await context.params;
    const result = await ComparisonProduct.deleteOne({ slug });

    if (!result.deletedCount) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    );
  }
}
