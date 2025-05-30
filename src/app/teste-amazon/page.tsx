'use client';

import { useState } from 'react';
import ShopeeRecommendations from '@/components/ShopeeRecommendations';

export default function TesteAmazon() {
  const [ean, setEan] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProduct = async () => {
    if (!ean) {
      setError('Digite um EAN');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(`/api/products/amazon-comparison/${ean}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar produto');
      }

      setResult(data);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Teste de Busca na Amazon por EAN
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Campo de busca */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
              placeholder="Digite o EAN do produto"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={searchProduct}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-semibold text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Resultado da Busca
              </h2>

              {result.price ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {result.price.storeName}
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        R$ {result.price.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Atualizado em:{' '}
                        {new Date(result.price.lastUpdate).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={result.price.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Ver na Amazon
                    </a>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="font-semibold">Link de Afiliado:</p>
                    <p className="mt-1 break-all">{result.price.url}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Nenhum preço disponível para este produto
                </p>
              )}
            </div>
          )}

          {/* Exemplos de EAN */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Exemplos de EAN para teste:
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>7898917647078</li>
              <li>7898994509335</li>
              <li>7898947626333</li>
              <li>7898947626340</li>
            </ul>
          </div>

          {/* Recomendações da Shopee */}
          {result?.price?.title && (
            <div className="mt-8">
              <ShopeeRecommendations productName={result.price.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
