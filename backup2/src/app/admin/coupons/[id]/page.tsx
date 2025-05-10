import { Suspense } from 'react';
import { EditCouponForm } from './edit-form';

interface Props {
  params: {
    id: string;
  };
}

async function getData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
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

    if (!coupon || !coupon._id) {
      throw new Error('Dados do cupom inválidos');
    }

    // Garantindo que a loja seja uma string válida
    const formattedCoupon = {
      ...coupon,
      _id: coupon._id.toString(),
      // Se store for um objeto, pegamos o _id, se for string, usamos direto
      store: typeof coupon.store === 'object' ? coupon.store._id.toString() : coupon.store.toString(),
      expiryDate: coupon.expiresAt 
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
    };

    console.log('Cupom formatado:', JSON.stringify(formattedCoupon, null, 2));

    return {
      coupon: formattedCoupon,
      stores: stores.map(store => ({
        _id: store._id.toString(),
        name: store.name,
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