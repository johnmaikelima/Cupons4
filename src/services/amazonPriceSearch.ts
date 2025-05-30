const ProductAdvertisingAPIv1 = require('../../paapi5/src/index');

const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

// Verifica credenciais
const accessKey = process.env.AMAZON_ACCESS_KEY || '';
const secretKey = process.env.AMAZON_SECRET_KEY || '';
const partnerTag = process.env.AMAZON_PARTNER_TAG || '';

console.log('Verificando credenciais:', {
  hasAccessKey: !!accessKey,
  hasSecretKey: !!secretKey,
  hasPartnerTag: !!partnerTag
});

if (!accessKey || !secretKey || !partnerTag) {
  console.error('Credenciais da Amazon não configuradas corretamente');
}

defaultClient.accessKey = accessKey;
defaultClient.secretKey = secretKey;
defaultClient.host = 'webservices.amazon.com.br';
defaultClient.region = 'us-east-1';

const api = new ProductAdvertisingAPIv1.DefaultApi();

export interface AmazonPrice {
  price: number;
  url: string;
  storeName: string;
  lastUpdate: Date;
  title: string;
}

async function getASINByEAN(ean: string): Promise<string | null> {
  try {
    const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
    searchRequest.Keywords = ean;
    searchRequest.SearchIndex = 'All';
    searchRequest.PartnerTag = process.env.AMAZON_PARTNER_TAG || 'altustec-20';
    searchRequest.PartnerType = 'Associates';
    searchRequest.Resources = [
      'ItemInfo.ExternalIds',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'Offers.Listings.Price'
    ];
    searchRequest.ItemCount = 10;

    console.log('Configuração da busca:', {
      ean,
      partnerTag: searchRequest.PartnerTag,
      resources: searchRequest.Resources
    });

    const response = await api.searchItems(searchRequest);
    console.log('Resposta da busca:', JSON.stringify(response, null, 2));

    if (!response.SearchResult?.Items || response.SearchResult.Items.length === 0) {
      console.log('Nenhum produto encontrado para o EAN:', ean);
      return null;
    }

    console.log('Produtos encontrados:', response.SearchResult.Items.length);

    // Retorna o primeiro produto encontrado
    const product = response.SearchResult.Items[0];
    console.log('Produto encontrado:', {
      title: product.ItemInfo?.Title?.DisplayValue,
      asin: product.ASIN,
      price: product.Offers?.Listings?.[0]?.Price?.Amount
    });

    return product.ASIN;
  } catch (error) {
    console.error('Erro ao buscar ASIN:', error);
    return null;
  }
}

function removeLeadingZeros(ean: string): string {
  return ean.replace(/^0+/, '');
}

async function searchProductByEAN(ean: string): Promise<AmazonPrice | null> {
  try {
    const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
    searchRequest.Keywords = ean;
    searchRequest.SearchIndex = 'All';
    searchRequest.PartnerTag = process.env.AMAZON_PARTNER_TAG || 'altustec-20';
    searchRequest.PartnerType = 'Associates';
    searchRequest.Resources = [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible',
      'Offers.Listings.MerchantInfo'
    ];
    searchRequest.ItemCount = 1;

    console.log('Buscando produto na Amazon:', {
      ean,
      partnerTag: searchRequest.PartnerTag,
      resources: searchRequest.Resources
    });

    const response = await api.searchItems(searchRequest);

    if (!response.SearchResult?.Items || response.SearchResult.Items.length === 0) {
      console.log('Nenhum produto encontrado para o EAN:', ean);
      return null;
    }

    const product = response.SearchResult.Items[0];

    if (!product.Offers?.Listings?.[0]?.Price?.Amount) {
      console.log('Produto encontrado mas sem preço disponível');
      return null;
    }

    console.log('Produto encontrado:', {
      title: product.ItemInfo?.Title?.DisplayValue,
      price: product.Offers.Listings[0].Price.Amount
    });

    return {
      price: product.Offers.Listings[0].Price.Amount,
      url: `${product.DetailPageURL}?tag=${process.env.AMAZON_PARTNER_TAG || 'altustec-20'}`,
      storeName: 'Amazon',
      lastUpdate: new Date(),
      title: product.ItemInfo?.Title?.DisplayValue || ''
    };
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}

export async function searchAmazonPriceByEAN(ean: string): Promise<AmazonPrice | null> {
  try {
    // Primeiro tenta com o EAN original
    let result = await searchProductByEAN(ean);
    
    // Se não encontrar, tenta sem os zeros à esquerda
    if (!result) {
      const eanWithoutZeros = removeLeadingZeros(ean);
      if (eanWithoutZeros !== ean) {
        console.log('Tentando buscar sem zeros à esquerda:', eanWithoutZeros);
        result = await searchProductByEAN(eanWithoutZeros);
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao buscar produto na Amazon:', error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }

    // Verifica se é erro de credenciais
    if (error.message?.includes('The request signature we calculated does not match')) {
      console.error('Erro de autenticação na API da Amazon. Verifique suas credenciais.');
    }

    return null;
  }
}
