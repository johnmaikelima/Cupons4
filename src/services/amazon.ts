const ProductAdvertisingAPIv1 = require('../../paapi5/src/index');

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
}

export async function searchAmazonProducts(keyword: string): Promise<AmazonOffer[]> {
  try {
    const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
    searchRequest.Keywords = keyword;
    searchRequest.PartnerTag = process.env.AMAZON_PARTNER_TAG || 'altustec-20';
    searchRequest.PartnerType = 'Associates';
    searchRequest.ItemPage = 2; // Retorna mais produtos por página
    searchRequest.Resources = [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible'
    ];

    const response = await api.searchItems(searchRequest);
    
    if (response.SearchResult?.Items) {
      return response.SearchResult.Items
        .filter(item => {
          const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
          return price > 0;
        })
        .map(item => ({
          name: item.ItemInfo?.Title?.DisplayValue || '',
          thumbnail: item.Images?.Primary?.Large?.URL || '',
          price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
          link: item.DetailPageURL || '',
          storeName: 'Amazon'
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Amazon products:', error);
    return [];
  }
}
