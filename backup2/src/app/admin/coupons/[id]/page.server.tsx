import { EditCouponForm } from './edit-form';

interface Props {
  params: {
    id: string;
  };
}

async function getCoupon(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons/${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Erro ao buscar cupom');
  return res.json();
}

async function getStores() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/stores`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Erro ao buscar lojas');
  return res.json();
}

export default async function EditCouponPage({ params }: Props) {
  const [coupon, stores] = await Promise.all([
    getCoupon(params.id),
    getStores(),
  ]);

  const formattedCoupon = {
    ...coupon,
    _id: coupon._id.toString(),
    store: coupon.store.toString(),
    expiryDate: coupon.expiresAt 
      ? new Date(coupon.expiresAt).toISOString().split('T')[0]
      : '',
  };

  const formattedStores = stores.map(store => ({
    _id: store._id.toString(),
    name: store.name,
  }));

  return <EditCouponForm coupon={formattedCoupon} stores={formattedStores} />;
}
