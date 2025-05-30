import { NextResponse } from 'next/server';
import { searchAmazonProducts } from '@/services/amazon';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('Query original Amazon:', query);
    query = query.toLowerCase().trim();
    console.log('Query limpa Amazon:', query);

    // Primeira tentativa: busca com a query completa
    console.log('Tentando busca Amazon com query completa:', query);
    let products = await searchAmazonProducts(query);

    // Se não encontrou resultados, tenta com as 3 primeiras palavras
    if (products.length === 0) {
      const words = query.split(' ');
      const shortQuery = words.slice(0, 3).join(' ');
      
      if (shortQuery !== query) {
        console.log('Tentando busca Amazon com query reduzida:', shortQuery);
        products = await searchAmazonProducts(shortQuery);
      }
    }

    return NextResponse.json({ recommendations: products });
  } catch (error) {
    console.error('Erro ao buscar produtos na Amazon:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos na Amazon' },
      { status: 500 }
    );
  }
}
