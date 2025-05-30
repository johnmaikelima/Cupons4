'use client';

import { useState, useEffect } from 'react';

interface Props {
  productName: string;
}

interface ShopeeProduct {
  name: string;
  price: number;
  url: string;
  image: string;
}

export default function ShopeeRecommendations({ productName }: Props) {
  const [products, setProducts] = useState<ShopeeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch(`/api/recommendations/shopee?query=${encodeURIComponent(productName)}`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Erro ao buscar recomendações da Shopee:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [productName]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h3 className="text-xl font-semibold mb-4">Produtos Similares na Shopee</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Produtos Similares na Shopee</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <a
            key={index}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {product.name}
            </h4>
            <p className="text-sm font-semibold text-blue-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(product.price)}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
