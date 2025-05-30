const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb://localhost:27017/linkcompra';
const BASE_URL = 'https://linkcompra.com'; // Ajuste para sua URL de produção

async function generateSitemap() {
  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true,
    w: 'majority'
  });
  const db = client.db('linkcompra');

  try {
    // Busca todos os produtos
    const products = await db.collection('products').find({}).toArray();
    
    // Processa os produtos para gerar slugs
    const processedProducts = products.map(product => ({
      name: product.product_name,
      category: product.category,
      slug: encodeURIComponent(product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      lastmod: product.updatedAt
    }));

    // Busca todas as categorias únicas
    const categories = [...new Set(processedProducts.map(p => p.category))].filter(Boolean);

    // Início do XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Páginas estáticas -->
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/produtos</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Categorias -->
  ${categories.map(category => `
  <url>
    <loc>${BASE_URL}/categoria/${encodeURIComponent(category)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}

  <!-- Produtos -->
  ${processedProducts.map(product => `
  <url>
    <loc>${BASE_URL}/produtos/${product.slug}</loc>
    ${product.lastmod ? `<lastmod>${new Date(product.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    // Remove espaços em branco extras
    sitemap = sitemap.replace(/^\s*[\r\n]/gm, '');

    // Salva o sitemap
    fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log('Sitemap gerado com sucesso!');

    // Gera robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;
    fs.writeFileSync(path.join(process.cwd(), 'public', 'robots.txt'), robotsTxt);
    console.log('Robots.txt gerado com sucesso!');

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
  } finally {
    await client.close();
  }
}

generateSitemap();
