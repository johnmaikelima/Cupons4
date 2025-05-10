import { connectDB } from '@/lib/mongoose';
import { Coupon } from '@/models/Coupon';

export async function getCoupons() {
  await connectDB();
  const coupons = await Coupon.find()
    .populate('store', 'name')
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(coupons));
}
