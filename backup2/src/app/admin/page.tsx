import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import connectDB from '@/lib/mongodb';

export default async function AdminDashboard() {
  await connectDB();
  
  const [storesCount, couponsCount, activeCoupons] = await Promise.all([
    Store.countDocuments(),
    Coupon.countDocuments(),
    Coupon.countDocuments({ active: true })
  ]);

  const stats = [
    { label: 'Total de Lojas', value: storesCount, icon: '🏪' },
    { label: 'Total de Cupons', value: couponsCount, icon: '🏷️' },
    { label: 'Cupons Ativos', value: activeCoupons, icon: '✅' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
