import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/linkcompra';
const DAYS_OF_HISTORY = 180; // 6 meses de histórico
const STORES = ['Amazon', 'Shopee'];
const VARIATION_RANGE = 0.15; // 15% de variação máxima

async function generatePriceHistory() {
  let client: MongoClient | null = null;

  try {
    console.log('Conectando ao MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    console.log('Conectado com sucesso!');
    
    // Limpa os dados antigos
    console.log('Limpando históricos antigos...');
    await db.collection('pricehistories').deleteMany({});
    console.log('Históricos antigos removidos.');

    console.log('Buscando produtos...');
    const products = await db.collection('products').find({}).toArray();
    console.log(`Encontrados ${products.length} produtos.`);

    for (const product of products) {
      // Encontra o menor preço entre as lojas
      const prices = product.prices || [];
      const basePrice = prices.length > 0
        ? Math.min(...prices.map((p: any) => p.price))
        : 999.99;
      
      console.log(`Gerando histórico para produto ${product.title || 'Sem título'} (EAN: ${product.ean})`);
      
      const history = [];
      const endDate = new Date('2025-05-29'); // Data atual
      
      for (let i = 0; i < DAYS_OF_HISTORY; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);

        for (const store of STORES) {
          // Gera uma variação aleatória entre -15% e +15%
          const variation = (Math.random() - 0.5) * 2 * VARIATION_RANGE;
          const price = Math.round(basePrice * (1 + variation));

          history.push({
            date,
            price,
            store
          });
        }
      }

      // Salva o histórico no banco
      console.log(`Salvando histórico para produto ${product.ean}...`);
      const result = await db.collection('pricehistories').updateOne(
        { ean: product.ean },
        { 
          $set: {
            productId: product._id,
            ean: product.ean,
            history
          }
        },
        { upsert: true }
      );
      console.log(`Histórico salvo. Modificados: ${result.modifiedCount}, Inseridos: ${result.upsertedCount}`);

      console.log(`Histórico gerado para produto ${product.title || 'Sem título'}`);
    }

    console.log('Histórico de preços gerado com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Conexão com MongoDB fechada.');
    }
    process.exit(0);
  }
}

generatePriceHistory().catch(error => {
  console.error('Erro:', error);
  process.exit(1);
});
