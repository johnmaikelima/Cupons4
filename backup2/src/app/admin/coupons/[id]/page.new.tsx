import { Suspense } from 'react';
import { EditCouponForm } from './edit-form';

interface Props {
  params: {
    id: string;
  };
}

async function getData(id: string) {
  const [couponRes, storesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons/${id}`, {
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/stores`, {
      cache: 'no-store'
    })
  ]);

  if (!couponRes.ok) throw new Error('Erro ao buscar cupom');
  if (!storesRes.ok) throw new Error('Erro ao buscar lojas');

  const [coupon, stores] = await Promise.all([
    couponRes.json(),
    storesRes.json()
  ]);

  return {
    coupon: {
      ...coupon,
      _id: coupon._id.toString(),
      store: coupon.store.toString(),
      expiryDate: coupon.expiresAt 
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
    },
    stores: stores.map(store => ({
      _id: store._id.toString(),
      name: store.name,
    }))
  };
}

export default async function Page({ params }: Props) {
  const data = await getData(params.id);
  
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditCouponForm coupon={data.coupon} stores={data.stores} />
    </Suspense>
  );
}
