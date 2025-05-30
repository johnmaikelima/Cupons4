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
  // Configura timeout global do Mongoose
  mongoose.set('bufferTimeoutMS', 30000);

  if (cached.client) {
    try {
      // Verifica se a conexão existente está viva
      await cached.client.db('admin').command({ ping: 1 });
      return cached.client;
    } catch (e) {
      console.warn('Conexão existente inválida, reconectando...');
      cached.client = null;
      cached.promise = null;
    }
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI não configurado nas variáveis de ambiente');
  }

  const opts: MongoClientOptions = {
    maxPoolSize: 3,
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    w: 'majority'
  };

  try {
    if (!cached.promise) {
      cached.promise = MongoClient.connect(mongoUri, opts);
    }

    cached.client = await cached.promise;
    console.log('Nova conexão MongoDB estabelecida');
    
    // Configura o timeout do Mongoose após a conexão ser estabelecida
    mongoose.connection.db.serverConfig.s.options.serverSelectionTimeoutMS = 30000;
    
    return cached.client;
  } catch (e) {
    console.error('Erro na conexão MongoDB:', e);
    cached.client = null;
    cached.promise = null;
    throw e;
  }
}

export default connectDB;
