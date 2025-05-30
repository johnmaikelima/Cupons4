'use client';

import { useEffect, useState } from 'react';
import { searchShopeeRecommendations } from '@/services/shopeeRecommendations';
import Image from 'next/image';

interface ShopeeRecommendation {
  name: string;
  price: number;
  image: string;
  url: string;
  rating: number;
  soldCount: number;
}

interface ShopeeRecommendationsProps {
  productName: string;
}

export default function ShopeeRecommendations({ productName }: ShopeeRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ShopeeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos

    const fetchRecommendations = async () => {
      try {
        // Verifica se o produto está pronto
        if (!productName) {
          console.log('Nome do produto ainda não disponível, aguardando...');
          return;
        }

        console.log('Iniciando busca de recomendações para:', productName);
        setIsLoading(true);
        setError(null);
        
        const data = await searchShopeeRecommendations(productName);
        
        if (mounted) {
          console.log('Dados recebidos:', data);
          setRecommendations(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
        
        if (mounted) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Tentativa ${retryCount} de ${maxRetries}. Tentando novamente em ${retryDelay/1000}s...`);
            setTimeout(fetchRecommendations, retryDelay);
          } else {
            setError('Erro ao carregar recomendações');
            setIsLoading(false);
          }
        }
      }
    };

    if (productName && productName.trim()) {
      console.log('Nome do produto recebido:', productName);
      // Pequeno delay para garantir que o produto está carregado
      setTimeout(fetchRecommendations, 500);
    } else {
      console.log('Nome do produto não fornecido');
    }

    return () => {
      mounted = false;
    };
  }, [productName]);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Produtos Similares na Shopee</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white rounded-lg shadow-sm p-4 space-y-3"
            >
              <div className="bg-gray-200 w-full h-40 rounded-md"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Erro encontrado:', error);
    return null;
  }

  if (recommendations.length === 0) {
    console.log('Nenhuma recomendação encontrada');
    return null;
  }

  console.log('Renderizando', recommendations.length, 'recomendações');

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Produtos Similares na Shopee</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendations.slice(0, 5).map((product, index) => (
          <a
            key={index}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              <div className="mt-2 flex justify-between items-end">
                <p className="text-lg font-bold text-red-600">
                  R$ {product.price.toFixed(2)}
                </p>
                <div className="text-xs text-gray-500">
                  {product.soldCount > 0 && (
                    <p>{product.soldCount} vendidos</p>
                  )}
                  {product.rating > 0 && (
                    <p className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      {product.rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6 text-center">
          <a
            href={recommendations[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            Veja outras ofertas
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
