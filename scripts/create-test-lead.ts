import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

async function createTestLead() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test');
    const leadsCollection = db.collection('leads');
    const productsCollection = db.collection('comparisonproducts');

    // Buscar um produto que tenha preços
    const product = await productsCollection.findOne({
      'prices.0': { $exists: true }
    });

    if (!product) {
      console.log('Nenhum produto com preços encontrado');
      return;
    }

    console.log('Produto encontrado:', product.name);

    // Calcular preço atual
    const currentPrice = Math.min(...product.prices.map((p: { price: number }) => p.price));
    console.log('Preço atual:', currentPrice);

    // Criar lead de teste
    const testLead = {
      phone: '(11) 98775-6034',
      password: await bcrypt.hash('123456', 10),
      productId: product._id,
      targetPrice: currentPrice + 100, // Preço alvo maior que o atual para testar
      createdAt: new Date(),
      lastNotified: null
    };

    await leadsCollection.insertOne(testLead);
    console.log('Lead de teste criado com sucesso!');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('Desconectado do MongoDB');
  }
}

createTestLead();
