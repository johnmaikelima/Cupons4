import { cache } from 'react';
import { UnifiedProduct, ProductsResponse, SortDirection } from '../types/Product';
import { searchAmazonProducts } from './amazon';
import { searchShopeeProducts } from './shopee';
import { LomadeeService } from './lomadee';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

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

    // Conecta ao MongoDB
    await connectDB();

    console.log('Buscando produtos no MongoDB com query:', query);
    
    // Busca produtos do MongoDB
    console.log('getUnifiedProducts - Buscando produtos com query:', query);

  const mongoQuery = {
    $or: [
      { product_name: { $regex: query.replace(/\s+/g, '.*'), $options: 'i' } },
      { merchant_category: { $regex: query.replace(/\s+/g, '.*'), $options: 'i' } }
    ]
  };

  console.log('getUnifiedProducts - Query MongoDB:', JSON.stringify(mongoQuery, null, 2));

  const mongoProducts = await Product.find(mongoQuery);

  console.log('getUnifiedProducts - Produtos encontrados no MongoDB:', mongoProducts.length);

    console.log('Produtos encontrados no MongoDB:', mongoProducts.length);
    if (mongoProducts.length > 0) {
      console.log('Exemplo de produto:', {
        nome: mongoProducts[0].product_name,
        categoria: mongoProducts[0].merchant_category
      });

    }

    // Busca produtos de todas as fontes em paralelo
    const [amazonProducts, shopeeProducts, lomadeeProducts] = await Promise.all([
      searchAmazonProducts(query),
      searchShopeeProducts(query),
      lomadeeService.getProducts(query)
    ]);

    // Unifica os produtos
    const unifiedProducts: UnifiedProduct[] = [
      // Produtos do MongoDB
      ...mongoProducts.map(p => ({
        id: p.ean,
        name: p.product_name,
        price: p.store_price,
        thumbnail: p.merchant_image_url,
        link: p.aw_deep_link,
        storeName: p.merchant_name || 'Loja',
        source: 'csv' as 'amazon' | 'aliexpress' | 'lomadee',
        rating: p.rating,
        description: p.description,
        ean: p.ean,
        originalData: p
      })),
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
      })),
      // Produtos da Shopee
      ...shopeeProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        thumbnail: p.thumbnail,
        link: p.link,
        storeName: p.storeName,
        source: 'shopee' as const,
        rating: p.rating,
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
