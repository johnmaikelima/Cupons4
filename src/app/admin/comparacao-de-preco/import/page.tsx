'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Papa from 'papaparse';

export default function ImportProductsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setProgress(0);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const totalRows = results.data.length;
          let processedRows = 0;

          for (const row of results.data) {
            if (!row.name || !row.ean) continue;

            const product = {
              name: row.name,
              images: row.images ? row.images.split(',').map((url: string) => url.trim()) : [],
              description: row.description || '',
              technicalSpecs: row.technicalSpecs ? JSON.parse(row.technicalSpecs) : {},
              ean: row.ean,
              category: row.category || 'Sem categoria',
              prices: []
            };

            try {
              const response = await fetch('/api/admin/comparison-products', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
              });

              if (!response.ok) {
                const data = await response.json();
                console.warn(`Erro ao importar produto ${product.name}:`, data.error);
              }
            } catch (error) {
              console.error(`Erro ao importar produto ${product.name}:`, error);
            }

            processedRows++;
            setProgress(Math.round((processedRows / totalRows) * 100));
          }

          // Redireciona após concluir
          router.push('/admin/comparacao-de-preco');
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setError('Erro ao processar o arquivo. Verifique o formato e tente novamente.');
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error('Erro ao ler arquivo:', error);
        setError('Erro ao ler o arquivo. Verifique o formato e tente novamente.');
        setIsLoading(false);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Importar Produtos</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Formato do CSV</h2>
              <p className="text-sm text-gray-600 mb-4">
                O arquivo CSV deve conter as seguintes colunas:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>name (obrigatório)</li>
                <li>ean (obrigatório)</li>
                <li>images (opcional, URLs separadas por vírgula)</li>
                <li>description (opcional)</li>
                <li>technicalSpecs (opcional, JSON string)</li>
                <li>category (opcional)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Escolher arquivo</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
                />
              </label>

              {isLoading && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-600 rounded transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Processando... {progress}%
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={() => router.push('/admin/comparacao-de-preco')}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
