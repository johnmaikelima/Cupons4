import { cache } from 'react';
import { UnifiedProduct, ProductsResponse, SortDirection } from '../types/Product';
import { searchAmazonProducts } from './amazon';
// import { searchAliExpressProducts } from './aliexpress';

// Cache por 5 minutos
export const CACHE_DURATION = 5 * 60 * 1000;

// Função principal com cache
export const getUnifiedProducts = cache(async (
  query: string,
  sort: SortDirection = 'asc'
): Promise<ProductsResponse> => {
  try {
    // Busca produtos de todas as fontes em paralelo
    const [amazonProducts] = await Promise.all([
      searchAmazonProducts(query),
      // searchAliExpressProducts(query)
    ]);

    // Unifica os produtos
    const unifiedProducts: UnifiedProduct[] = [
      ...amazonProducts.map(p => ({
        id: p.asin,
        name: p.title,
        price: p.price,
        thumbnail: p.image,
        link: p.url,
        storeName: 'Amazon',
        source: 'amazon' as const,
        originalData: p
      })),
      // ...aliexpressProducts.map(...)
    ];

    // Ordena os produtos
    const sortedProducts = sortProducts(unifiedProducts, sort);

    return {
      products: sortedProducts,
      timestamp: Date.now(),
      total: sortedProducts.length
    };
  } catch (error) {
    console.error('Error fetching unified products:', error);
    return {
      products: [],
      timestamp: Date.now(),
      total: 0
    };
  }
});

// Função de ordenação
export const sortProducts = (
  products: UnifiedProduct[],
  direction: SortDirection
): UnifiedProduct[] => {
  return [...products].sort((a, b) => {
    const comparison = a.price - b.price;
    return direction === 'asc' ? comparison : -comparison;
  });
};

// Função para verificar se o cache está válido
export const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};
