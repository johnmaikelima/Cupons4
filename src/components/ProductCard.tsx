import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    description?: string;
    prices?: Array<{
      price: number;
      storeName: string;
      url: string;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Encontra o menor preço
  const lowestPrice = product.prices?.reduce((min, price) => 
    price.price < min ? price.price : min,
    product.prices[0]?.price || 0
  );

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Imagem */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sem imagem
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {lowestPrice > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-gray-500">A partir de</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(lowestPrice)}
            </span>
          </div>
        )}

        {product.prices && product.prices.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Em {product.prices.length} {product.prices.length === 1 ? 'loja' : 'lojas'}
          </div>
        )}
      </div>
    </Link>
  );
}
