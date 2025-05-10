'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Store {
  _id: string;
  name: string;
  logo: string;
  slug: string;
}

interface PopularStoresProps {
  stores: Store[];
}

export default function PopularStores({ stores }: PopularStoresProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lojas Populares
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Encontre cupons das principais lojas do Brasil
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {stores.map((store, index) => (
            <motion.div
              key={store._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link 
                href={`/lojas/${store.slug}`}
                className="block bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all group"
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    {store.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
