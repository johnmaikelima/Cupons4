'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import CsvUploader from '@/components/admin/CsvUploader';
import { IComparisonProduct } from '@/models/ComparisonProduct';

export default function ComparisonProductsPage() {
  const router = useRouter();
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/comparison-products?page=${page}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar produtos');
      }

      setProducts(data.products || []);
      setTotalPages(Math.ceil(data.total / 15));
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage, loadProducts]);

  const getLowestPrice = (prices: Array<{ price: number }>) => {
    if (!prices || prices.length === 0) return null;
    return Math.min(...prices.map(p => p.price));
  };

  const getStoreWithLowestPrice = (prices: Array<{ price: number; storeName: string }>) => {
    if (!prices || prices.length === 0) return null;
    return prices.reduce((min, current) => {
      return current.price < min.price ? current : min;
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header com título e botões */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Comparação de Preços</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCsvUpload(!showCsvUpload)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              {showCsvUpload ? 'Cancelar Upload' : 'Upload CSV'}
            </button>
            <button
              onClick={() => router.push('/admin/comparacao-de-preco/new')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              + Novo Produto
            </button>
          </div>
        </div>

        {/* Área de upload CSV */}
        {showCsvUpload && (
          <div className="mb-8">
            <CsvUploader
              onUploadComplete={async (products: any[]) => {
                try {
                  console.log('Enviando produtos para API:', products);

                  const response = await fetch('/api/admin/comparison-products/batch', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ products }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || 'Erro ao cadastrar produtos');
                  }

                  // Mostra mensagem de sucesso
                  setUploadError(`Produtos cadastrados com sucesso!\n\nTotal cadastrado: ${data.insertedCount} produtos`);
                  
                  // Recarrega a lista após 2 segundos
                  setTimeout(() => {
                    router.refresh();
                    setShowCsvUpload(false);
                    setUploadError('');
                  }, 2000);

                } catch (error: any) {
                  console.error('Erro ao cadastrar produtos:', error);
                  setUploadError(error.message || 'Erro ao cadastrar produtos. Tente novamente.');
                  setUploadError('Erro ao cadastrar produtos. Tente novamente.');
                }
              }}
              onError={(error) => setUploadError(error)}
            />
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-800 font-semibold mb-2">Erro no processamento:</h3>
                <pre className="text-red-600 text-sm whitespace-pre-wrap font-mono">{uploadError}</pre>
              </div>
            )}
          </div>
        )}

        {/* Lista de produtos */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              Nenhum produto cadastrado
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">EAN: {product.ean}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        EAN: {product.ean || 'N/A'}
                      </span>
                      <div className="space-x-4">
                        <a
                          href={`/admin/comparacao-de-preco/edit/${product.slug}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </a>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Paginação */}
              <div className="flex justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 border rounded-lg bg-gray-50">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próxima
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
