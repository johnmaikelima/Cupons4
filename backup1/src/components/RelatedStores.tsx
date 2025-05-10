'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Store {
  _id: string;
  name: string;
  logo: string;
  slug: string;
  maxDiscount?: number;
}

interface RelatedStoresProps {
  stores: Store[];
  currentStoreId: string;
}

export default function RelatedStores({ stores, currentStoreId }: RelatedStoresProps) {
  // Filtra a loja atual da lista
  const filteredStores = stores.filter(store => store._id !== currentStoreId);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Lojas que podem te interessar
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredStores.map((store, index) => (
          <motion.div
            key={store._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/lojas/${store.slug}`}>
              <div className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col items-center">
                {/* Logo */}
                <div className="relative w-24 h-24 mb-3">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    fill
                    className="object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Nome e Desconto */}
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                    {store.name}
                  </h3>
                  {store.maxDiscount && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      Até {store.maxDiscount}% OFF
                    </span>
                  )}
                </div>

                {/* Overlay de hover */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 rounded-lg transition-colors duration-300" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
