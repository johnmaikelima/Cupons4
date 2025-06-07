require('dotenv').config({ path: '.env.local' });
import { MongoClient, ObjectId } from 'mongodb';

async function addTargetPrice() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI não encontrado!');
    process.exit(1);
  }

  console.log('Conectando ao MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado!');

    const db = client.db();
    const leadsCollection = db.collection('leads');
    const productsCollection = db.collection('comparisonproducts');

    // Buscar todos os leads
    const leads = await leadsCollection.find({
      targetPrice: { $exists: false }
    }).toArray();

    console.log(`\nEncontrados ${leads.length} leads sem targetPrice`);

    for (const lead of leads) {
      // Buscar o produto
      const product = await productsCollection.findOne({
        _id: new ObjectId(lead.productId)
      });

      if (!product) {
        console.log(`Produto ${lead.productId} não encontrado para o lead ${lead._id}`);
        continue;
      }

      // Calcular preço atual
      const currentPrice = product.prices?.length > 0
        ? Math.min(...product.prices.map((p: any) => p.price))
        : null;

      if (!currentPrice) {
        console.log(`Produto ${product._id} sem preço disponível`);
        continue;
      }

      // Atualizar o lead com o targetPrice
      await leadsCollection.updateOne(
        { _id: lead._id },
        { 
          $set: { 
            targetPrice: currentPrice + 1 // Definindo targetPrice um pouco maior que o preço atual
          }
        }
      );

      console.log(`Lead ${lead._id} atualizado com targetPrice: ${currentPrice + 1}`);
    }

    console.log('\nProcessamento concluído!');

  } catch (error) {
    console.error('ERRO:', error);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

addTargetPrice().catch(err => console.error('ERRO FATAL:', err));
