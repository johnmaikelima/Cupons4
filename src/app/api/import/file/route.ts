import { NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Lê o conteúdo do arquivo
    const csvText = await file.text();

    // Processa o CSV
    const records = await new Promise((resolve, reject) => {
      parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // Conecta ao MongoDB
    await connectDB();

    // Prepara os documentos
    const documents = (records as any[]).map(record => ({
      aw_deep_link: record.aw_deep_link?.trim() || '#',
      merchant_image_url: record.merchant_image_url?.trim() || '/placeholder.png',
      product_name: record.product_name?.trim() || '',
      merchant_category: (record.merchant_category || record.category || 'Outros')?.trim(),
      store_price: parseFloat((record.search_price || record.store_price || '0').replace(',', '.')),
      ean: (record.ean || `GEN${record.aw_product_id || record.merchant_product_id || Date.now()}`)?.trim(),
      rating: parseFloat(record.average_rating?.toString()?.replace(',', '.') || '0'),
      description: record.description?.trim() || '',
      merchant_name: record.merchant_name?.trim() || '',
      currency: record.currency?.trim() || 'BRL'
    })).filter(doc => 
      doc.product_name && 
      !isNaN(doc.store_price) && 
      doc.store_price > 0 &&
      (!isNaN(doc.rating) && doc.rating >= 0 && doc.rating <= 5)
    );

    // Processa em lotes de 5000
    const BATCH_SIZE = 5000;
    let totalSalvos = 0;

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      const operations = batch.map(doc => ({
        updateOne: {
          filter: { ean: doc.ean },
          update: { $set: doc },
          upsert: true
        }
      }));

      const result = await Product.bulkWrite(operations, { ordered: false });
      totalSalvos += (result.modifiedCount + result.upsertedCount);
      console.log(`Importados ${i + batch.length} de ${documents.length} produtos`);
    }

    return NextResponse.json({
      message: 'Products imported successfully',
      totalProcessados: documents.length,
      totalSalvos
    });

  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}
