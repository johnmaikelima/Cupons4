'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiBookOpen, FiStar } from 'react-icons/fi';

interface HomeSidebarProps {
  stores: Array<{
    _id: string;
    name: string;
    logo: string;
    slug: string;
  }>;
}

export default function HomeSidebar({ stores }: HomeSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Links de navegação */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <nav className="space-y-4">
          <Link
            href="/como-usar"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Como usar nossos cupons</h3>
              <p className="text-sm text-gray-600">Aprenda a economizar em 3 passos</p>
            </div>
          </Link>

          <Link
            href="/cupons-exclusivos"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
              <FiStar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cupons Exclusivos</h3>
              <p className="text-sm text-gray-600">Ofertas especiais só encontradas aqui</p>
            </div>
          </Link>
        </nav>
      </div>

      {/* Lojas em destaque */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lojas em Destaque</h2>
        <div className="grid grid-cols-1 gap-4">
          {stores.map((store) => (
            <Link
              key={store._id}
              href={`/lojas/${store.slug}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="relative w-12 h-12">
                <Image
                  src={store.logo}
                  alt={store.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="font-medium text-gray-900">{store.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
