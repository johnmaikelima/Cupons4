'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const loadProducts = useCallback(async (page: number, query?: string) => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/comparison-products', window.location.origin);
      url.searchParams.set('page', page.toString());
      if (query) url.searchParams.set('q', query);

      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.products) {
        console.log('Produtos carregados:', data.products.map((p: any) => ({ name: p.name, slug: p.slug })));
      }
      
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Cancela o timeout anterior se existir
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Cria um novo timeout para debounce
    const timeout = setTimeout(() => {
      loadProducts(1, query);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const response = await fetch(`/api/admin/comparison-products/${slug}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir produto');
      }

      // Recarrega a lista de produtos
      loadProducts(currentPage, searchQuery);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto. Tente novamente.');
    }
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Comparação de Preços</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCsvUpload(!showCsvUpload)}
                className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                {showCsvUpload ? 'Cancelar Upload' : 'Upload CSV'}
              </button>
              <button
                onClick={() => router.push('/admin/comparacao-de-preco/new')}
                className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                + Novo Produto
              </button>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    {product.images && product.images[0] ? (
                      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}

                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">EAN: {product.ean || 'N/A'}</p>
                      {product.category && (
                        <p className="text-sm text-gray-600">Categoria: {product.category}</p>
                      )}
                      {product.prices && product.prices.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Preços:</p>
                          <div className="space-y-1">
                            {product.prices.map((price: any, index: number) => (
                              <p key={index} className="text-sm text-gray-600">
                                {price.storeName}: R$ {price.price.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <a
                        href={`/admin/comparacao-de-preco/edit/${product.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        onClick={(e) => {
                          console.log('Produto clicado:', {
                            name: product.name,
                            slug: product.slug,
                            _id: product._id
                          });
                        }}
                      >
                        Editar
                      </a>
                      <button
                        onClick={() => handleDelete(product.slug)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Excluir
                      </button>
                    </div>
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
