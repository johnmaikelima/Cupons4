import { NextResponse } from 'next/server';
import { type Store } from '../../../../models/Store';
import { connectDB } from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  try {
    await connectDB();

    const Store = mongoose.models.Store || mongoose.model('Store');
    
    const filteredStores = await Store.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).select('id name slug logo description coupons');

    // Mapeia os resultados para o formato esperado
    const stores = filteredStores.map(store => ({
      id: store._id.toString(),
      name: store.name,
      slug: store.slug,
      logo: store.logo,
      description: store.description,
      couponsCount: store.coupons?.length || 0
    }));

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    return NextResponse.json({ error: 'Erro ao buscar lojas' }, { status: 500 });
  }
}
