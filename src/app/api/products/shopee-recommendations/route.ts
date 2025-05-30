import { NextResponse } from 'next/server';

interface ShopeeProduct {
  productName: string;
  itemId: number;
  shopId: number;
  price: string;
  imageUrl: string;
  offerLink: string;
  ratingStar: string;
  sales: number;
  shopName: string;
}

// Função auxiliar para gerar timestamp estável
function getStableTimestamp() {
  const now = new Date();
  now.setSeconds(0, 0);
  return Math.floor(now.getTime() / 1000);
}

export async function GET(request: Request) {
  // Configurações da API
  const apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';
  const appId = process.env.SHOPEE_APP_ID;
  const appSecret = process.env.SHOPEE_APP_SECRET;

  console.log('Verificando credenciais:', {
    hasAppId: !!appId,
    hasAppSecret: !!appSecret,
    appIdLength: appId?.length,
    secretLength: appSecret?.length
  });

  if (!appId || !appSecret) {
    console.error('Credenciais da Shopee não configuradas');
    return NextResponse.json(
      { error: 'Credenciais não configuradas' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Função para buscar produtos na Shopee
    async function searchShopeeProducts(searchQuery: string) {
      try {
        // Gerar novo timestamp para cada requisição
        const timestamp = getStableTimestamp();

        // Query GraphQL com variáveis
        const queryGraphQL = `query SearchProducts($keyword: String!) {
          productOfferV2(keyword: $keyword, limit: 10) {
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
          }
        }`;

        const variables = {
          keyword: searchQuery
        };

        // Corpo da requisição GraphQL
        const requestBody = { 
          query: queryGraphQL,
          variables
        };
        const payload = JSON.stringify(requestBody);

        // Criar assinatura
        const signString = `${appId}${timestamp}${payload}`;
        console.log('Detalhes da requisição:', {
          timestamp,
          payload,
          signStringLength: signString.length
        });
        const encoder = new TextEncoder();
        const data = encoder.encode(signString + appSecret);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const signatureHex = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        console.log('Detalhes da requisição:', {
          query: searchQuery,
          timestamp,
          appId,
          signString
        });

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signatureHex}`
          },
          body: JSON.stringify(requestBody)
        });

        const responseText = await response.text();
        console.log('Resposta bruta da API:', responseText);

        if (!response.ok) {
          console.error('Erro na resposta da API:', {
            status: response.status,
            statusText: response.statusText,
            body: responseText
          });
          throw new Error(`Erro na API da Shopee: ${response.status} ${response.statusText}`);
        }

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error('Erro ao fazer parse da resposta:', e);
          throw new Error('Resposta inválida da API da Shopee');
        }

        console.log('Resposta parseada:', responseData);

        if (responseData.errors) {
          console.error('Erros GraphQL:', responseData.errors);
          throw new Error(`Erro GraphQL: ${responseData.errors[0]?.message}`);
        }

        if (!responseData.data?.productOfferV2?.nodes) {
          console.log('Nenhum produto encontrado');
          return [];
        }

        return responseData.data.productOfferV2.nodes;
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }
    }

    // Limpar e simplificar a query para melhorar resultados
    let cleanQuery = query
      .toLowerCase()
      .replace(/["']/g, '') // Remove aspas
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    console.log('Query original:', query);
    console.log('Query limpa:', cleanQuery);

    // Primeira tentativa: busca com a query completa
    let items = await searchShopeeProducts(cleanQuery);

    // Se não encontrou resultados, tenta com as 3 primeiras palavras
    if (items.length === 0) {
      console.log('Nenhum resultado encontrado com a query completa, tentando com 3 palavras...');
      const shortQuery = cleanQuery
        .split(' ')
        .slice(0, 3)
        .join(' ');
      
      if (shortQuery !== cleanQuery) {
        console.log('Tentando com query reduzida:', shortQuery);
        items = await searchShopeeProducts(shortQuery);
      }
    }

    // Primeira tentativa: busca com a query completa
    console.log('Tentando busca com query completa:', cleanQuery);
    let products = await searchShopeeProducts(cleanQuery);

    // Se não encontrou resultados, tenta com as 3 primeiras palavras
    if (products.length === 0) {
      const shortQuery = cleanQuery
        .split(' ')
        .slice(0, 3)
        .join(' ');
      
      if (shortQuery !== cleanQuery) {
        console.log('Tentando busca com query reduzida:', shortQuery);
        products = await searchShopeeProducts(shortQuery);
      }
    }

    if (products.length === 0) {
      console.log('Nenhum produto encontrado');
      return NextResponse.json({ recommendations: [] });
    }

    console.log('Produtos encontrados:', products.length);

    const recommendations = products.map(item => ({
      name: item.productName,
      price: parseFloat(item.price),
      image: item.imageUrl.startsWith('http')
        ? item.imageUrl
        : `https://cf.shopee.com.br/file/${item.imageUrl}`,
      url: item.offerLink,
      rating: item.ratingStar && item.ratingStar !== '0' ? parseFloat(item.ratingStar) : undefined,
      soldCount: item.sales
    }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Erro ao buscar recomendações da Shopee:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar recomendações' },
      { status: 500 }
    );
  }
}
