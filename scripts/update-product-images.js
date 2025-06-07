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

async function updateProductImages() {
  try {
    await connectDB();

    const ComparisonProduct = mongoose.models.ComparisonProduct || 
      mongoose.model('ComparisonProduct', new mongoose.Schema({
        name: String,
        slug: String,
        images: [String],
        description: String,
        ean: String,
        category: String,
        prices: [],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      }));

    // Atualiza todos os produtos que não têm imagens
    const result = await ComparisonProduct.updateMany(
      { $or: [{ images: { $exists: false } }, { images: [] }] },
      { $set: { images: ['/placeholder.jpg'] } }
    );

    console.log(`Atualizados ${result.modifiedCount} produtos`);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar imagens:', error);
    process.exit(1);
  }
}

updateProductImages();
