'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface ProductForm {
  name: string;
  ean: string;
  category: string;
  description: string;
  images: string[];
  technicalSpecs: { [key: string]: string };
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [form, setForm] = useState<ProductForm>({
    name: '',
    ean: '',
    category: '',
    description: '',
    images: [],
    technicalSpecs: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/comparison-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          prices: []
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar produto');
      }

      router.push('/admin/comparacao-de-preco');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = () => {
    if (newImage && !form.images.includes(newImage)) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addSpec = () => {
    if (newSpecKey && newSpecValue) {
      setForm(prev => ({
        ...prev,
        technicalSpecs: {
          ...prev.technicalSpecs,
          [newSpecKey]: newSpecValue
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpec = (key: string) => {
    setForm(prev => {
      const newSpecs = { ...prev.technicalSpecs };
      delete newSpecs[key];
      return {
        ...prev,
        technicalSpecs: newSpecs
      };
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Novo Produto</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Voltar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  EAN *
                </label>
                <input
                  type="text"
                  required
                  value={form.ean}
                  onChange={e => setForm(prev => ({ ...prev, ean: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Imagens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagens
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newImage}
                  onChange={e => setNewImage(e.target.value)}
                  placeholder="URL da imagem"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {form.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificações Técnicas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSpecKey}
                  onChange={e => setNewSpecKey(e.target.value)}
                  placeholder="Característica"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newSpecValue}
                  onChange={e => setNewSpecValue(e.target.value)}
                  placeholder="Valor"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addSpec}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(form.technicalSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpec(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
