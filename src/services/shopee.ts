import { UnifiedProduct } from '@/types/Product';

interface ShopeeProduct {
  itemid: number;
  shopid: number;
  name: string;
  image: string;
  price: number;
  rating_star: number;
  historical_sold: number;
  shop_name: string;
  shop_location: string;
  liked_count: number;
}

interface ShopeeResponse {
  error: string;
  message: string;
  warning: string;
  request_id: string;
  response: {
    items: ShopeeProduct[];
  };
}

// Função auxiliar para gerar timestamp estável
function getStableTimestamp() {
  // Arredonda para o minuto mais próximo para evitar diferenças entre servidor e cliente
  const now = new Date();
  now.setSeconds(0, 0);
  return Math.floor(now.getTime() / 1000);
}

export async function searchShopeeProducts(query: string): Promise<UnifiedProduct[]> {
  try {
    // Validar credenciais
    const appId = process.env.SHOPEE_APP_ID;
    const appSecret = process.env.SHOPEE_APP_SECRET;

    // Validar credenciais
    console.log('Credenciais Shopee:', {
      appId: appId || 'não configurado',
      appSecret: appSecret ? '***' : 'não configurado'
    });

    if (!appId || !appSecret) {
      console.error('Credenciais da Shopee não configuradas');
      return [];
    }

    // Limpar a query removendo caracteres especiais e mensagens
    let cleanQuery = query
      .split(/[-→]/) // Remove tudo após hífen ou seta
      .shift() || ''; 
    
    // Remover aspas e outros caracteres especiais
    cleanQuery = cleanQuery
      .replace(/["']/g, '') // Remove aspas
      .replace(/[^a-zA-Z0-9\s]/g, ' ') // Mantém apenas letras, números e espaços
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    // Configurações da API
    const apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';
    const timestamp = getStableTimestamp();

    // Construir query GraphQL apenas com termo de busca
    const queryGraphQL = `{
      productOfferV2(keyword: "${cleanQuery}") {
        nodes {
          productName
          itemId
          price
          imageUrl
          offerLink
          ratingStar
          sales
          shopName
          shopId
        }
        pageInfo {
          page
          limit
          hasNextPage
        }
      }
    }`;

    // Corpo da requisição GraphQL
    const requestBody = {
      query: queryGraphQL
    };

    // Criar payload para assinatura (AppId + Timestamp + Payload)
    const payload = JSON.stringify(requestBody);
    const signString = `${appId}${timestamp}${payload}`;
    
    // Criar hash SHA256 para assinatura
    const encoder = new TextEncoder();
    const data = encoder.encode(signString + appSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const signatureHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Headers da API GraphQL conforme documentação
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signatureHex}`
    };

    console.log('Fazendo requisição para Shopee:', {
      url: apiUrl,
      headers,
      query: cleanQuery
    });

    // Fazer requisição GraphQL
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: new Headers(headers),
      body: JSON.stringify(requestBody)
    });

    console.log('Resposta da Shopee:', {
      status: response.status,
      statusText: response.statusText
    });

    // Processar resposta
    const responseText = await response.text();

    try {
      // Parse da resposta JSON
      const responseData = typeof responseText === 'string' 
        ? JSON.parse(responseText)
        : responseText;

      if (responseData.errors) {
        throw new Error(`Shopee API error: ${responseData.errors[0]?.message}`);
      }

      if (!responseData.data?.productOfferV2?.nodes) {
        return [];
      }

      console.log('Produtos da Shopee:', responseData.data.productOfferV2.nodes);

      // Mapear produtos para o formato UnifiedProduct
      return responseData.data.productOfferV2.nodes.map((item: any) => {
        console.log('Produto Shopee com rating:', {
          nome: item.productName,
          rating: item.ratingStar
        });

        // Usar o link de afiliado (offerLink)
        const productUrl = item.offerLink;
        
        // Usar o domínio cf.shopee.com.br para imagens
        const imageUrl = item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `https://cf.shopee.com.br/file/${item.imageUrl}`;

        return {
          id: `shopee-${item.itemId}`,
          name: item.productName,
          price: parseFloat(item.price),
          thumbnail: imageUrl,
          link: productUrl,
          storeName: 'Shopee',
          source: 'shopee' as const,
          rating: item.ratingStar && item.ratingStar !== '0' ? parseFloat(item.ratingStar) : undefined,
          originalData: item
        };
      });
    } catch (error) {
      console.error('Erro ao processar resposta da Shopee:', error);
      return [];
    }
  } catch (error) {
    console.error('Error searching Shopee products:', error);
    return [];
  }
}
