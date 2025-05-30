'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IComparisonProduct } from '@/models/ComparisonProduct';

interface Price {
  storeName: string;
  price: number;
  url: string;
  lastUpdate: Date;
}

export default function EditProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<IComparisonProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ean: '',
    category: '',
    images: [] as string[],
    prices: [] as Price[],
    technicalSpecs: new Map<string, string>()
  });
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`);
        const data = await response.json();
        
        if (data.product) {
          setProduct(data.product);
          setFormData({
            name: data.product.name,
            description: data.product.description || '',
            ean: data.product.ean || '',
            category: data.product.category || '',
            images: data.product.images || [],
            prices: data.product.prices || [],
            technicalSpecs: new Map(Object.entries(data.product.technicalSpecs || {}))
          });
          
          // Converter specs para array
          setSpecs(
            Object.entries(data.product.technicalSpecs || {}).map(([key, value]) => ({
              key,
              value: value as string
            }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setError('Erro ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Converter specs array para Map
      const technicalSpecs = Object.fromEntries(
        specs.map(spec => [spec.key, spec.value])
      );

      const response = await fetch(`/api/admin/comparison-products/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          technicalSpecs
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      router.push('/admin/comparacao-de-preco');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro ao atualizar produto');
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error || !product) {
    return <div className="text-red-600">{error || 'Produto não encontrado'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Produto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">EAN</label>
          <input
            type="text"
            value={formData.ean}
            onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Imagens</label>
          <div className="mt-1 flex items-center space-x-2">
            {formData.images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = [...formData.images];
                    newImages.splice(index, 1);
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="url"
              placeholder="URL da imagem"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const url = input.value.trim();
                  if (url) {
                    setFormData({
                      ...formData,
                      images: [...formData.images, url]
                    });
                    input.value = '';
                  }
                }
              }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Pressione Enter para adicionar uma nova imagem</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especificações Técnicas
          </label>
          {specs.map((spec, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                placeholder="Chave"
                className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                placeholder="Valor"
                className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="px-2 py-1 text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpec}
            className="mt-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            + Adicionar Especificação
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/comparacao-de-preco')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
