interface Offer {
  name: string;
  thumbnail: string;
  price: number;
  link: string;
  storeName: string;
  rating?: number;
  average_rating?: number;
  reviewCount?: number;
  description?: string;
  merchant_name?: string;
  currency?: string;
  ean?: string;
}

type SortDirection = 'asc' | 'desc' | 'relevance';

interface CacheItem {
  offers: Offer[];
  timestamp: number;
  keyword: string;
}

class DynamicOffers {
  private readonly appToken = '1746388081270978c0396';
  private readonly sourceId = '38359488';
  private readonly apiUrl = 'https://api.lomadee.com/v3';
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutos em ms
  private readonly cachePrefix = 'offers_cache_';

  private async fetchLomadeeOffers(keyword: string, size: number = 30): Promise<Offer[]> {
    try {
      const url = `${this.apiUrl}/${this.appToken}/offer/_search?sourceId=${this.sourceId}&keyword=${encodeURIComponent(keyword)}&size=${size}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', data);
      
      if (data.requestInfo?.status === 'PERMISSION_DENIED') {
        console.error('Erro de permissão:', data.requestInfo.message);
        throw new Error(`Erro de permissão: ${data.requestInfo.message}`);
      }

      if (!data.offers || !Array.isArray(data.offers)) {
        console.log('Nenhuma oferta encontrada nos dados:', data);
        return [];
      }

      return data.offers
        .filter((offer: any) => offer.price > 0)
        .map((offer: any) => ({
          name: offer.name,
          thumbnail: offer.thumbnail,
          price: offer.price,
          link: offer.link,
          storeName: offer.store?.name || ''
        }));
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  }

  private async fetchMongoDBOffers(keyword: string): Promise<Offer[]> {
    try {
      console.log('fetchMongoDBOffers - Buscando produtos com keyword:', keyword);
      const response = await fetch(`/api/products?categoria=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        throw new Error(`MongoDB API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('fetchMongoDBOffers - Resposta da API:', data);

      if (!data.products || !Array.isArray(data.products)) {
        console.log('fetchMongoDBOffers - Nenhum produto encontrado');
        return [];
      }

      const offers = data.products.map((product: any) => {
        const offer: Offer = {
          name: product.name || product.product_name || '',
          thumbnail: product.thumbnail || product.merchant_image_url || '',
          price: parseFloat(product.price || product.store_price) || 0,
          link: product.link || product.aw_deep_link || '',
          storeName: product.storeName || product.merchant_name || 'Loja não especificada',
          rating: parseFloat(product.rating) || 0,
          average_rating: parseFloat(product.average_rating) || 0,
          reviewCount: parseInt(product.reviews) || 0,
          description: product.description || '',
          ean: product.ean || '',
          currency: product.currency || 'BRL'
        };

        console.log('fetchMongoDBOffers - Produto processado:', {
          nome: offer.name,
          rating: offer.rating,
          average_rating: offer.average_rating,
          reviews: offer.reviewCount
        });

        return offer;
      });

      console.log(`fetchMongoDBOffers - Total de ${offers.length} produtos processados`);
      return offers;

    } catch (error) {
      console.error('Erro ao buscar ofertas do MongoDB:', error);
      return [];
    }
  }

  private async fetchAmazonOffers(keyword: string): Promise<Offer[]> {
    try {
      const response = await fetch(`/api/amazon/search?keyword=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        throw new Error(`Amazon API error: ${response.status}`);
      }

      const offers = await response.json();
      return Array.isArray(offers) ? offers : [];
    } catch (error) {
      console.error('Erro ao buscar ofertas da Amazon:', error);
      return [];
    }
  }

