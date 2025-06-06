import { Coupon } from '@/models/Coupon';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongodb';
import CouponCard from '@/components/CouponCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cupons Exclusivos | Cupons',
  description: 'Encontre os melhores cupons exclusivos das principais lojas do Brasil.',
};

async function getExclusiveCoupons(retryCount = 0) {
  try {
    await connectDB();
    const coupons = await Coupon.find({ exclusive: true })
      .populate('store')
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(coupons));
  } catch (error) {
    console.error(`Tentativa ${retryCount + 1} falhou:`, error);
    if (retryCount < 2) { // Tenta no máximo 3 vezes
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getExclusiveCoupons(retryCount + 1);
    }
    // Se todas as tentativas falharem, retorna uma lista vazia
    console.error('Todas as tentativas falharam, retornando lista vazia');
    return [];
  }
}

export default async function ExclusiveCouponsPage() {
  const exclusiveCoupons = await getExclusiveCoupons();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Cupons Exclusivos</h1>
          <p className="text-xl text-blue-100">
            Descontos especiais que você só encontra aqui
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {exclusiveCoupons.map((coupon: any) => (
            <CouponCard key={coupon._id} coupon={coupon} />
          ))}
        </div>

        {exclusiveCoupons.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600">
              Nenhum cupom exclusivo disponível no momento
            </h2>
            <p className="text-gray-500 mt-2">
              Volte em breve para novos cupons exclusivos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
