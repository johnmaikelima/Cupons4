import { connectDB } from '@/lib/mongodb';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import CouponCard from '@/components/CouponCard';

async function getCoupons() {
  try {
    await connectDB();

    // Carrega os modelos primeiro
    require('@/models/Store');
    require('@/models/Coupon');

    const coupons = await Coupon.find({ active: true })
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

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Todos os Cupons</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <CouponCard key={coupon._id} coupon={coupon} />
        ))}
      </div>

      {coupons.length === 0 && (
        <p className="text-gray-500 text-center">
          Nenhum cupom disponível no momento.
        </p>
      )}
    </main>
  );
}
