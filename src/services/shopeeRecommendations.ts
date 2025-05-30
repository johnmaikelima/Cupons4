interface ShopeeProduct {
  itemid: number;
  shopid: number;
  name: string;
  price: number;
  price_min: number;
  price_max: number;
  stock: number;
  image: string;
  historical_sold: number;
  liked_count: number;
  shop_location: string;
  rating_star: number;
}

interface ShopeeRecommendation {
  name: string;
  price: number;
  image: string;
  url: string;
  rating: number;
  soldCount: number;
}

export async function searchShopeeRecommendations(query: string): Promise<ShopeeRecommendation[]> {
  try {
    if (!query || !query.trim()) {
      console.log('Query vazia, retornando array vazio');
      return [];
    }

    console.log('Iniciando busca na Shopee:', { query });

    const url = `/api/products/shopee-recommendations?query=${encodeURIComponent(query)}`;
    console.log('URL da requisição:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('Status da resposta:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    console.log('Resposta bruta:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Erro ao fazer parse da resposta:', e);
      throw new Error('Resposta inválida da API');
    }

    console.log('Dados parseados:', data);

    if (!data || !data.recommendations) {
      console.log('Nenhuma recomendação nos dados');
      return [];
    }

    console.log(`${data.recommendations.length} recomendações encontradas`);
    return data.recommendations;
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
    // Propaga o erro para permitir retry
    throw error;
  }
}
