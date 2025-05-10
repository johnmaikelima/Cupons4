'use client';

import { motion } from 'framer-motion';
import { FiSearch, FiCopy, FiShoppingBag } from 'react-icons/fi';

const steps = [
  {
    icon: <FiSearch className="w-8 h-8" />,
    title: "1. Encontre sua loja",
    description: "Busque pela sua loja favorita ou explore nossas categorias"
  },
  {
    icon: <FiCopy className="w-8 h-8" />,
    title: "2. Copie o cupom",
    description: "Selecione o melhor cupom e clique para copiar o código"
  },
  {
    icon: <FiShoppingBag className="w-8 h-8" />,
    title: "3. Use e economize",
    description: "Cole o código no checkout da loja e aproveite o desconto"
  }
];

export default function HowToUse() {
  return (
    <section className="py-16 md:py-24 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como usar nossos cupons
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Economizar com nossos cupons é fácil e rápido
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Linha conectora */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 -translate-y-1/2 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
