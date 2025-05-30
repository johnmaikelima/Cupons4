import { MongoClient, MongoClientOptions } from 'mongodb';

interface CachedConnection {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

if (!global.mongoConnection) {
  global.mongoConnection = {
    client: null,
    promise: null,
  };
}

let cached: CachedConnection = global.mongoConnection;

async function connectDB() {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não configurado nas variáveis de ambiente');
    }

    const opts: MongoClientOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
      w: 'majority'
    };

    cached.promise = MongoClient.connect(mongoUri, opts)
      .then((client) => {
        console.log('Nova conexão MongoDB estabelecida');
        return client;
      })
      .catch((error) => {
        console.error('Erro ao conectar com MongoDB:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.client = await cached.promise;
    
    // Verifica se a conexão está realmente viva
    await cached.client.db('admin').command({ ping: 1 });
    
    return cached.client;
  } catch (e) {
    console.error('Erro na conexão MongoDB:', e);
    cached.client = null;
    cached.promise = null;
    throw e;
  }
}

export default connectDB;
