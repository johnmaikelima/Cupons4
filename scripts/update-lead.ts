require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const leadId = '683a434d9f32e9ee4e0d7791'; // ID do seu lead

async function updateLead() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const leadsCollection = db.collection('leads');

    // Atualizar o lead
    await leadsCollection.updateOne(
      { _id: new ObjectId(leadId) },
      { 
        $set: { 
          targetPrice: 100 // Definindo um valor de teste
        }
      }
    );

    // Verificar se foi atualizado
    const lead = await leadsCollection.findOne({ _id: new ObjectId(leadId) });
    console.log('Lead atualizado:', lead);

  } finally {
    await client.close();
  }
}

updateLead();
