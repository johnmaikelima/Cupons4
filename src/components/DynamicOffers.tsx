'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedProduct, SortDirection } from '@/types/Product';
import './DynamicOffers.css';

interface DynamicOffersProps {
  searchTerm: string;
}

const DynamicOffers: React.FC<DynamicOffersProps> = ({ searchTerm }) => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [sort, setSort] = useState<SortDirection>('asc');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para ordenar produtos
  const sortProducts = (products: UnifiedProduct[], direction: SortDirection) => {
    return [...products].sort((a, b) => {
      if (direction === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch offers');
        }

        // Ordenar produtos antes de salvar no estado
        const sortedProducts = sortProducts(data.products, sort);
        setProducts(sortedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error loading offers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  // Efeito para reordenar produtos quando mudar a direção
  useEffect(() => {
    if (products.length > 0) {
      const sortedProducts = sortProducts(products, sort);
      setProducts(sortedProducts);
    }
  }, [sort]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="loading-message">
        <div className="loading-spinner" />
        <p>Nossa IA está analisando os melhores produtos para você...</p>
        <p>Por favor, aguarde enquanto buscamos as ofertas mais relevantes.</p>
      </div>
    );
  }

  // Ordenar todos os produtos
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'asc') {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  // Paginar os produtos já ordenados
  const itemsPerPage = 25; // Aumentado para mostrar todos os produtos da API da Amazon
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="offers-container">
      <div className="offers-header">
        <div className="offers-stats">
          {sortedProducts.length} produtos encontrados
        </div>
        <div className="offers-sort">
          <select 
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortDirection)}
          >
            <option value="asc">Menor preço</option>
            <option value="desc">Maior preço</option>
          </select>
        </div>
      </div>

      <div className="offers-grid">
        {currentProducts.map((product) => (
          <a 
            key={product.id} 
            href={product.link} 
            className="offer-card" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <div className="offer-store">{product.storeName}</div>
            <div className="offer-mobile-content">
              <img 
                src={product.thumbnail} 
                alt={product.name} 
                className="offer-image" 
              />
              <h3 className="offer-title">{product.name}</h3>
              <div className="offer-price">R$ {product.price.toFixed(2)}</div>
              <div className="offer-button">Conferir oferta</div>
            </div>
          </a>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicOffers;
