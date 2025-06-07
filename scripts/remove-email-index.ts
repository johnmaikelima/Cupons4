import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

async function removeEmailIndex() {
  try {
    await connectDB();
    
    // Remover o índice email_1
    await User.collection.dropIndex('email_1');
    console.log('Índice email_1 removido com sucesso');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao remover índice:', error);
    process.exit(1);
  }
}

removeEmailIndex();
