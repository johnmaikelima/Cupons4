import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ComparisonProduct } from '@/models/ComparisonProduct';
import { Product } from '@/models/Product';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Buscando produto com slug:', slug);

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');

    // Buscar o produto de comparação
    const product = await collection.findOne({ slug });
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const data = await request.json();
    console.log('Dados recebidos:', data);

    const { slug } = await params;
    console.log('Atualizando produto com slug:', slug);

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');

    // Buscar o produto atual
    const currentProduct = await collection.findOne({ slug });
    if (!currentProduct) {
      console.log('Produto não encontrado');
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    console.log('Produto encontrado:', currentProduct._id);

    // Atualizar o produto
    const result = await collection.updateOne(
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
    const product = await collection.findOne({ _id: currentProduct._id });

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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');

    const result = await collection.deleteOne({ slug });

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
