'use client';

import { useState, useEffect } from 'react';

interface Props {
  ean: string;
  initialPrices: Array<{
    storeName: string;
    price: number;
    url: string;
    lastUpdate: Date;
  }>;
}

export default function ProductPrices({ ean, initialPrices }: Props) {
  const [prices, setPrices] = useState(initialPrices);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch(`/api/products/prices/${ean}`);
        const data = await response.json();
        
        // Combina preços iniciais com novos preços
        const filteredPrices = initialPrices.filter(p => !p.lastImportId);
        const allPrices = [...filteredPrices, ...data.prices];
        
        // Ordena por preço
        const sortedPrices = allPrices.sort((a, b) => a.price - b.price);
        setPrices(sortedPrices);
      } catch (error) {
        console.error('Erro ao buscar preços:', error);
      }
    }

    if (ean) {
      fetchPrices();
    }
  }, [ean, initialPrices]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Preços em Lojas Parceiras</h3>
      <div className="space-y-2">
        {prices.map((price, index) => (
          <a
            key={`${price.storeName}-${index}`}
            href={price.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-700">{price.storeName}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(price.price)}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(price.lastUpdate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
