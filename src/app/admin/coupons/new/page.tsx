import CouponForm from '@/components/admin/CouponForm';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongoose';

export default async function NewCouponPage() {
  await connectDB();
  const stores = await Store.find({ active: true }).sort({ name: 1 });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Novo Cupom</h1>
      <CouponForm stores={JSON.parse(JSON.stringify(stores))} />
    </div>
  );
}
