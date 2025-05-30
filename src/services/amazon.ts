const ProductAdvertisingAPIv1 = require('../../paapi5/src/index');
import { getProductRating } from './amazonScraper';

const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY || '';
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY || '';
defaultClient.host = 'webservices.amazon.com.br';
defaultClient.region = 'us-east-1';

const api = new ProductAdvertisingAPIv1.DefaultApi();

export interface AmazonOffer {
  name: string;
  thumbnail: string;
  price: number;
  link: string;
  storeName: string;
  rating?: number;
  reviewCount?: number;
}

async function fetchAmazonPage(keyword: string, page: number): Promise<AmazonOffer[]> {
  const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
  searchRequest.Keywords = keyword;
  searchRequest.PartnerTag = process.env.AMAZON_PARTNER_TAG || 'altustec-20';
  searchRequest.PartnerType = 'Associates';
  searchRequest.ItemPage = page;
  searchRequest.Resources = [
    'Images.Primary.Large',
    'ItemInfo.Title',
    'Offers.Listings.Price',
    'Offers.Listings.MerchantInfo'
  ];

  console.log(`Fetching Amazon page ${page}...`);
  const response = await api.searchItems(searchRequest);

  if (!response.SearchResult?.Items) {
    return [];
  }

  const items = response.SearchResult.Items
    .filter(item => {
      const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
      return price > 0;
    })
    .map(item => ({
      name: item.ItemInfo?.Title?.DisplayValue || '',
      thumbnail: item.Images?.Primary?.Large?.URL || '',
      price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
      link: item.DetailPageURL || '',
      storeName: 'Amazon',
      rating: undefined
    }));

  // Busca avaliações via scraping em paralelo (limitado a 5 produtos)
  const ratingPromises = items.slice(0, 5).map(async item => {
    if (!item.link) return undefined;
    try {
      const { rating } = await getProductRating(item.link);
      return rating;
    } catch (error) {
      console.error('Error getting rating for:', item.link, error);
      return undefined;
    }
  });

  // Preenche undefined para os itens restantes
  const remainingPromises = items.slice(5).map(() => Promise.resolve(undefined));

  // Aguarda todas as avaliações
  const [scrapedRatings, remainingRatings] = await Promise.all([
    Promise.all(ratingPromises),
    Promise.all(remainingPromises)
  ]);
  
  const ratings = [...scrapedRatings, ...remainingRatings];

  // Atualiza os itens com as avaliações do scraping
  return items.map((item, index) => ({
    ...item,
    rating: ratings[index]
  }));
}

export async function searchAmazonProducts(keyword: string): Promise<AmazonOffer[]> {
  try {
    // Busca 3 páginas em paralelo (30 produtos no total)
    const pages = await Promise.all([
      fetchAmazonPage(keyword, 1),
      fetchAmazonPage(keyword, 2),
      fetchAmazonPage(keyword, 3)
    ]);

    // Combina todos os produtos
    const allProducts = pages.flat();
    console.log(`Total products found: ${allProducts.length}`);
    
    return allProducts;
  } catch (error) {
    console.error('Error searching Amazon products:', error);
    return [];
  }
}
