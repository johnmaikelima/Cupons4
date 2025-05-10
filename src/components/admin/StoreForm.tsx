'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';

interface StoreFormProps {
  initialData?: {
    _id?: string;
    name: string;
    logo: string;
    description: string;
    affiliateLink: string;
    featured: boolean;
  };
}

export default function StoreForm({ initialData }: StoreFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logo || '');
  const [uploadProgress, setUploadProgress] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const logoUrl = formData.get('logo');
    const data = {
      name: formData.get('name'),
      logo: logoUrl ? `${logoUrl}?v=${Date.now()}` : '', // Adiciona timestamp para forçar atualização do cache
      description: description || '', // Usa o estado do editor
      affiliateLink: formData.get('affiliateLink'),
      featured: formData.get('featured') === 'on',
      provider: 'manual' // Define o provider como manual
    };

    try {
      const url = initialData?._id 
        ? `/api/stores/${initialData._id}`
        : '/api/stores';
        
      const res = await fetch(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao salvar loja');
      }

      router.push('/admin/stores');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar loja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Logo da Loja
        </label>
        
        {/* Campo para URL */}
        <div className="flex gap-2">
          <input
            type="url"
            id="logo"
            name="logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="URL do logo"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          {logoUrl && (
            <button
              type="button"
              onClick={() => setLogoUrl('')}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">ou</span>
          </div>
        </div>

        {/* Upload de arquivo */}
        <div className="flex items-center justify-center">
          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
            <span>Fazer upload de imagem</span>
            <input
              id="file-upload"
              name="file"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  setUploadProgress(true);
                  const formData = new FormData();
                  formData.append('file', e.target.files[0]);

                  try {
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData
                    });

                    if (!response.ok) {
                      throw new Error('Erro ao fazer upload');
                    }

                    const data = await response.json();
                    setLogoUrl(data.url);
                  } catch (error) {
                    setError('Erro ao fazer upload da imagem');
                  } finally {
                    setUploadProgress(false);
                  }
                }
              }}
            />
          </label>
        </div>

        {/* Preview da imagem */}
        {logoUrl && (
          <div className="mt-2">
            <img
              src={logoUrl}
              alt="Preview"
              className="h-32 w-32 object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* Indicador de progresso */}
        {uploadProgress && (
          <div className="text-sm text-gray-500 text-center">
            Fazendo upload...
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <Editor
          id="description"
          apiKey="s23aoeifcbl74nkfrufxejuxew0kf1wfbzlzp0b9m7pyh4cp"
          value={description}
          onEditorChange={(content) => setDescription(content)}
          init={{
            height: 400,
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
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
          defaultValue={initialData?.affiliateLink}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          defaultChecked={initialData?.featured}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
          Destaque
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
