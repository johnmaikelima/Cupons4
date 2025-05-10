'use client';

import { IconType } from 'react-icons';
import { FiCopy, FiExternalLink, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';

interface StoreSidebarProps {
  storeName: string;
  affiliateLink: string;
}

interface StepProps {
  number: number;
  text: string;
  icon: IconType;
}

const Step = ({ number, text, icon: Icon }: StepProps) => (
  <div className="flex items-start space-x-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
      {number}
    </div>
    <div className="flex-1 flex items-center space-x-2">
      <Icon className="w-5 h-5 text-blue-600" />
      <span>{text}</span>
    </div>
  </div>
);

export default function StoreSidebar({ storeName, affiliateLink }: StoreSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Como usar os cupons {storeName}</h3>
      
      <div className="space-y-6">
        <Step
          number={1}
          text="Copie o código do cupom desejado"
          icon={FiCopy}
        />
        
        <Step
          number={2}
          text={`Acesse o site da ${storeName}`}
          icon={FiExternalLink}
        />
        
        <Step
          number={3}
          text="Cole o código no carrinho"
          icon={FiShoppingCart}
        />
        
        <Step
          number={4}
          text="Aproveite seu desconto!"
          icon={FiCheckCircle}
        />
      </div>

      <div className="mt-8">
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Ir para a loja
        </a>
      </div>
    </div>
  );
}
