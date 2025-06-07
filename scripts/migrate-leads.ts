import { MongoClient } from 'mongodb';

async function migrateLeads() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test');
    const leadsCollection = db.collection('leads');
    const productsCollection = db.collection('comparisonproducts');

    // Buscar todos os leads que não têm targetPrice
    const leads = await leadsCollection.find({ targetPrice: { $exists: false } }).toArray();
    console.log(`Encontrados ${leads.length} leads para migrar`);

    for (const lead of leads) {
      // Buscar o produto
      const product = await productsCollection.findOne({ _id: lead.productId });
      if (!product) {
        console.log(`Produto não encontrado para o lead ${lead._id}`);
        continue;
      }

      // Pegar o menor preço atual
      const currentPrice = product.prices?.length > 0 
        ? Math.min(...product.prices.map(p => p.price))
        : null;

      if (!currentPrice) {
        console.log(`Produto ${product._id} não tem preço disponível`);
        continue;
      }

      // Atualizar o lead com o preço atual
      await leadsCollection.updateOne(
        { _id: lead._id },
        { 
          $set: { 
            targetPrice: currentPrice
          }
        }
      );
      console.log(`Lead ${lead._id} atualizado com targetPrice = ${currentPrice}`);
    }

    console.log('Migração concluída!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('Desconectado do MongoDB');
  }
}

migrateLeads();
