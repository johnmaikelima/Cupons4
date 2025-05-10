'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiExternalLink, FiCopy } from 'react-icons/fi';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: {
    title: string;
    description: string;
    code: string;
    type: 'percentage' | 'fixed' | 'freeShipping';
    expiresAt: string;
    url: string;
    affiliateLink: string;
    store: {
      name: string;
      affiliateLink?: string;
    };
  };
  codeAlreadyRevealed?: boolean;
}

export default function CouponModal({ isOpen, onClose, coupon, codeAlreadyRevealed = false }: CouponModalProps) {
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  };

  const handleCopyCode = () => {
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code);
    }
  };

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

  const handleGoToStore = () => {
    // Tenta cada possível fonte de URL em ordem
    const validUrl = getValidUrl(coupon.affiliateLink) || 
                    getValidUrl(coupon.url) || 
                    getValidUrl(coupon.store.affiliateLink);
    
    if (!validUrl) {
      console.error('Nenhum link válido encontrado para o cupom');
      return;
    }

    // Abre o link em uma nova aba
    window.open(validUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {coupon.title}
                </Dialog.Title>

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    {coupon.description}
                  </p>

                  {/* Código do Cupom */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Código do Cupom:</span>
                      <button
                        onClick={handleCopyCode}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <FiCopy className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                    <p className="font-mono text-lg font-medium text-gray-800">
                      {coupon.code}
                    </p>
                  </div>

                  {/* Data de Validade */}
                  <div className="text-sm text-gray-500 mb-6">
                    Válido até {formatDate(coupon.expiresAt)}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700">
                      Copie o código acima e use-o no carrinho de compras da loja para obter seu desconto.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={handleGoToStore}
                      className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <FiExternalLink className="w-5 h-5" />
                      Ir para a Loja
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
