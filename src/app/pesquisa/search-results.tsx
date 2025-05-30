'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoSearch } from 'react-icons/io5';

interface SearchResult {
  id: string;
  type: 'product' | 'store' | 'coupon';
  title: string;
  subtitle: string;
  url: string;
  image: string | null;
}

interface SearchResults {
  products: SearchResult[];
  stores: SearchResult[];
  coupons: SearchResult[];
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/comparison-products?q=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();
        
        if (data.products) {
          setResults({
            products: data.products.map((p: any) => ({
              id: p._id,
              type: 'product',
              title: p.name,
              subtitle: `${p.category || 'Produto'} - EAN: ${p.ean || 'N/A'}`,
              url: `/produtos/${p.slug}`,
              image: p.images?.[0] || null
            })),
            stores: [],
            coupons: []
          });
        }
      } catch (error) {
        console.error('Erro na pesquisa:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Digite algo para pesquisar
          </h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pesquisando por "{query}"...
          </h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Resultados para "{query}"
        </h1>

        {results && (
          <div className="space-y-8">
            {/* Produtos */}
            {results.products.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Produtos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={product.url}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoSearch className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.subtitle}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Lojas */}
            {results.stores.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lojas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.stores.map((store) => (
                    <Link
                      key={store.id}
                      href={store.url}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                    >
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 mb-4 mx-auto">
                        {store.image ? (
                          <img
                            src={store.image}
                            alt={store.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoSearch className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 text-center mb-1">
                        {store.title}
                      </h3>
                      <p className="text-sm text-gray-500 text-center">
                        {store.subtitle}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cupons */}
            {results.coupons.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cupons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.coupons.map((coupon) => (
                    <Link
                      key={coupon.id}
                      href={coupon.url}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                    >
                      <div className="bg-blue-50 text-blue-600 font-mono text-lg text-center py-2 rounded-lg mb-3">
                        {coupon.title}
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        {coupon.subtitle}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Nenhum resultado */}
            {results.products.length === 0 &&
              results.stores.length === 0 &&
              results.coupons.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                Nenhum resultado encontrado para "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
