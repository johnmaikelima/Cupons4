'use client';

import Image from 'next/image';
import Link from 'next/link';

interface StoreCardProps {
  store: {
    _id: string;
    name: string;
    logo: string;
    description: string;
    slug: string;
  };
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/lojas/${store.slug}`}>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src={store.logo}
              alt={store.name}
              fill
              className="object-contain"
            />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {store.name}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {store.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
