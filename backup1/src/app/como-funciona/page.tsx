import { Metadata } from 'next';
import { FiSearch, FiCopy, FiShoppingBag } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Como Funciona | LinkCompra',
  description: 'Aprenda como usar os cupons de desconto da LinkCompra em 3 passos simples.',
};

const steps = [
  {
    icon: <FiSearch className="w-8 h-8" />,
    title: "Encontre sua loja",
    description: "Use nossa busca para encontrar a loja desejada ou navegue por categorias.",
    details: [
      "Digite o nome da loja na barra de busca",
      "Explore nossas categorias de lojas",
      "Veja as lojas em destaque na página inicial"
    ]
  },
  {
    icon: <FiCopy className="w-8 h-8" />,
    title: "Copie o cupom",
    description: "Selecione o cupom desejado e copie o código com apenas um clique.",
    details: [
      "Verifique a validade e condições do cupom",
      "Clique no botão 'Copiar código'",
      "O código será copiado automaticamente"
    ]
  },
  {
    icon: <FiShoppingBag className="w-8 h-8" />,
    title: "Use e economize",
    description: "Cole o código no carrinho da loja e aproveite o desconto.",
    details: [
      "Vá para o site da loja",
      "Cole o código no campo de cupom",
      "Confira o desconto aplicado"
    ]
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Como Funciona</h1>
          <p className="text-xl text-blue-100">
            Aprenda como usar nossos cupons de desconto em 3 passos simples
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-blue-600">{step.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {index + 1}. {step.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dicas importantes</h2>
            <ul className="space-y-3">
              <li className="text-gray-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Verifique sempre a data de validade dos cupons
              </li>
              <li className="text-gray-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Leia as condições de uso antes de utilizar
              </li>
              <li className="text-gray-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Alguns cupons podem ter valor mínimo de compra
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
