'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/apis/test');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao buscar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teste da API Lomadee</h1>
        <Button 
          onClick={fetchData} 
          disabled={isLoading}
        >
          {isLoading ? 'Importando...' : 'Importar Lojas e Cupons'}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <p className="mb-2">Esta página usa a API de produção da Lomadee com as seguintes configurações:</p>
        <ul className="list-disc list-inside">
          <li>URL Base: <code className="bg-blue-100 px-1 rounded">https://api.lomadee.com/v2</code></li>
          <li>App Token: <code className="bg-blue-100 px-1 rounded">17457627443735fab3c6f</code></li>
          <li>Source ID: <code className="bg-blue-100 px-1 rounded">38359488</code></li>
        </ul>
        <p className="mt-2">Ao clicar em "Importar", os dados serão salvos no banco.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <h2 className="font-bold mb-2">Resultado da Importação:</h2>
            <ul className="list-disc list-inside">
              <li>Lojas salvas: {result.stats.stores}</li>
              <li>Cupons salvos: {result.stats.coupons}</li>
            </ul>
          </div>

          {result.data?.coupons && result.data.coupons.length > 0 && (
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Cupons Importados</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.data.coupons.map((coupon: any) => (
                  <div key={coupon.id} className="border rounded p-3">
                    <div className="font-bold">{coupon.store.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{coupon.description}</div>
                    {coupon.code && (
                      <div className="mb-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {coupon.code}
                        </span>
                      </div>
                    )}
                    {coupon.vigency && (
                      <div className="text-xs text-gray-500">
                        Válido até: {new Date(coupon.vigency).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
