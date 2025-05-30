const { MongoClient } = require('mongodb');

async function listCategories() {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017/linkcompra');
    const db = client.db('linkcompra');
    const collection = db.collection('comparison_products');

    const categories = await collection.distinct('category');
    const categoryCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await collection.countDocuments({ category: cat });
        return { category: cat, count };
      })
    );

    // Ordena por contagem
    categoryCounts.sort((a, b) => b.count - a.count);

    console.log('\nCategorias encontradas:');
    console.log('=====================');
    categoryCounts.forEach(({ category, count }) => {
      console.log(`${category}: ${count} produtos`);
    });

    await client.close();
  } catch (error) {
    console.error('Erro:', error);
  }
}

listCategories();
