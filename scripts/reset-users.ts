import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

async function resetUsers() {
  try {
    await connectDB();
    
    // Remover todos os documentos
    await User.collection.deleteMany({});
    console.log('Todos os usuários removidos');
    
    // Remover todos os índices
    await User.collection.dropIndexes();
    console.log('Índices removidos');
    
    // Recriar índices
    await User.collection.createIndex({ phone: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: false, sparse: true });
    console.log('Índices recriados');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar usuários:', error);
    process.exit(1);
  }
}

resetUsers();
