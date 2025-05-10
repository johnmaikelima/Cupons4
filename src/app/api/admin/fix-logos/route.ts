import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongoose';

// Lista de domínios confiáveis para logos
const LOGO_DOMAINS = [
  'cdn.shopify.com',
  'images.kabum.com.br',
  'logodownload.org',
  'upload.wikimedia.org',
  'logo.clearbit.com',
  'static.netshoes.com.br',
  'cdn.awsli.com.br',
  'www.google.com',
  'images.tcdn.com.br',
];

const STORE_LOGOS: { [key: string]: string } = {
  'magazine-luiza': 'https://logodownload.org/wp-content/uploads/2014/06/magalu-logo-0-2048x2048.png',
  'amazon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png',
  'americanas': 'https://logodownload.org/wp-content/uploads/2014/07/americanas-logo-0-2048x2048.png',
  'submarino': 'https://logodownload.org/wp-content/uploads/2017/03/submarino-logo-4-2048x2048.png',
  'shoptime': 'https://logodownload.org/wp-content/uploads/2017/03/shoptime-logo-3-2048x2048.png',
  'casas-bahia': 'https://logodownload.org/wp-content/uploads/2014/06/casas-bahia-logo-1-2048x2048.png',
  'ponto': 'https://logodownload.org/wp-content/uploads/2014/06/ponto-logo-0-2048x2048.png',
  'extra': 'https://logodownload.org/wp-content/uploads/2014/07/extra-logo-0-2048x2048.png',
  'netshoes': 'https://logodownload.org/wp-content/uploads/2017/03/netshoes-logo-4-2048x2048.png',
  'dafiti': 'https://logodownload.org/wp-content/uploads/2017/03/dafiti-logo-4-2048x2048.png',
  'nike': 'https://logodownload.org/wp-content/uploads/2016/03/nike-logo-4-2048x2048.png',
  'adidas': 'https://logodownload.org/wp-content/uploads/2014/07/adidas-logo-4-2048x2048.png',
  'centauro': 'https://logodownload.org/wp-content/uploads/2017/03/centauro-logo-4-2048x2048.png',
  'mizuno': 'https://logodownload.org/wp-content/uploads/2022/12/mizuno-logo-0-2048x2048.png',
  'puma': 'https://logodownload.org/wp-content/uploads/2017/03/puma-logo-4-2048x2048.png',
  'kabum': 'https://logodownload.org/wp-content/uploads/2017/03/kabum-logo-4-2048x2048.png',
  'dell': 'https://logodownload.org/wp-content/uploads/2014/04/dell-logo-4-2048x2048.png',
  'samsung': 'https://logodownload.org/wp-content/uploads/2014/09/samsung-logo-4-2048x2048.png',
  'apple': 'https://logodownload.org/wp-content/uploads/2013/12/apple-logo-4-2048x2048.png',
  'motorola': 'https://logodownload.org/wp-content/uploads/2014/07/motorola-logo-4-2048x2048.png',
  'xiaomi': 'https://logodownload.org/wp-content/uploads/2019/07/xiaomi-logo-4-2048x2048.png',
  'lenovo': 'https://logodownload.org/wp-content/uploads/2014/09/lenovo-logo-4-2048x2048.png',
  'asus': 'https://logodownload.org/wp-content/uploads/2014/09/asus-logo-4-2048x2048.png',
  'acer': 'https://logodownload.org/wp-content/uploads/2014/09/acer-logo-4-2048x2048.png',
  'hp': 'https://logodownload.org/wp-content/uploads/2014/04/hp-logo-4-2048x2048.png',
  'multilaser': 'https://logodownload.org/wp-content/uploads/2017/03/multilaser-logo-4-2048x2048.png',
  'philips': 'https://logodownload.org/wp-content/uploads/2014/07/philips-logo-4-2048x2048.png',
  'lg': 'https://logodownload.org/wp-content/uploads/2014/09/lg-logo-4-2048x2048.png',
  'sony': 'https://logodownload.org/wp-content/uploads/2014/04/sony-logo-4-2048x2048.png',
  'jbl': 'https://logodownload.org/wp-content/uploads/2017/03/jbl-logo-4-2048x2048.png',
};

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return LOGO_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

async function getLogoFromClearbit(companyName: string): Promise<string | null> {
  try {
    // Primeiro tenta direto com o nome da empresa
    const response = await fetch(`https://logo.clearbit.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
    if (response.ok) {
      return response.url;
    }
  } catch (error) {
    console.error('Erro ao buscar logo do Clearbit:', error);
  }
  return null;
}

// Nova função para buscar logo do Google
async function searchLogoFromGoogle(storeName: string): Promise<string | null> {
  try {
    const searchTerm = `${storeName} logo oficial site:logodownload.org OR site:wikipedia.org OR site:seeklogo.com`;
    const response = await fetch(`https://customsearch.googleapis.com/customsearch/v1?cx=${process.env.GOOGLE_SEARCH_CX}&key=${process.env.GOOGLE_API_KEY}&q=${encodeURIComponent(searchTerm)}&searchType=image&num=1&imgSize=large&imgType=photo&safe=active`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items[0] && data.items[0].link) {
        // Verifica se a URL é de uma fonte confiável
        const url = new URL(data.items[0].link);
        if (LOGO_DOMAINS.some(domain => url.hostname.includes(domain))) {
          return data.items[0].link;
        }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar logo do Google:', error);
  }
  return null;
}

export async function GET() {
  try {
    await connectDB();

    // Buscar todas as lojas
    const stores = await Store.find({});
    const results = [];

    for (const store of stores) {
      const storeName = store.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      let newLogo = null;

      // 1. Tentar usar o logo pré-definido
      if (STORE_LOGOS[storeName]) {
        newLogo = STORE_LOGOS[storeName];
      }
      
      // 2. Se o logo atual é válido, manter
      else if (store.logo && isValidImageUrl(store.logo)) {
        newLogo = store.logo;
      }
      
      // 3. Tentar buscar do Google
      else {
        newLogo = await searchLogoFromGoogle(store.name);
      }
      
      // 4. Se não encontrou no Google, tentar Clearbit como fallback
      if (!newLogo) {
        newLogo = await getLogoFromClearbit(store.name);
      }

      // Atualizar o logo se encontrou um novo
      if (newLogo && newLogo !== store.logo) {
        await Store.updateOne(
          { _id: store._id },
          { $set: { logo: newLogo } }
        );

        results.push({
          store: store.name,
          oldLogo: store.logo,
          newLogo: newLogo,
          status: 'updated'
        });
      } else {
        results.push({
          store: store.name,
          logo: store.logo,
          status: 'unchanged'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Erro ao atualizar logos:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar logos das lojas' },
      { status: 500 }
    );
  }
}
