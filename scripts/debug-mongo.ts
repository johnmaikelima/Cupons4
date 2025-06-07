require('dotenv').config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
console.error('URI:', uri);

async function debug() {
  if (!uri) {
    console.error('MONGODB_URI não encontrado!');
    process.exit(1);
  }

  console.error('Conectando ao MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.error('Conectado!');

    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.error('\nBancos de dados:');
    dbs.databases.forEach(db => console.error('-', db.name));

  } catch (error) {
    console.error('ERRO:', error);
  } finally {
    await client.close();
    console.error('Conexão fechada');
  }
}

debug().catch(err => console.error('ERRO FATAL:', err));
