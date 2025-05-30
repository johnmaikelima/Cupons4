import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ProductPrices = dynamic(() => import('@/components/ProductPrices'));
const PriceHistory = dynamic(() => import('@/components/PriceHistory'));
const ShopeeRecommendations = dynamic(() => import('@/components/ShopeeRecommendations'));
const AmazonRecommendations = dynamic(() => import('@/components/AmazonRecommendations'));
import { IComparisonProduct } from '@/models/ComparisonProduct';

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/${slug}`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.product as IComparisonProduct;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Card principal com informações do produto */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Coluna da imagem */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder.jpg'}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Coluna das informações */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="space-y-4">
                {product.ean && (
                  <p className="text-gray-600">
                    <span className="font-semibold">EAN:</span> {product.ean}
                  </p>
                )}

                {/* Preços */}
                <div className="mt-6">
                  <Suspense fallback={<div>Carregando preços...</div>}>
                    <ProductPrices ean={product.ean} initialPrices={product.prices} />
                  </Suspense>
                </div>

                {/* Botões de ação */}
                <div className="mt-8 flex space-x-4">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Comparar Preços
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Ver Ofertas
                  </button>
                </div>

                {/* Especificações Técnicas */}
                {product.technicalSpecs && product.technicalSpecs.size > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Especificações Técnicas</h2>
                    <dl className="grid grid-cols-1 gap-4">
                      {Array.from(product.technicalSpecs.entries()).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-200 pb-2">
                          <dt className="font-semibold text-gray-700">{key}</dt>
                          <dd className="text-gray-600">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Descrição do Produto */}
        {product.description && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4">Descrição do Produto</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        )}

        {/* Histórico de Preços */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Histórico de Preços</h2>
          <Suspense fallback={<div>Carregando histórico...</div>}>
            <PriceHistory ean={product.ean} prices={product.prices} />
          </Suspense>
        </div>

        {/* Card de recomendações da Amazon */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
          <Suspense fallback={<div>Carregando recomendações...</div>}>
            <AmazonRecommendations productName={product.name} />
          </Suspense>
        </div>

        {/* Card de recomendações da Shopee */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
          <Suspense fallback={<div>Carregando recomendações...</div>}>
            <ShopeeRecommendations productName={product.name} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
