'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IComparisonProduct } from '@/models/ComparisonProduct';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<IComparisonProduct[]>([]);
  const [productPrices, setProductPrices] = useState<{ [key: string]: Array<{ storeName: string; price: number; url: string; lastUpdate: Date }> }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Buscar produtos
        const productsResponse = await fetch(`/api/products?page=${currentPage}`);
        const productsData = await productsResponse.json();
        setTotalPages(productsData.totalPages);
        
        // Criar um array de promessas para buscar os preços
        const pricePromises = productsData.products.map(async (product: IComparisonProduct) => {
          if (!product.ean) {
            return [product._id, product.prices || []];
          }

          const pricesResponse = await fetch(`/api/products/prices/${product.ean}`);
          const pricesData = await pricesResponse.json();
          return [product._id, [
            ...(product.prices || []),
            ...pricesData.prices
          ]];
        });

        // Aguardar todas as promessas e montar o objeto de preços
        const pricesEntries = await Promise.all(pricePromises);
        const prices = Object.fromEntries(pricesEntries);

        setProducts(productsData.products);
        setProductPrices(prices);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setError('Erro ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando produtos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const getLowestPrice = (prices: Array<{ price: number; storeName: string }>) => {
    if (!prices || prices.length === 0) return null;
    return prices.reduce((min, current) => 
      current.price < min.price ? current : min
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Comparador de Preços
          </h1>
          <p className="mt-2 text-gray-600">
            Compare preços entre as principais lojas e economize em suas compras
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Comparação de Preços
        </h1>

        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => router.push(`/produtos/${product.slug}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group"
            >
              {/* Imagem com overlay no hover */}
              <div className="relative aspect-video">
                <img
                  src={product.images[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
              </div>

              {/* Informações do produto */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Preços */}
                <div className="mt-4">
                  {productPrices[product._id]?.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Preços a partir de:
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {Math.min(...productPrices[product._id].map(p => p.price)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Em {productPrices[product._id].length} {productPrices[product._id].length === 1 ? 'loja' : 'lojas'}
                      </p>
                      <span className="text-sm text-gray-500">
                        em {getLowestPrice(productPrices[product._id])?.storeName}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      Nenhum preço disponível
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Nenhum produto encontrado
          </div>
        )}

        {/* Paginação */}
        {products.length > 0 && (
          <div className="flex justify-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 border rounded-lg bg-gray-50">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
