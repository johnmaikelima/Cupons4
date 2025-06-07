import { MongoClient } from 'mongodb';

async function nukeUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test');

    // 1. Dropar a coleção inteira
    try {
      await db.dropCollection('users');
      console.log('Coleção users removida com sucesso');
    } catch (error) {
      console.log('Coleção users não existe, continuando...');
    }

    // 2. Criar nova coleção
    await db.createCollection('users');
    console.log('Nova coleção users criada');

    // 3. Forçar remoção de todos os índices usando comando direto
    await db.command({
      dropIndexes: 'users',
      index: '*'
    });
    console.log('Todos os índices removidos');

    // 4. Criar apenas o índice do telefone
    await db.collection('users').createIndex(
      { phone: 1 },
      {
        unique: true,
        name: 'phone_1',
        background: true
      }
    );
    console.log('Índice do telefone criado');

    // 5. Verificar índices
    const indexes = await db.collection('users').listIndexes().toArray();
    console.log('Índices atuais:', indexes);

    console.log('Operação concluída com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('Desconectado do MongoDB');
  }
}

nukeUsers();
