import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';

interface Props {
  params: {
    slug: string;
  };
  children: React.ReactNode;
}

export default async function StoreLayout({ params, children }: Props) {
  await connectDB();

  const store = await Store.findOne({ slug: params.slug }).lean();
  if (!store) {
    notFound();
  }

  const coupons = await Coupon.find({ 
    store: store._id,
    active: true,
    expiryDate: { $gt: new Date() }
  }).select('_id title code affiliateLink').sort({ createdAt: -1 }).lean();

  // Formata os dados para o cliente
  const formattedStore = {
    name: store.name,
    logo: store.logo,
    description: store.description
  };

  const formattedCoupons = coupons.map(coupon => ({
    _id: coupon._id.toString(),
    title: coupon.title,
    code: coupon.code,
    affiliateLink: coupon.affiliateLink
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
