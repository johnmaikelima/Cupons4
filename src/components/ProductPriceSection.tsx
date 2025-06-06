'use client';

import { useState } from 'react';
import ProductPrices from './ProductPrices';
import PriceAlert from './PriceAlert';

interface ProductPriceSectionProps {
  ean: string;
  initialPrices: any[];
  currentPrice: number | null;
  productId: string;
  productName: string;
}

export default function ProductPriceSection({
  ean,
  initialPrices,
  currentPrice: initialCurrentPrice,
  productId,
  productName
}: ProductPriceSectionProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(initialCurrentPrice);

  return (
    <div className="space-y-6">
      <ProductPrices
        ean={ean}
        initialPrices={initialPrices}
        currentPrice={currentPrice}
        onPriceUpdate={setCurrentPrice}
        key={ean}
      />
      <PriceAlert
        productId={productId}
        productName={productName}
        currentPrice={currentPrice}
      />
    </div>
  );
}
