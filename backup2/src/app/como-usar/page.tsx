import HowToUse from '@/components/home/HowToUse';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Como Usar Nossos Cupons | Cupons',
  description: 'Aprenda como usar nossos cupons de desconto em 3 passos simples e economize em suas compras online.',
};

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Como Usar Nossos Cupons</h1>
          <p className="text-xl text-blue-100">
            Aprenda como economizar em suas compras com nossos cupons de desconto
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Por que usar cupons de desconto?</h2>
            <p className="text-gray-600 mb-4">
              Usar cupons de desconto é uma maneira inteligente de economizar em suas compras online. 
              Com nossos cupons, você pode conseguir descontos exclusivos, frete grátis e outras 
              vantagens em diversas lojas.
            </p>
            <p className="text-gray-600">
              Todos os nossos cupons são verificados diariamente para garantir que funcionem 
              corretamente, e o melhor de tudo: é totalmente gratuito!
            </p>
          </div>

          <HowToUse />

          <div className="bg-white rounded-xl shadow-md p-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Dicas importantes</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Verifique a data de validade do cupom antes de usar</li>
              <li>Leia as condições de uso do cupom na descrição</li>
              <li>Alguns cupons podem ter valor mínimo de compra</li>
              <li>Em caso de dúvidas, entre em contato com a loja</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
