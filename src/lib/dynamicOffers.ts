interface Offer {
  name: string;
  thumbnail: string;
  price: number;
  link: string;
  storeName: string;
}

type SortDirection = 'asc' | 'desc';

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
      const comparison = a.price - b.price;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private renderOffersGrid(offers: Offer[], sortDirection: SortDirection = 'asc'): string {
    const sortedOffers = this.sortOffers(offers, sortDirection);
    
    return `
      <div class="offers-header">
        <div class="offers-stats">
          ${offers.length} produtos encontrados
        </div>
        <div class="offers-sort">
          <select 
            class="sort-select"
            onchange="window.dynamicOffers.handleSort(this.value)"
          >
            <option value="asc" ${sortDirection === 'asc' ? 'selected' : ''}>Menor preço</option>
            <option value="desc" ${sortDirection === 'desc' ? 'selected' : ''}>Maior preço</option>
          </select>
        </div>
      </div>
      <div class="offers-grid">
        ${sortedOffers.map(offer => `
          <a href="${offer.link}" class="offer-card" target="_blank" rel="noopener noreferrer">
            <div class="offer-store">${offer.storeName}</div>
            <div class="offer-mobile-content">
              <img src="${offer.thumbnail}" alt="${offer.name}" class="offer-image" />
              <div class="offer-info">
                <h3 class="offer-title">${offer.name}</h3>
                <div class="offer-price">R$ ${offer.price.toFixed(2)}</div>
                <div class="offer-button">Conferir oferta</div>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    `;
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
      const [lomadeeOffers, amazonOffers] = await Promise.all([
        this.fetchLomadeeOffers(keyword),
        this.fetchAmazonOffers(keyword)
      ]);
      
      // Combina as ofertas
      const offers = [...lomadeeOffers, ...amazonOffers];
      
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

  renderOffersToContainer(offers: Offer[]): void {
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
    container.innerHTML = this.renderOffersGrid(offers);

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
        const [lomadeeOffers, amazonOffers] = await Promise.all([
          this.fetchLomadeeOffers(keyword),
          this.fetchAmazonOffers(keyword)
        ]);
        
        // Combina as ofertas
        offers = [...lomadeeOffers, ...amazonOffers];
        
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
