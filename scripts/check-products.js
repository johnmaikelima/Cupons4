const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/linkcompra';

async function checkProducts() {
  let client = null;

  try {
    console.log('Conectando ao MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    console.log('Conectado com sucesso!');

    const products = await db.collection('products').find({}).toArray();
    console.log(`Total de produtos: ${products.length}`);

    if (products.length > 0) {
      console.log('\nEstrutura do primeiro produto:');
      console.log(JSON.stringify(products[0], null, 2));

      console.log('\nVerificando preços dos produtos:');
      products.forEach((product, index) => {
        console.log(`\nProduto ${index + 1}:`);
        console.log('Título:', product.title);
        console.log('EAN:', product.ean);
        console.log('Preços:', product.prices ? product.prices.length : 0);
        
        if (product.prices && product.prices.length > 0) {
          product.prices.forEach(price => {
            console.log(`- Loja: ${price.storeName}, Preço: ${price.price}`);
          });
        }
      });
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nConexão com MongoDB fechada.');
    }
  }
}

checkProducts().catch(console.error);
