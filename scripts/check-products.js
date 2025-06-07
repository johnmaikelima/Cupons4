const mongoose = require('mongoose');

async function connectDB() {
  try {
    mongoose.set('bufferTimeoutMS', 30000);
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cupons');
    return mongoose.connection;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

async function checkProducts() {
  try {
    const connection = await connectDB();
    
    // Lista todas as coleções
    const collections = await connection.db.listCollections().toArray();
    console.log('\nColeções disponíveis:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Verifica produtos em cada coleção
    for (const collection of collections) {
      const count = await connection.db.collection(collection.name).countDocuments();
      console.log(`\nTotal de documentos em ${collection.name}: ${count}`);

      if (count > 0) {
        const sample = await connection.db.collection(collection.name).findOne();
        console.log(`Exemplo de documento em ${collection.name}:`);
        console.log(JSON.stringify(sample, null, 2));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkProducts().catch(console.error);
