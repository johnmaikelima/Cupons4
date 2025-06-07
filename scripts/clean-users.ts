import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

async function cleanUsers() {
  try {
    await connectDB();
    
    // Remover todos os documentos
    await User.collection.deleteMany({});
    console.log('Todos os usuários removidos');
    
    // Remover todos os índices
    await User.collection.dropIndexes();
    console.log('Índices removidos');
    
    // Recriar apenas o índice do telefone
    await User.collection.createIndex({ phone: 1 }, { unique: true });
    console.log('Índice do telefone recriado');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao limpar usuários:', error);
    process.exit(1);
  }
}

cleanUsers();
