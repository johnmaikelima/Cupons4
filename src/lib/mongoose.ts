import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    // Verifica se a conexão ainda está ativa
    try {
      await mongoose.connection.db.admin().ping();
      console.log('=> Using existing database connection');
      return;
    } catch (error) {
      console.log('=> Previous connection lost, reconnecting...');
      isConnected = false;
    }
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não configurado nas variáveis de ambiente');
    }

    // Configurações do Mongoose
    mongoose.set('strictQuery', true);

    await mongoose.connect(mongoUri, {
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      maxIdleTimeMS: 60000,
      heartbeatFrequencyMS: 10000,
      family: 4 // Força IPv4
    });

    isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      console.log('=> New database connection established');
      
      // Configura listeners de eventos
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        isConnected = true;
      });
    } else {
      throw new Error('Failed to establish database connection');
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    isConnected = false;
    throw error;
  }
}

export default connectDB;
