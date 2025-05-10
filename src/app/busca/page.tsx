'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiTag, FiShoppingBag } from 'react-icons/fi';
import { type Store } from '../../models/Store';
import { type Coupon } from '../../models/Coupon';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Buscar lojas
        const storesRes = await fetch(`/api/stores/search?q=${encodeURIComponent(query)}`);
        const storesData = await storesRes.json();
        setStores(storesData);

        // Buscar cupons
        const couponsRes = await fetch(`/api/coupons/search?q=${encodeURIComponent(query)}`);
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      } catch (error) {
        console.error('Erro ao buscar resultados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Digite algo para buscar
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resultados para "{query}"
        </h1>
        <p className="text-gray-600 mb-8">
          {loading
            ? 'Buscando...'
            : `Encontramos ${stores.length} lojas e ${coupons.length} cupons`}
        </p>

        {/* Lojas */}
        {stores.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiShoppingBag className="w-6 h-6" />
              Lojas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/lojas/${store.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={store.logo}
                        alt={store.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600">
                        {store.couponsCount || 0} cupons disponíveis
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cupons */}
        {coupons.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiTag className="w-6 h-6" />
              Cupons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                        {coupon.type}
                      </span>
                      <h3 className="font-semibold text-gray-900">{coupon.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {coupon.description}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t">
                      <button
                        onClick={() => {/* Implementar cópia do cupom */}}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Copiar Cupom
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && stores.length === 0 && coupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Nenhum resultado encontrado para sua busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SearchResults />
    </Suspense>
  );
}
