import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import dynamic from "next/dynamic";
import { connectDB } from '@/lib/mongodb';
import { ComparisonProduct, IComparisonProduct } from '@/models/ComparisonProduct';

const ProductPriceSection = dynamic(() => import('@/components/ProductPriceSection'));
const PriceHistory = dynamic(() => import('@/components/PriceHistory'));
const ShopeeRecommendations = dynamic(() => import('@/components/ShopeeRecommendations'));
const AmazonRecommendations = dynamic(() => import('@/components/AmazonRecommendations'));

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    await connectDB();

    const product = await ComparisonProduct.findOne({ slug }).lean();

    if (!product) {
      return null;
    }

    // Buscar preços da Amazon
    let amazonPrice = null;
    try {
      const amazonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/amazon-comparison/${product.ean}`);
      const amazonData = await amazonResponse.json();
      if (amazonData.price && amazonData.price.price > 0) {
        amazonPrice = amazonData.price;
      }
    } catch (error) {
      console.error('Erro ao buscar preço da Amazon:', error);
    }

    // Combinar todos os preços
    const allPrices = [
      ...(product.prices || []),
      ...(amazonPrice ? [amazonPrice] : [])
    ];

    // Calcular o melhor preço
    const bestPrice = allPrices.length > 0
      ? allPrices.reduce((min, p) => p.price < min ? p.price : min, allPrices[0].price)
      : null;

    // Transformar o _id em string e incluir o melhor preço
    const transformedProduct = {
      ...product,
      _id: product._id.toString(),
      prices: allPrices,
      technicalSpecs: Object.fromEntries(Object.entries(product.technicalSpecs || {})),
      bestPrice
    };

    return transformedProduct as IComparisonProduct & { bestPrice: number | null };
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
                  <Suspense
                    fallback={
                      <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                      </div>
                    }
                  >
                    <ProductPriceSection
                      ean={product.ean}
                      initialPrices={product.prices}
                      currentPrice={product.bestPrice}
                      productId={product._id.toString()}
                      productName={product.name}
                      key={product.ean}
                    />
                  </Suspense>
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
