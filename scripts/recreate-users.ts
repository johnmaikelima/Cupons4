import { MongoClient } from 'mongodb';

async function recreateUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test'); // ou o nome do seu banco

    // Remover a coleção users completamente
    try {
      await db.collection('users').drop();
      console.log('Coleção users removida');
    } catch (error) {
      if (error.code === 26) {
        console.log('Coleção users não existe, continuando...');
      } else {
        throw error;
      }
    }

    // Criar nova coleção
    await db.createCollection('users');
    console.log('Nova coleção users criada');

    // Criar apenas o índice do telefone
    await db.collection('users').createIndex(
      { phone: 1 }, 
      { 
        unique: true,
        name: 'phone_1'
      }
    );
    console.log('Índice do telefone criado');

    // Verificar índices
    const indexes = await db.collection('users').listIndexes().toArray();
    console.log('Índices atuais:', indexes);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('Desconectado do MongoDB');
  }
}

// Executar o script
recreateUsers();
