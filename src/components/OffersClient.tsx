'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createRoot } from 'react-dom/client';
import { Pagination } from './Pagination';
import { StoreFilter } from './StoreFilter';
import { PriceFilter } from './PriceFilter';
import { dynamicOffers } from '@/lib/dynamicOffers';
import './StoreFilter.css';
import '@/app/styles/loading.css';

const ITEMS_PER_PAGE = 15;

export function OffersClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]); // Armazenar todas as ofertas
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [filteredOffers, setFilteredOffers] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

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
    setCurrentPage(1); // Reset para primeira página ao trocar filtro
  }, [selectedStore, offers, priceRange]);

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);

  const searchParams = useSearchParams();
  const sortParam = searchParams.get('sort') || 'asc';

  // Ordenar e obter ofertas da página atual
  const getCurrentPageOffers = () => {
    // Primeiro ordena todas as ofertas
    const sortedOffers = [...filteredOffers].sort((a, b) => {
      if (sortParam === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

    // Depois pega a página atual das ofertas já ordenadas
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedOffers.slice(startIndex, endIndex);
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
      dynamicOffers.renderOffersToContainer(currentOffers);
    }
  }, [currentPage, filteredOffers, isLoading]);

  // Resetar página quando mudar ordenação
  useEffect(() => {
    setCurrentPage(1);
  }, [sortParam]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave para o topo das ofertas
    document.getElementById('ofertas-dinamicas')?.scrollIntoView({ behavior: 'smooth' });
  };

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
          {/* Container para os produtos */}
          <div id="ofertas-dinamicas" className="offers-grid" />

          {/* Mensagem quando não há ofertas */}
          {filteredOffers.length === 0 && (
            <div className="no-offers">
              {selectedStore ? 
                `Nenhuma oferta encontrada para a loja ${selectedStore}` :
                'Nenhuma oferta encontrada'
              }
            </div>
          )}

          {/* Paginação */}
          {filteredOffers.length > ITEMS_PER_PAGE && (
            <div className="pagination-wrapper">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
