'use client';

import { useState, useEffect } from 'react';
import './PriceFilter.css';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

export function PriceFilter({ minPrice, maxPrice, onPriceChange }: PriceFilterProps) {
  const [currentMin, setCurrentMin] = useState(minPrice);
  const [currentMax, setCurrentMax] = useState(maxPrice);

  useEffect(() => {
    setCurrentMin(minPrice);
    setCurrentMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= currentMax) {
      setCurrentMin(value);
      onPriceChange(value, currentMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= currentMin) {
      setCurrentMax(value);
      onPriceChange(currentMin, value);
    }
  };

  return (
    <div className="price-filter">
      <h3 className="filter-title">Filtrar por preço</h3>
      <div className="price-inputs">
        <div className="price-range">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={currentMin}
            onChange={handleMinChange}
            className="range-input min-range"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={currentMax}
            onChange={handleMaxChange}
            className="range-input max-range"
          />
        </div>
        <div className="price-values">
          <span>R$ {currentMin.toFixed(2)}</span>
          <span>R$ {currentMax.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
