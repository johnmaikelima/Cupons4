import { NextResponse } from 'next/server';
import { searchAmazonPriceByEAN } from '@/services/amazonPriceSearch';

export async function GET(
  request: Request,
  context: { params: { ean: string } }
) {
  try {
    // Aguarda os parâmetros da rota dinâmica
    const { ean } = await Promise.resolve(context.params);
    console.log('Buscando preço da Amazon para comparação, EAN:', ean);

    if (!ean) {
      return NextResponse.json(
        { error: 'EAN não fornecido' },
        { status: 400 }
      );
    }

    // Busca o preço na Amazon
    const amazonPrice = await searchAmazonPriceByEAN(ean);

    if (!amazonPrice) {
      return NextResponse.json(
        { error: 'Produto não encontrado na Amazon' },
        { status: 404 }
      );
    }

    return NextResponse.json({ price: amazonPrice });
  } catch (error) {
    console.error('Erro ao buscar preço da Amazon:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar preço da Amazon' },
      { status: 500 }
    );
  }
}
