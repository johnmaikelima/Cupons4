'use client';

import { useState } from 'react';

export default function ImportPage() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus('loading');
    setMessage('Importando produtos da URL...');

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar produtos');
      }

      setStatus('success');
      setMessage(`${data.count} produtos importados com sucesso!`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao importar produtos');
    }
  };

  const handleImportFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('loading');
    setMessage('Importando produtos do arquivo...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar produtos');
      }

      setStatus('success');
      setMessage(`${data.count} produtos importados com sucesso!`);
      setFile(null);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao importar produtos');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Importar Produtos do CSV</h1>

      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <div className="grid gap-8">
          {/* Importação por URL */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Importar por URL</h2>
            <form onSubmit={handleImportUrl} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL do arquivo CSV
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo.com/produtos.csv"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  status === 'loading'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {status === 'loading' ? 'Importando...' : 'Importar da URL'}
              </button>
            </form>
          </div>

          {/* Importação por arquivo local */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Importar arquivo local</h2>
            <form onSubmit={handleImportFile} className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo CSV
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !file}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  status === 'loading' || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {status === 'loading' ? 'Importando...' : 'Importar arquivo'}
              </button>
            </form>
          </div>
        </div>

        {message && (
          <div
            className={`mt-8 p-4 rounded-md ${
              status === 'success'
                ? 'bg-green-50 text-green-800'
                : status === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-blue-50 text-blue-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Instruções</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>O arquivo CSV deve conter os seguintes campos:</li>
            <ul className="ml-6 list-disc list-inside space-y-1 text-sm">
              <li>aw_deep_link (Link de afiliado do produto)</li>
              <li>merchant_image_url (URL da imagem do produto)</li>
              <li>product_name (Nome do produto)</li>
              <li>merchant_category (Categoria)</li>
              <li>store_price (Preço)</li>
              <li>ean (EAN)</li>
              <li>rating (Nota)</li>
            </ul>
            <li>O arquivo deve estar no formato CSV</li>
            <li>O processo pode demorar alguns minutos dependendo do tamanho do arquivo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
