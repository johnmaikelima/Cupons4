import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { connectDB } from '@/lib/mongodb';
import HeroBanner from '@/components/home/HeroBanner';
import WhyUseCoupons from '@/components/home/WhyUseCoupons';
import HowToUse from '@/components/home/HowToUse';
import HomeSidebar from '@/components/HomeSidebar';
import CouponCard from '@/components/CouponCard';
import Link from 'next/link';
import Image from 'next/image';

async function getPopularStores() {
  try {
    await connectDB();
    const stores = await Store.find({ active: true })
      .sort({ 'coupons.length': -1 })
      .limit(10)
      .select('name logo slug')
      .lean();

    return JSON.parse(JSON.stringify(stores || []));
  } catch (error) {
    console.error('Error fetching popular stores:', error);
    return [];
  }
}

async function getLatestCoupons() {
  try {
    await connectDB();
    const coupons = await Coupon.find({ active: true })
      .populate('store')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return JSON.parse(JSON.stringify(coupons || []));
  } catch (error) {
    console.error('Error fetching latest coupons:', error);
    return [];
  }
}

export default async function Home() {
  let popularStores = [];
  let latestCoupons = [];

  try {
    [popularStores, latestCoupons] = await Promise.all([
      getPopularStores(),
      getLatestCoupons()
    ]);
  } catch (error) {
    console.error('Error loading home page data:', error);
  }

  return (
    <main className="min-h-screen">
      <HeroBanner />
      <WhyUseCoupons />

      {/* Seção de Cupons e Sidebar */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            🔥 Ofertas Imperdíveis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Cupons */}
            <div className="lg:col-span-2 xl:col-span-3">
              <div className="grid gap-6">
                {latestCoupons.map((coupon: any) => (
                  <CouponCard key={coupon._id} coupon={coupon} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <HomeSidebar stores={popularStores} />
            </div>
          </div>
        </div>
      </section>

      <HowToUse />
    </main>
  );
}
