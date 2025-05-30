import * as cheerio from 'cheerio';

export async function getProductRating(url: string): Promise<{ rating?: number; reviewCount?: number }> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.amazon.com.br/'
    };

    console.log('Fetching Amazon URL:', url);
    const response = await fetch(url, { headers });
    const html = await response.text();
    console.log('HTML Response:', html.substring(0, 500)); // Log primeiros 500 caracteres

    const $ = cheerio.load(html);

    // Tenta diferentes seletores para avaliação
    let rating: number | undefined;
    let ratingText = $('#acrPopover').attr('title') ||
                    $('.a-icon-star').first().text() ||
                    $('.a-star-5').first().text() ||
                    '';

    if (ratingText) {
      // Remove texto e mantém apenas o número
      ratingText = ratingText.replace(/[^0-9,]/g, '').replace(',', '.');
      rating = parseFloat(ratingText);
    }

    // Tenta diferentes seletores para contagem de avaliações
    let reviewCount: number | undefined;
    const reviewCountText = $('#acrCustomerReviewText').text() ||
                          $('#ratings-summary').text() ||
                          $('.totalRatingCount').text() ||
                          '';

    if (reviewCountText) {
      // Remove texto e mantém apenas o número
      const count = reviewCountText.replace(/[^0-9]/g, '');
      reviewCount = parseInt(count);
    }

    console.log('Scraped data:', { rating, reviewCount });

    return {
      rating: !isNaN(rating) ? rating : undefined,
      reviewCount: !isNaN(reviewCount) ? reviewCount : undefined
    };
  } catch (error) {
    console.error('Error scraping Amazon product:', error);
    return {};
  }
}
