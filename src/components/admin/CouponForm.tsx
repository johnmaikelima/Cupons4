'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Store {
  _id: string;
  name: string;
}

interface CouponFormProps {
  stores: Store[];
  initialData?: {
    _id?: string;
    title: string;
    description: string;
    expiryDate: string;
    type: 'COUPON' | 'URL_CUPONADA';
    image?: string;
    affiliateLink: string;
    store: string;
    active: boolean;
    code?: string;
  };
}

export default function CouponForm({ stores, initialData }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      expiryDate: formData.get('expiryDate'),
      type: formData.get('type'),
      image: formData.get('image') || undefined,
      affiliateLink: formData.get('affiliateLink'),
      store: formData.get('store'),
      active: formData.get('active') === 'on',
      code: formData.get('code')
    };

    try {
      const url = initialData?._id 
        ? `/api/coupons/${initialData._id}`
        : '/api/coupons';
        
      const res = await fetch(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Erro ao salvar cupom');
      }

      router.push('/admin/coupons');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao salvar cupom:', error);
      setError(error.message || 'Erro ao salvar cupom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          required
          defaultValue={initialData?.description}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
          Data de Validade
        </label>
        <input
          type="date"
          id="expiryDate"
          name="expiryDate"
          required
          defaultValue={initialData?.expiryDate?.split('T')[0]}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Tipo
        </label>
        <select
          id="type"
          name="type"
          required
          defaultValue={initialData?.type}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        >
          <option value="">Selecione um tipo</option>
          <option value="COUPON">Cupom</option>
          <option value="URL_CUPONADA">Link</option>
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          URL da Imagem (opcional)
        </label>
        <input
          type="url"
          id="image"
          name="image"
          defaultValue={initialData?.image}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Código do Cupom
        </label>
        <input
          type="text"
          id="code"
          name="code"
          defaultValue={initialData?.code}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700">
          Link de Afiliado
        </label>
        <input
          type="url"
          id="affiliateLink"
          name="affiliateLink"
          required
          defaultValue={initialData?.affiliateLink}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="store" className="block text-sm font-medium text-gray-700">
          Loja
        </label>
        <select
          id="store"
          name="store"
          required
          defaultValue={initialData?.store}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        >
          <option value="">Selecione uma loja</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          defaultChecked={initialData?.active ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Ativo
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
