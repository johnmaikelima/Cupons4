'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { IComparisonProduct } from '@/models/ComparisonProduct';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [product, setProduct] = useState<IComparisonProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        console.log('Buscando produto com slug:', slug);
        const response = await fetch(`/api/admin/comparison-products/${slug}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          const error = await response.json();
          console.log('Erro da API:', error);
          throw new Error(error.error || 'Erro ao carregar produto');
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Erro ao carregar produto:', error);
        setError('Erro ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Carregando produto...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600">
          {error || 'Produto não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>Detalhes do produto</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/comparacao-de-preco/edit/${slug}`)}
            >
              Editar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p>{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">EAN</p>
                  <p>{product.ean || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p>{product.category || 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Slug</p>
                  <p>{product.slug}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Descrição */}
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="whitespace-pre-wrap">{product.description || 'Sem descrição'}</p>
            </div>

            <Separator />

            {/* Preços */}
            <div>
              <h3 className="font-semibold mb-2">Preços</h3>
              {product.prices && product.prices.length > 0 ? (
                <div className="space-y-4">
                  {product.prices.map((price, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-4">
                          {/* Logo da loja (placeholder) */}
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-xl font-bold">
                              {price.storeName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{price.storeName}</p>
                            <p className="text-sm text-gray-500">
                              Última atualização: {new Date(price.lastUpdate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">R$ {price.price.toFixed(2)}</p>
                        {price.url && (
                          <a
                            href={price.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm"
                          >
                            Ver na loja
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum preço cadastrado</p>
              )}
            </div>

            <Separator />

            {/* Especificações Técnicas */}
            {product.technicalSpecs && product.technicalSpecs.size > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Especificações Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(product.technicalSpecs.entries()).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500">{key}</p>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/comparacao-de-preco/edit/${slug}`)}
            >
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
