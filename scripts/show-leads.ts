require('dotenv').config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

async function showLeads() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI não encontrado no .env.local');
    process.exit(1);
  }

  console.log('Conectando ao MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado com sucesso!');

    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('\nColeções disponíveis:');
    collections.forEach(col => console.log('-', col.name));

    const leadsCollection = db.collection('leads');
    const leads = await leadsCollection.find({}).toArray();
    
    console.log('\nLeads encontrados:', leads.length);
    leads.forEach(lead => {
      console.log('\nLead:');
      console.log('- Phone:', lead.phone);
      console.log('- Product ID:', lead.productId);
      console.log('- Target Price:', lead.targetPrice);
      console.log('- Last Notified:', lead.lastNotified);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada');
  }
}

showLeads().catch(console.error);
