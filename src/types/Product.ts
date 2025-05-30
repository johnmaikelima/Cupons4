export interface UnifiedProduct {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  link: string;
  storeName: string;
  source: 'amazon' | 'aliexpress' | 'lomadee' | 'shopee' | 'csv';
  originalData?: any; // dados originais caso precise
  rating?: number;
  description?: string;
  merchant_name?: string;
  currency?: string;
  ean?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface ProductsResponse {
  products: UnifiedProduct[];
  timestamp: number;
  total: number;
}
