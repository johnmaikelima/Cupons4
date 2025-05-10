'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';

interface SiteConfigFormProps {
  config: {
    _id: string;
    logo: string;
    name: string;
  };
}

export default function SiteConfigForm({ config }: SiteConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(config.logo);
  const [name, setName] = useState(config.name);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setUploadError('');

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Apenas imagens são permitidas');
      return;
    }

    // Criar FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      setLogo(data.url);
    } catch (error) {
      console.error('Erro:', error);
      setUploadError('Erro ao fazer upload do arquivo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo,
          name
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      router.refresh();
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <div className="space-y-6">
        {/* Logo Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo Atual
          </label>
          <div className="relative h-20 w-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={logo}
              alt="Logo do site"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload do Logo
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FiUpload className="w-5 h-5 mr-2" />
            <span>Clique para fazer upload</span>
          </button>
          {uploadError && (
            <p className="mt-1 text-sm text-red-600">{uploadError}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Tamanho recomendado: 128x32px, PNG ou SVG com fundo transparente
          </p>
        </div>

        {/* Logo URL Manual */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
            URL do Logo (opcional)
          </label>
          <input
            type="text"
            id="logo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            placeholder="https://..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Cole a URL da imagem ou use o botão de upload acima
          </p>
        </div>

        {/* Site Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Site
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </form>
  );
}
