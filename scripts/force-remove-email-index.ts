import { MongoClient } from 'mongodb';

async function forceRemoveEmailIndex() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test'); // ou o nome do seu banco
    const users = db.collection('users');

    // Listar todos os índices antes
    console.log('Índices antes:');
    const indexes = await users.listIndexes().toArray();
    console.log(indexes);

    // Forçar remoção do índice email_1
    await users.dropIndex('email_1');
    console.log('Índice email_1 removido');

    // Remover o campo email de todos os documentos
    await users.updateMany({}, { $unset: { email: "" } });
    console.log('Campo email removido de todos os documentos');

    // Listar índices depois
    console.log('Índices depois:');
    const indexesAfter = await users.listIndexes().toArray();
    console.log(indexesAfter);

  } catch (error) {
    if (error.code === 27) {
      console.log('Índice email_1 não existe, continuando...');
    } else {
      console.error('Erro:', error);
    }
  } finally {
    await client.close();
    console.log('Desconectado do MongoDB');
  }
}

// Executar o script
forceRemoveEmailIndex();
