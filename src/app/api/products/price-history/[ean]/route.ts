import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkcompra';
const DATABASE_NAME = 'linkcompra';

// GET - Busca o histórico de preços
export async function GET(
  request: Request,
  { params }: { params: { ean: string } }
) {
  let client = null;
  
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DATABASE_NAME);

    // Busca o histórico
    const priceHistory = await db.collection('pricehistories').findOne({ ean: params.ean });
    
    if (!priceHistory) {
      return NextResponse.json({ history: [] });
    }

    return NextResponse.json({ history: priceHistory.history });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// POST - Salva ou atualiza o histórico de preços
export async function POST(
  request: Request,
  { params }: { params: { ean: string } }
) {
  let client = null;
  
  try {
    const { history } = await request.json();

    if (!history || !Array.isArray(history)) {
      return NextResponse.json(
        { error: 'Histórico inválido' },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DATABASE_NAME);

    // Atualiza ou insere o histórico
    await db.collection('pricehistories').updateOne(
      { ean: params.ean },
      { 
        $set: { 
          history,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar histórico' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
