import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { categories } from '@/models/Category';

export async function GET() {
  try {
    const client = await connectDB();
    const db = client.db();
    const collection = db.collection('comparison_products');

    // Busca todas as categorias únicas primeiro
    const allCategories = await collection.distinct('category');
    console.log('Todas as categorias encontradas:', allCategories);

    // Busca contagem de produtos por categoria
    const categoryCounts = await collection.aggregate([
      { $match: { category: { $exists: true, $ne: '' } } },
      { $group: { 
        _id: '$category',
        count: { $sum: 1 }
      }}
    ]).toArray();

    // Mapa de contagem por categoria
    const countMap = new Map(categoryCounts.map(c => [c._id.toLowerCase(), c.count]));

    // Estrutura hierárquica de categorias
    const categoryTree = categories.map(cat => {
      // Encontra filhos diretos
      const children = categories
        .filter(c => c.parent === cat.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      // Soma contagem de produtos
      const count = countMap.get(cat.name.toLowerCase()) || 0;
      const childrenCount = children.reduce((sum, child) => 
        sum + (countMap.get(child.name.toLowerCase()) || 0), 0
      );

      return {
        ...cat,
        count: count + childrenCount,
        children: children.length > 0 ? children : undefined
      };
    });

    // Filtra apenas categorias principais e ordena
    const mainCategories = categoryTree
      .filter(cat => !cat.parent)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({ categories: mainCategories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}
