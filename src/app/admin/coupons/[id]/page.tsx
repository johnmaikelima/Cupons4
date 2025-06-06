import { Suspense } from 'react';
import { EditCouponForm } from './edit-form';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';

interface Props {
  params: {
    id: string;
  };
}

async function getData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cupons2.vercel.app';
  const couponUrl = `${baseUrl}/api/coupons/${id}`;
  const storesUrl = `${baseUrl}/api/stores`;

  try {
    console.log('Buscando cupom:', couponUrl);
    console.log('Buscando lojas:', storesUrl);

    const [couponRes, storesRes] = await Promise.all([
      fetch(couponUrl, {
        cache: 'no-store',
        method: 'GET'
      }),
      fetch(storesUrl, {
        cache: 'no-store',
        method: 'GET'
      })
    ]);

    if (!couponRes.ok) {
      const error = await couponRes.text();
      console.error('Erro na resposta do cupom:', error);
      throw new Error(`Erro ao buscar cupom: ${couponRes.status} - ${error}`);
    }

    if (!storesRes.ok) {
      const error = await storesRes.text();
      console.error('Erro na resposta das lojas:', error);
      throw new Error(`Erro ao buscar lojas: ${storesRes.status} - ${error}`);
    }

    const [coupon, stores] = await Promise.all([
      couponRes.json(),
      storesRes.json()
    ]);

    console.log('Cupom bruto recebido:', JSON.stringify(coupon, null, 2));
    console.log('Loja do cupom:', coupon.store);
    console.log('Lojas disponíveis:', JSON.stringify(stores, null, 2));

    // Formata os dados para o formulário
    const formattedCoupon = {
      _id: coupon._id.toString(),
      title: coupon.title || '',
      description: coupon.description,
      code: coupon.code || '',
      url: coupon.url || '',
      store: typeof coupon.store === 'object' ? coupon.store._id.toString() : coupon.store.toString(),
      expiryDate: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      type: coupon.type || 'COUPON',
      active: coupon.active
    };
    
    return {
      coupon: formattedCoupon,
      stores: stores.map(store => ({
        _id: store._id.toString(),
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