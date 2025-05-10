import { Suspense } from 'react';
import { EditCouponForm } from './edit-form';
import { headers } from 'next/headers';

interface Props {
  params: {
    id: string;
  };
}

async function getData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cupons2.vercel.app';
  
  try {
    const [couponRes, storesRes] = await Promise.all([
      fetch(`${baseUrl}/api/coupons/${id}`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/stores`, { cache: 'no-store' })
    ]);

    if (!couponRes.ok) {
      throw new Error(`Erro ao buscar cupom: ${couponRes.status}`);
    }

    if (!storesRes.ok) {
      throw new Error(`Erro ao buscar lojas: ${storesRes.status}`);
    }

    const [coupon, stores] = await Promise.all([
      couponRes.json(),
      storesRes.json()
    ]);

    // Formata os dados para o formulário
    const formattedCoupon = {
      _id: coupon._id,
      title: coupon.title || '',
      description: coupon.description,
      code: coupon.code || '',
      url: coupon.url || '',
      store: typeof coupon.store === 'object' ? coupon.store._id : coupon.store,
      expiryDate: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      type: coupon.type || 'COUPON',
      active: coupon.active
    };
    
    return {
      coupon: formattedCoupon,
      stores: stores.map(store => ({
        _id: store._id,
        name: store.name
      }))
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
}

export default async function Page({ params }: Props) {
  const data = await getData(params.id);
  
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditCouponForm coupon={data.coupon} stores={data.stores} />
    </Suspense>
  );
}