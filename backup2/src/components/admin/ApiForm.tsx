'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ApiFormProps {
  initialData?: {
    _id?: string;
    name: string;
    provider: string;
    apiKey: string;
    publisherId: string;
    currency: string;
    isActive: boolean;
  };
}

const API_PROVIDERS = [
  { 
    value: 'lomadee', 
    label: 'Lomadee',
    fields: [
      { name: 'apiKey', label: 'App Token', type: 'text', required: true },
      { name: 'publisherId', label: 'Source ID', type: 'text', required: true }
    ]
  },
  { 
    value: 'awin', 
    label: 'Awin',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'publisherId', label: 'Publisher ID', type: 'text', required: true }
    ]
  }
];

const CURRENCIES = [
  { value: 'BRL', label: 'Real (BRL)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'Libra (GBP)' },
  { value: 'USD', label: 'Dólar (USD)' }
];

export default function ApiForm({ initialData }: ApiFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(initialData?.provider || '');

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const provider = formData.get('provider') as string;
    
    // Garantir que o nome seja igual ao provider (capitalizado)
    const name = provider.charAt(0).toUpperCase() + provider.slice(1);

    const data = {
      name,
      provider: formData.get('provider'),
      apiKey: formData.get('apiKey'),
      publisherId: formData.get('publisherId'),
      currency: formData.get('currency'),
      isActive: formData.get('isActive') === 'on'
    };

    try {
      const url = initialData?._id 
        ? `/api/apis/${initialData._id}`
        : '/api/apis';
        
      const res = await fetch(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Erro ao salvar API');
      }

      router.push('/admin/apis');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao salvar API:', error);
      setError(error.message || 'Erro ao salvar API');
    } finally {
      setLoading(false);
    }
  };

  // Encontra o provedor selecionado
  const provider = API_PROVIDERS.find(p => p.value === selectedProvider);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Provedor
        </label>
        <select
          id="provider"
          name="provider"
          required
          value={selectedProvider}
          onChange={handleProviderChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        >
          <option value="">Selecione um provedor</option>
          {API_PROVIDERS.map(provider => (
            <option key={provider.value} value={provider.value}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>

      {provider && provider.fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            required={field.required}
            defaultValue={initialData?.[field.name as keyof typeof initialData] as string}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
          />
        </div>
      ))}

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Moeda
        </label>
        <select
          id="currency"
          name="currency"
          required
          defaultValue={initialData?.currency || 'BRL'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked={initialData?.isActive ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
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
