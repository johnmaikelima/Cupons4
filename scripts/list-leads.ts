import { MongoClient } from 'mongodb';

async function listLeads() {
  // Carregar variáveis de ambiente do .env.local
  require('dotenv').config({ path: '.env.local' });
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não encontrado no .env.local');
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    // Listar todos os bancos de dados
    const dbs = await client.db().admin().listDatabases();
    console.log('\nBancos de dados disponíveis:');
    console.log(dbs.databases.map(db => db.name));

    // Usar o banco correto
    const dbName = process.env.MONGODB_DB || 'cupons';
    // Usar o banco padrão do Atlas
    const db = client.db();
    console.log(`\nUsando banco de dados: ${dbName}`);
    const leadsCollection = db.collection('leads');

    // Listar todos os leads
    console.log('\nTodos os leads:');
    const allLeads = await leadsCollection.find({}).toArray();
    console.log(JSON.stringify(allLeads, null, 2));

    // Listar leads com targetPrice
    console.log('\nLeads com targetPrice:');
    const leadsWithTarget = await leadsCollection.find({
      targetPrice: { $exists: true }
    }).toArray();
    console.log(JSON.stringify(leadsWithTarget, null, 2));

    // Mostrar índices da coleção
    console.log('\nÍndices da coleção leads:');
    const indexes = await leadsCollection.listIndexes().toArray();
    console.log(JSON.stringify(indexes, null, 2));

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('\nDesconectado do MongoDB');
  }
}

listLeads();
