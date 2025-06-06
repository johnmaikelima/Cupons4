'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoTicketOutline, IoChevronDownOutline } from 'react-icons/io5';

interface Store {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export default function CouponsMenu() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetch('/api/stores')
      .then(res => res.json())
      .then(data => {
        if (data.stores) {
          setStores(data.stores.slice(0, 10)); // Pegamos apenas as 10 primeiras lojas
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="relative group">
      <Link
        href="/cupons"
        className="flex items-center gap-2 px-4 h-full text-white hover:text-white hover:bg-blue-700 transition-colors font-medium"
      >
        <IoTicketOutline className="w-5 h-5" />
        <span>Cupons de Desconto</span>
        <IoChevronDownOutline className="w-4 h-4" />
      </Link>

      {/* Dropdown */}
      <div className="absolute top-full right-0 w-72 mt-1 py-2 bg-white rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="px-4 py-2 border-b border-gray-100">
          <Link
            href="/cupons"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Ver Todos os Cupons
          </Link>
        </div>
        
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/lojas/${store.slug}`}
            className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors text-sm"
          >
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <IoTicketOutline className="w-5 h-5" />
            )}
            <span>{store.name}</span>
          </Link>
        ))}

        <div className="px-4 py-2 border-t border-gray-100">
          <Link
            href="/lojas"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Ver Todas as Lojas
          </Link>
        </div>
      </div>
    </div>
  );
}
