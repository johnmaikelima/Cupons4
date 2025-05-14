'use client';

import { useState } from 'react';
import Image from 'next/image';
import CouponModal from './CouponModal';
import { FiExternalLink, FiScissors } from 'react-icons/fi';

interface CouponCardProps {
  coupon: {
    _id: string;
    title: string;
    description: string;
    code: string;
    type: 'percentage' | 'fixed' | 'freeShipping';
    expiresAt: string;
    url: string;
    affiliateLink: string;
    store: {
      name: string;
      logo: string;
      affiliateLink?: string;
    };
  };
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const getValidUrl = (url: string | undefined | null): string | null => {
    if (!url || url === '#' || url === '') return null;

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.href;
    } catch (e) {
      console.error('URL inválida:', url);
      return null;
    }
  };

  const handleCouponClick = () => {
    const validUrl = getValidUrl(coupon.affiliateLink) || 
                    getValidUrl(coupon.url) || 
                    getValidUrl(coupon.store.affiliateLink);
    
    if (!validUrl) {
      console.error('Nenhum link válido encontrado para o cupom');
      setModalOpen(true);
      return;
    }

    // Dispara evento para o GTM
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'coupon_click',
        coupon_code: coupon.code,
        coupon_title: coupon.title,
        store_name: coupon.store.name,
        discount_type: coupon.type,
        button_type: 'activate'
      });
    }

    window.open(validUrl, '_blank', 'noopener,noreferrer');
    setModalOpen(true);
  };

  const maskCouponCode = (code: string) => {
    if (!code) return '';
    if (code.length <= 3) return code;
    return '***' + code.slice(-3);
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  };

  const getDiscountText = () => {
    switch (coupon.type) {
      case 'percentage':
        return '50% OFF';
      case 'fixed':
        return 'R$ OFF';
      case 'freeShipping':
        return 'FRETE GRÁTIS';
      default:
        return 'DESCONTO';
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-lg overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
        {/* Borda Serrilhada Superior */}
        <div className="absolute top-0 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }} />
        
        {/* Borda Serrilhada Inferior */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }} />

        {/* Tesoura Animada */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <FiScissors className="w-8 h-8 rotate-90" />
        </div>

        <div className="p-4 border-2 border-dashed border-gray-200 m-3 rounded-lg">
          {/* Cabeçalho: Logo + Descrição */}
          <div className="flex gap-3 mb-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-50 flex-shrink-0">
              <Image
                src={coupon.store.logo}
                alt={coupon.store.name}
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm mb-1">{coupon.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600 font-semibold">{coupon.store.name}</span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{getDiscountText()}</span>
              </div>
            </div>
          </div>

          {/* Linha Pontilhada */}
          <div className="border-t-2 border-dashed border-gray-200 -mx-4 mb-3" />

          {/* Código do Cupom + Botão */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-blue-50 rounded-lg p-2">
              <p className="text-[10px] text-blue-600 uppercase font-semibold">Código do Cupom • Válido até {formatDate(coupon.expiresAt)}</p>
              <p className="font-mono text-base font-bold text-blue-800 tracking-wider">
                {maskCouponCode(coupon.code)}
              </p>
            </div>

            {/* Botão de Ativar */}
            <button
              onClick={handleCouponClick}
              className="flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm whitespace-nowrap"
            >
              <FiExternalLink className="w-5 h-5" />
              Ativar Desconto
            </button>
          </div>
        </div>
      </div>

      <CouponModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        coupon={coupon}
        codeAlreadyRevealed={true}
      />
    </>
  );
}
