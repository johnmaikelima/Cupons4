import { ComparisonProduct } from '../src/models/ComparisonProduct';
import connectDB from '../src/lib/mongodb';
import { generateUniqueSlug } from '../src/lib/utils';

async function addSlugs() {
  try {
    await connectDB();
    
    // Busca todos os produtos sem slug
    const products = await ComparisonProduct.find({ slug: { $exists: false } });
    console.log(`Found ${products.length} products without slug`);

    // Adiciona slug para cada produto
    for (const product of products) {
      const slug = await generateUniqueSlug(product.name, ComparisonProduct);
      await ComparisonProduct.findByIdAndUpdate(product._id, { slug });
      console.log(`Added slug "${slug}" to product "${product.name}"`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addSlugs();
