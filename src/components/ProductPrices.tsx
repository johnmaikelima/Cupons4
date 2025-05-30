'use client';

import { useEffect, useState } from 'react';

interface Price {
  storeName: string;
  price: number;
  url: string;
  lastUpdate: Date;
}

interface ProductPricesProps {
  ean: string;
  initialPrices?: Price[];
}

export default function ProductPrices({ ean, initialPrices = [] }: ProductPricesProps) {
  const [prices, setPrices] = useState<Price[]>(initialPrices);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar preços da Amazon
        const amazonResponse = await fetch(`/api/products/amazon-comparison/${ean}`);
        const amazonData = await amazonResponse.json();

        // Buscar outros preços
        const pricesResponse = await fetch(`/api/products/prices/${ean}`);
        const pricesData = await pricesResponse.json();

        // Combinar todos os preços
        const allPrices = [
          ...(amazonData.price ? [amazonData.price] : []),
          ...(pricesData.prices || [])
        ];

        setPrices(allPrices);

        // Se tem preços válidos, salva o menor no histórico
        if (allPrices.length > 0) {
          const validPrices = allPrices.filter(p => p.price && p.price > 0 && !isNaN(p.price));
          
          if (validPrices.length > 0) {
            const lowestPrice = Math.min(...validPrices.map(p => p.price));

            // Busca histórico existente
            const historyResponse = await fetch(`/api/products/price-history/${ean}`);
            const historyData = await historyResponse.json();
            let history = historyData.history || [];

            // Verifica se o preço atual é diferente do último registrado
            const lastPrice = history.length > 0 ? history[history.length - 1].price : null;
            
            if (lastPrice !== lowestPrice) {
              // Adiciona o novo preço ao histórico
              history.push({
                date: new Date().toISOString(),
                price: lowestPrice
              });

              // Salva o histórico atualizado
              await fetch(`/api/products/price-history/${ean}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ history })
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar preços:', error);
        setError('Erro ao carregar preços');
      } finally {
        setIsLoading(false);
      }
    };

    if (ean) {
      fetchPrices();
    }
  }, [ean]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Nenhum preço disponível no momento
      </div>
    );
  }

  // Ordenar preços do menor para o maior
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices[0];

  return (
    <div className="space-y-6">
      {/* Melhor Preço */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-semibold text-green-800">Melhor Preço:</p>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              R$ {lowestPrice.price.toFixed(2)}
            </p>
            <p className="text-sm text-green-700">{lowestPrice.storeName}</p>
          </div>
          <a
            href={lowestPrice.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Comprar Agora
          </a>
        </div>
      </div>

      {/* Lista de Preços */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Comparação de Preços
          <span className="text-sm font-normal text-gray-500 ml-2">
            em {prices.length} {prices.length === 1 ? 'loja' : 'lojas'}
          </span>
        </h2>
        <div className="space-y-4">
          {sortedPrices.map((price, index) => (
            <div
              key={`${price.storeName}-${index}`}
              className={`p-4 rounded-lg border ${
                index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    {price.storeName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Atualizado em: {new Date(price.lastUpdate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {price.price.toFixed(2)}
                  </p>
                  <a
                    href={price.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Ver na Loja
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
