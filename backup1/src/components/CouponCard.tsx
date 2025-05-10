'use client';

import { useState } from 'react';
import CouponModal from './CouponModal';
import { FiExternalLink } from 'react-icons/fi';

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
      // Tenta criar um objeto URL para validar
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.href;
    } catch (e) {
      console.error('URL inválida:', url);
      return null;
    }
  };

  const handleCouponClick = () => {
    // Tenta cada possível fonte de URL em ordem
    const validUrl = getValidUrl(coupon.affiliateLink) || 
                    getValidUrl(coupon.url) || 
                    getValidUrl(coupon.store.affiliateLink);
    
    if (!validUrl) {
      console.error('Nenhum link válido encontrado para o cupom');
      // Abre o modal mesmo sem link válido para mostrar o código
      setModalOpen(true);
      return;
    }

    // Abre o link em uma nova aba
    window.open(validUrl, '_blank', 'noopener,noreferrer');
    
    // Abre o modal
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Descrição */}
            <p className="text-gray-600 text-sm">{coupon.description}</p>
            
            {/* Código do Cupom (mascarado) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Código do Cupom:</p>
              <p className="font-mono text-lg font-medium text-gray-800">
                {maskCouponCode(coupon.code)}
              </p>
            </div>

            {/* Data de Validade */}
            <div className="text-sm text-gray-500">
              Válido até {formatDate(coupon.expiresAt)}
            </div>

            {/* Botão de Ativar */}
            <button
              onClick={handleCouponClick}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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
