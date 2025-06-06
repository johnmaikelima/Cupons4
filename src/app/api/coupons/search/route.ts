import { NextResponse } from 'next/server';
import { type Coupon } from '../../../../models/Coupon';
import { connectDB } from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  try {
    await connectDB();

    const Coupon = mongoose.models.Coupon || mongoose.model('Coupon');
    
    const filteredCoupons = await Coupon.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { 'store.name': { $regex: query, $options: 'i' } }
      ]
    }).populate('store', 'name slug logo');

    // Mapeia os resultados para o formato esperado
    const coupons = filteredCoupons.map(coupon => ({
      id: coupon._id.toString(),
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      store: coupon.store ? {
        id: coupon.store._id.toString(),
        name: coupon.store.name,
        slug: coupon.store.slug,
        logo: coupon.store.logo
      } : undefined,
      expirationDate: coupon.expirationDate?.toISOString()
    }));

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 });
  }
}
