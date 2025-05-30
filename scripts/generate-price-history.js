const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/linkcompra';
const DAYS_OF_HISTORY = 180; // 6 meses de histórico
// As lojas serão determinadas dinamicamente baseado nos preços disponíveis
const MIN_VARIATION = -0.10; // -10% de variação mínima
const MAX_VARIATION = 0.08; // +8% de variação máxima

async function generatePriceHistory() {
  let client = null;

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

    if (products.length === 0) {
      console.log('Nenhum produto encontrado. Verifique a conexão com o banco de dados.');
      return;
    }

    for (const product of products) {
      console.log('Processando produto:', product.title || 'Sem título');
      console.log('EAN:', product.ean);

      // Pega os preços por loja
      const prices = product.prices || [];
      console.log('Preços encontrados:', prices.length);

      if (prices.length === 0) {
        console.log(`Pulando produto ${product.title || 'Sem título'} - sem preços disponíveis`);
        continue;
      }

      // Organiza os preços por loja
      const pricesByStore = {};
      prices.forEach(p => {
        if (p.price && p.storeName) {
          pricesByStore[p.storeName] = p.price;
          console.log(`Preço encontrado para ${p.storeName}: ${p.price}`);
        }
      });

      if (Object.keys(pricesByStore).length === 0) {
        console.log('Nenhum preço válido encontrado, pulando produto.');
        continue;
      }
      
      console.log(`Gerando histórico para produto ${product.title || 'Sem título'} (EAN: ${product.ean})`);
      
      const history = [];
      const endDate = new Date('2025-05-29'); // Data atual
      
      for (let i = 0; i < DAYS_OF_HISTORY; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);

        // Para cada loja que tem preço
        Object.entries(pricesByStore).forEach(([store, basePrice]) => {
          // Gera uma variação aleatória entre -10% e +8%
          const variation = MIN_VARIATION + (Math.random() * (MAX_VARIATION - MIN_VARIATION));
          const price = Math.round(basePrice * (1 + variation));

          history.push({
            date,
            price,
            store
          });
        });
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
