import { connectDB } from '@/lib/mongodb';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';

export async function getCoupons() {
  try {
    await connectDB();

    // Carrega os modelos primeiro
    require('@/models/Store');
    require('@/models/Coupon');

    const coupons = await Coupon.find()
      .populate('store', 'name logo')
      .sort({ createdAt: -1 })
      .lean();

    // Converte os ObjectIds para strings
    return JSON.parse(JSON.stringify(coupons.map(coupon => ({
      ...coupon,
      _id: coupon._id.toString(),
      store: coupon.store ? {
        ...coupon.store,
        _id: coupon.store._id.toString()
      } : null
    }))));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
}
