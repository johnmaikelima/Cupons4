import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import slugify from 'slugify';

// Define o schema do produto
const ComparisonProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  ean: String,
  category: String,
  imageUrl: String,
  slug: String,
  prices: [],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Obtém ou cria o modelo
const ComparisonProduct = mongoose.models.ComparisonProduct || 
  mongoose.model('ComparisonProduct', ComparisonProductSchema);

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Formato inválido. Esperado um array de produtos.' },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum produto válido para cadastro.' },
        { status: 400 }
      );
    }

    // Conecta ao MongoDB usando Mongoose
    await connectDB();

    // Processa cada produto
    const processedProducts = products.map(product => {
      if (!product.name || !product.ean || !product.category) {
        throw new Error(`Produto inválido: ${JSON.stringify(product)}`);
      }

      return {
        ...product,
        slug: slugify(product.name, { lower: true, strict: true }),
        prices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    console.log('Produtos processados:', processedProducts);

    // Insere os produtos em lote usando Mongoose
    const result = await ComparisonProduct.insertMany(processedProducts);

    console.log('Resultado da inserção:', result);

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      message: `${result.insertedCount} produtos cadastrados com sucesso!`
    });

  } catch (error: any) {
    console.error('Erro ao processar produtos em lote:', error);

    // Se for erro de duplicação, retorna mensagem específica
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Alguns produtos já existem no sistema.' },
        { status: 409 }
      );
    }

    // Se for erro de validação de produto
    if (error.message?.includes('Produto inválido')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar produtos: ' + (error.message || 'Erro desconhecido') },
      { status: 500 }
    );
  }
}
