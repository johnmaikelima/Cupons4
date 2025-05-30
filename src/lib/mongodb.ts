import { MongoClient, MongoClientOptions } from 'mongodb';
import mongoose from 'mongoose';

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

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI não configurado nas variáveis de ambiente');
  }

  // Se já existe uma conexão Mongoose, retorna o cliente MongoDB
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.getClient();
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
    // Conecta usando o Mongoose
    await mongoose.connect(mongoUri, opts);
    console.log('Nova conexão MongoDB estabelecida');
    
    return mongoose.connection.getClient();
  } catch (e) {
    console.error('Erro na conexão MongoDB:', e);
    throw e;
  }
}

export default connectDB;