  private async fetchShopeeOffers(keyword: string): Promise<Offer[]> {
    try {
      const response = await fetch(`/api/shopee/search?keyword=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        throw new Error(`Shopee API error: ${response.status}`);
      }

      const offers = await response.json();
      return Array.isArray(offers) ? offers : [];
    } catch (error) {
      console.error('Erro ao buscar ofertas da Shopee:', error);
      return [];
    }
  }



  private getSearchKeyword(): string {
    if (typeof window === 'undefined') return '';
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    if (!categoria) return '';
    return decodeURIComponent(categoria.replace(/-/g, ' '));
  }

  private isCacheValid(cacheItem: CacheItem): boolean {
    return Date.now() - cacheItem.timestamp < this.cacheDuration;
  }

  private getFromCache(key: string): CacheItem | null {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(this.cachePrefix + key);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error('Erro ao ler do cache:', error);
      return null;
    }
  }

  private saveToCache(key: string, data: CacheItem): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.cachePrefix + key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }

  private sortOffers(offers: Offer[], direction: SortDirection): Offer[] {
    return [...offers].sort((a, b) => {
      if (direction === 'relevance') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      } else if (direction === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }

  private renderOffersGrid(offers: Offer[], sortDirection: SortDirection = 'relevance'): string {
    const sortedOffers = this.sortOffers(offers, sortDirection);

    const renderStars = (offer: Offer): string => {
      // Se não houver rating, retorna string vazia
      if (!offer.rating) return '';
      
      const rating = Math.round(offer.rating);
      if (rating <= 0) return '';
      
      return `
        <div style="color: #f59e0b; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.25rem; margin: 0.25rem 0;">
          ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
        </div>
      `;
    };

    const html = `
      <div class="offers-container">
        <div class="sort-controls">
          <label for="sort-select">Ordenar por:</label>
          <select id="sort-select" onchange="dynamicOffers.handleSort(this.value)">
            <option value="relevance" ${sortDirection === 'relevance' ? 'selected' : ''}>Relevância</option>
            <option value="asc" ${sortDirection === 'asc' ? 'selected' : ''}>Menor Preço</option>
            <option value="desc" ${sortDirection === 'desc' ? 'selected' : ''}>Maior Preço</option>
          </select>
        </div>
        <div class="offers-grid">
          ${sortedOffers.map(offer => {
            console.log('Renderizando produto:', {
              nome: offer.name,
              rating: offer.rating,
              average_rating: offer.average_rating
            });
            
            return `
              <a href="${offer.link}" target="_blank" class="offer-card">
                <img src="${offer.thumbnail}" alt="${offer.name}" class="offer-image" />
                <div class="offer-info">
                  <div class="offer-title">${offer.name}</div>
                  <div class="offer-store">${offer.storeName}</div>
                  ${renderStars(offer)}
                  <div class="offer-price">R$ ${offer.price.toFixed(2)}</div>
                  <button class="offer-button">Ver Oferta</button>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;

    console.log('renderOffersGrid - Total de ofertas renderizadas:', sortedOffers.length);
    return html;
  }

  async getOffers(): Promise<Offer[]> {
    const keyword = this.getSearchKeyword();
    if (!keyword) return [];

    try {
      // Verifica o cache
      const cacheKey = keyword.toLowerCase();
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData && this.isCacheValid(cachedData)) {
        console.log('Usando dados do cache para:', keyword);
        return cachedData.offers;
      }

      console.log('Buscando novos dados para:', keyword);
      const [mongoDBOffers, lomadeeOffers, amazonOffers, shopeeOffers] = await Promise.all([
        this.fetchMongoDBOffers(keyword),
        this.fetchLomadeeOffers(keyword),
        this.fetchAmazonOffers(keyword),
        this.fetchShopeeOffers(keyword)
      ]);
      
      // Combina as ofertas
      const offers = [...mongoDBOffers, ...lomadeeOffers, ...amazonOffers, ...shopeeOffers];
      
      // Salva no cache
      this.saveToCache(cacheKey, {
        offers,
        timestamp: Date.now(),
        keyword
      });

      return offers;
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  }

  renderOffersToContainer(offers: Offer[], sortDirection: SortDirection = 'relevance'): void {
    const container = document.getElementById('ofertas-dinamicas');
    if (!container) return;

    if (offers.length === 0) {
      container.innerHTML = '<p class="no-offers">Nenhuma oferta encontrada.</p>';
      return;
    }

    // Importar os estilos
    const existingLink = document.querySelector('link[href*="/styles/offers.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/styles/offers.css?v=${Date.now()}`;
      document.head.appendChild(link);
    }

    // Renderiza as ofertas
    container.innerHTML = this.renderOffersGrid(offers, sortDirection);

    // Expõe a função de ordenação globalmente
    (window as any).dynamicOffers = {
      handleSort: (direction: SortDirection) => {
        if (container) {
          container.innerHTML = this.renderOffersGrid(offers, direction);
        }
      }
    };
  }

  async renderOffers(containerId: string = 'ofertas-dinamicas'): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) return;

    const keyword = this.getSearchKeyword();
    if (!keyword) {
      container.style.display = 'none';
      return;
    }

    try {
      let offers: Offer[] = [];
      
      // Verifica o cache
      const cacheKey = keyword.toLowerCase();
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData && this.isCacheValid(cachedData)) {
        console.log('Usando dados do cache para:', keyword);
        offers = cachedData.offers;
      } else {
        console.log('Buscando novos dados para:', keyword);
        const [lomadeeOffers, amazonOffers, shopeeOffers] = await Promise.all([
          this.fetchLomadeeOffers(keyword),
          this.fetchAmazonOffers(keyword),
          this.fetchShopeeOffers(keyword)
        ]);
        
        // Combina as ofertas
        offers = [...lomadeeOffers, ...amazonOffers, ...shopeeOffers];
        
        // Salva no cache
        this.saveToCache(cacheKey, {
          offers,
          timestamp: Date.now(),
          keyword
        });
      }
      
      if (offers.length === 0) {
        container.innerHTML = '<p class="no-offers">Nenhuma oferta encontrada.</p>';
        return;
      }

      // Importar os estilos
      const existingLink = document.querySelector('link[href*="/styles/offers.css"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/styles/offers.css?v=${Date.now()}`;
        document.head.appendChild(link);
      }

      // Renderiza todas as ofertas juntas
      container.innerHTML = this.renderOffersGrid(offers);

      // Expõe a função de ordenação globalmente
      (window as any).dynamicOffers = {
        handleSort: (direction: SortDirection) => {
          const container = document.getElementById(containerId);
          if (!container) return;
          
          const keyword = this.getSearchKeyword();
          const cachedData = this.getFromCache(keyword.toLowerCase());
          
          if (cachedData) {
            container.innerHTML = this.renderOffersGrid(cachedData.offers, direction);
          }
        }
      };
    } catch (error) {
      console.error('Error rendering offers:', error);
      container.innerHTML = '<p class="no-offers">Erro ao carregar as ofertas.</p>';
    }
  }
}

export const dynamicOffers = new DynamicOffers();
