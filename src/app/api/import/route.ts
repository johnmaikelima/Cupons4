import { NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Baixa o arquivo CSV
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch CSV file');
    }

    const csvText = await response.text();

    // Processa o CSV
    const records: any[] = await new Promise((resolve, reject) => {
      parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    // Conecta ao MongoDB
    await connectDB();

    // Prepara os produtos para inserção
    const products = records.map(record => ({
      aw_deep_link: record.aw_deep_link,
      merchant_image_url: record.merchant_image_url,
      product_name: record.product_name,
      merchant_category: record.merchant_category,
      store_price: parseFloat(record.store_price),
      ean: record.ean,
      rating: parseFloat(record.rating),
    }));

    // Insere os produtos no banco de dados
    // Usa updateOne com upsert para evitar duplicatas baseado no EAN
    const operations = products.map(product => ({
      updateOne: {
        filter: { ean: product.ean },
        update: { $set: product },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(operations);

    return NextResponse.json({
      message: 'Products imported successfully',
      count: result.modifiedCount + result.upsertedCount,
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}
