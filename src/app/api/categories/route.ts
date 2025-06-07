import { NextResponse } from 'next/server';
import { categories as staticCategories } from '@/models/Category';

export interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: CategoryResponse[];
}

export async function GET() {
  try {
    // Função recursiva para construir a árvore de categorias
    const buildCategoryTree = (parentId: string | undefined = undefined): CategoryResponse[] => {
      // Filtra categorias pelo parent ID
      const children = staticCategories
        .filter(cat => cat.parent === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(cat => {
          // Encontra filhos recursivamente
          const subChildren = buildCategoryTree(cat.id);
          
          // Cria a categoria com seus filhos
          const category: CategoryResponse = {
            _id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            children: subChildren.length > 0 ? subChildren : undefined
          };

          return category;
        });

      return children;
    };

    // Constrói a árvore começando pelas categorias principais (sem parent)
    const categoryTree = buildCategoryTree();

    console.log('Categories endpoint:', {
      total: categoryTree.length,
      categories: categoryTree.map(c => ({
        name: c.name,
        slug: c.slug,
        hasChildren: c.children && c.children.length > 0
      }))
    });

    return NextResponse.json({ categories: categoryTree });
  } catch (error) {
    console.error('Error in /api/categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
