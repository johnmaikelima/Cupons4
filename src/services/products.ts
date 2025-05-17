import { cache } from 'react';
import { UnifiedProduct, ProductsResponse, SortDirection } from '../types/Product';
import { searchAmazonProducts } from './amazon';
import { LomadeeService } from './lomadee';

// Cache por 5 minutos
export const CACHE_DURATION = 5 * 60 * 1000;

// Função principal com cache
export const getUnifiedProducts = cache(async (
  query: string,
  sort: SortDirection = 'asc'
): Promise<ProductsResponse> => {
  try {
    // Inicializa o serviço da Lomadee
    const lomadeeService = new LomadeeService();

    // Busca produtos de todas as fontes em paralelo
    const [amazonProducts, lomadeeProducts] = await Promise.all([
      searchAmazonProducts(query),
      lomadeeService.getProducts(query)
    ]);

    // Unifica os produtos
    const unifiedProducts: UnifiedProduct[] = [
      // Produtos da Amazon
      ...amazonProducts.map(p => ({
        id: p.name, // usando o nome como id temporário já que não temos ASIN
        name: p.name,
        price: p.price,
        thumbnail: p.thumbnail,
        link: p.link,
        storeName: p.storeName,
        source: 'amazon' as const,
        originalData: p
      })),
      // Produtos da Lomadee
      ...lomadeeProducts.map(p => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        thumbnail: p.thumbnail,
        link: p.link,
        storeName: p.storeName,
        source: 'lomadee' as const,
        originalData: p
      }))
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
