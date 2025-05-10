'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Economize em suas compras com nossos cupons
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Descubra as melhores ofertas e cupons de desconto das principais lojas do Brasil
          </p>
          <Link 
            href="/lojas"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full 
            font-semibold text-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg"
          >
            Ver todos os cupons
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
