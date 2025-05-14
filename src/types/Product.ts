export interface UnifiedProduct {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  link: string;
  storeName: string;
  source: 'amazon' | 'aliexpress';
  originalData?: any; // dados originais caso precise
}

export type SortDirection = 'asc' | 'desc';

export interface ProductsResponse {
  products: UnifiedProduct[];
  timestamp: number;
  total: number;
}
