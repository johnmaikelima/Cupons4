'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        // Buscar produtos
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=3`);
        const data = await response.json();
        
        if (data.products) {
          setResults({
            products: data.products.map((p: any) => ({
              id: p.id,
              type: 'product',
              title: p.name,
              subtitle: p.category ? `${p.category}${p.ean ? ` - EAN: ${p.ean}` : ''}` : 'Produto',
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

    // Busca mais rápida enquanto digita
    const timeoutId = setTimeout(searchProducts, 150);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/pesquisa?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative flex items-center w-full">
        <input
          type="search"
          placeholder="Buscar lojas, cupons ou produtos..."
          className="w-full pl-12 pr-20 py-3 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          onFocus={() => setShowResults(true)}
        />
        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Resultados da pesquisa */}
      {showResults && (query.length >= 2 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Buscando...</div>
          ) : results ? (
            <div className="divide-y divide-gray-100">
              {/* Produtos */}
              {results.products.length > 0 && (
                <div className="p-2">
                  <h3 className="px-3 py-2 text-sm font-medium text-gray-500">Produtos</h3>
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product.url)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <IoSearch className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Lojas */}
              {results.stores.length > 0 && (
                <div className="p-2">
                  <h3 className="px-3 py-2 text-sm font-medium text-gray-500">Lojas</h3>
                  {results.stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleResultClick(store.url)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <IoSearch className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{store.title}</div>
                        <div className="text-sm text-gray-500">{store.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Cupons */}
              {results.coupons.length > 0 && (
                <div className="p-2">
                  <h3 className="px-3 py-2 text-sm font-medium text-gray-500">Cupons</h3>
                  {results.coupons.map((coupon) => (
                    <button
                      key={coupon.id}
                      onClick={() => handleResultClick(coupon.url)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <IoSearch className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{coupon.title}</div>
                        <div className="text-sm text-gray-500">{coupon.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Nenhum resultado */}
              {results.products.length === 0 &&
                results.stores.length === 0 &&
                results.coupons.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
