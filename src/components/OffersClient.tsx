'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createRoot } from 'react-dom/client';
import { Pagination } from './Pagination';
import { StoreFilter } from './StoreFilter';
import { PriceFilter } from './PriceFilter';
import { TopSortFilter } from './TopSortFilter';
import { dynamicOffers } from '@/lib/dynamicOffers';
import './StoreFilter.css';
import '@/app/styles/loading.css';

const INITIAL_DISPLAY = 20;

export function OffersClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]); // Armazenar todas as ofertas
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [filteredOffers, setFilteredOffers] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  type SortDirection = 'asc' | 'desc' | 'relevance';
  const [sortType, setSortType] = useState<SortDirection>('relevance');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // Modificar a função renderOffers para retornar as ofertas em vez de renderizar
        const loadedOffers = await dynamicOffers.getOffers();
        setOffers(loadedOffers);
        setFilteredOffers(loadedOffers); // Inicializa as ofertas filtradas com todas as ofertas
      } finally {
        setIsLoading(false);
      }
    };

    loadOffers();
  }, []);

  // Calcular o total de páginas
  // Agrupa ofertas por loja
  const getStoresList = () => {
    const storesMap = new Map<string, number>();
    offers.forEach(offer => {
      const store = offer.storeName || 'Outras';
      storesMap.set(store, (storesMap.get(store) || 0) + 1);
    });
    return Array.from(storesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Filtra ofertas pela loja selecionada e preço
  useEffect(() => {
    let filtered = offers;

    // Filtro por loja
    if (selectedStore) {
      filtered = filtered.filter(offer => (offer.storeName || 'Outras') === selectedStore);
    }

    // Filtro por preço
    if (priceRange) {
      filtered = filtered.filter(
        offer => offer.price >= priceRange.min && offer.price <= priceRange.max
      );
    }

    setFilteredOffers(filtered);
    // Atualiza as ofertas filtradas
  }, [selectedStore, offers, priceRange]);




  // Ordenar todas as ofertas
  const getSortedOffers = () => {
    return [...filteredOffers].sort((a, b) => {
      if (sortType === 'relevance') {
        // Ordenar por avaliação (rating), produtos sem avaliação vão para o final
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      } else if (sortType === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  };

  // Obter ofertas ordenadas com limite
  const getCurrentPageOffers = () => {
    const sortedOffers = getSortedOffers();
    return sortedOffers.slice(0, displayCount);
  };

  // Renderizar o filtro de lojas
  useEffect(() => {
    const filtroContainer = document.getElementById('filtro-lojas');
    if (filtroContainer && offers.length > 0) {
      // Limpar o container
      filtroContainer.innerHTML = '';
      
      // Criar elemento para o filtro
      const filterElement = document.createElement('div');
      filtroContainer.appendChild(filterElement);
      
      // Calcular preço mínimo e máximo
      const prices = offers.map(offer => offer.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));

      // Inicializar o range de preços se ainda não foi definido
      if (!priceRange) {
        setPriceRange({ min: minPrice, max: maxPrice });
      }

      // Renderizar os componentes
      const root = createRoot(filterElement);
      root.render(
        <div className="filters-container">
          <StoreFilter
            stores={getStoresList()}
            selectedStore={selectedStore}
            onStoreSelect={setSelectedStore}
          />
          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => setPriceRange({ min, max })}
          />
        </div>
      );

      // Limpar o container de ofertas para evitar duplicação
      const offersContainer = document.getElementById('ofertas-dinamicas');
      if (offersContainer) {
        offersContainer.innerHTML = '';
      }
    }
  }, [offers, selectedStore]);

  // Renderizar ofertas da página atual
  useEffect(() => {
    if (!isLoading && filteredOffers.length > 0) {
      const currentOffers = getCurrentPageOffers();
      console.log(`Mostrando ${currentOffers.length} de ${filteredOffers.length} produtos`);
      dynamicOffers.renderOffersToContainer(currentOffers, sortType);
    }
  }, [filteredOffers, isLoading, sortType, displayCount]);





  return (
    <div>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Nossa IA está analisando os melhores produtos para você...</p>
          <p>Por favor, aguarde enquanto buscamos as ofertas mais relevantes.</p>
        </div>
      ) : (
        <>
          {/* Filtro de ordenação e total de produtos */}
          <TopSortFilter
            totalItems={filteredOffers.length}
            sortType={sortType}
            onSortChange={setSortType}
          />

          {/* Container para os produtos */}
          <div id="ofertas-dinamicas" className="offers-grid" />

          {/* Botão Carregar Mais */}
          {filteredOffers.length > displayCount && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '2rem 0',
              padding: '1rem'
            }}>
              <button 
                onClick={() => {
                  setDisplayCount(prev => prev + INITIAL_DISPLAY);
                  // Scroll suave até o último produto
                  const grid = document.querySelector('.offers-grid');
                  if (grid) {
                    const lastProduct = grid.lastElementChild;
                    lastProduct?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#357abd'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a90e2'}
              >
                Carregar mais produtos ({filteredOffers.length - displayCount} restantes)
              </button>
            </div>
          )}

          {/* Mensagem quando não há ofertas */}
          {filteredOffers.length === 0 && (
            <div className="no-offers">
              {selectedStore ? 
                `Nenhuma oferta encontrada para a loja ${selectedStore}` :
                'Nenhuma oferta encontrada'
              }
            </div>
          )}


        </>
      )}
    </div>
  );
}
