'use client';

import { motion } from 'framer-motion';
import { FiPercent, FiClock, FiCheck } from 'react-icons/fi';

const benefits = [
  {
    icon: <FiPercent className="w-8 h-8" />,
    title: "Economize em Todas as Compras",
    description: "Nossos cupons garantem os melhores descontos em suas compras online"
  },
  {
    icon: <FiClock className="w-8 h-8" />,
    title: "Cupons Atualizados",
    description: "Nossa equipe verifica e atualiza os cupons diariamente para garantir seu funcionamento"
  },
  {
    icon: <FiCheck className="w-8 h-8" />,
    title: "100% Gratuito",
    description: "Acesse todos os cupons gratuitamente, sem necessidade de cadastro"
  }
];

export default function WhyUseCoupons() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por que usar nossos cupons?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra como nossos cupons podem ajudar você a economizar em suas compras online
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-blue-600 mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
