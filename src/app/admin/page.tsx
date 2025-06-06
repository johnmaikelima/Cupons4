import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { Page } from '@/models/Page';
import { connectDB } from '@/lib/mongodb';
import Link from 'next/link';

export default async function AdminDashboard() {
  await connectDB();
  
  const [storesCount, couponsCount, activeCoupons, pagesCount] = await Promise.all([
    Store.countDocuments(),
    Coupon.countDocuments(),
    Coupon.countDocuments({ active: true }),
    Page.countDocuments()
  ]);

  const adminLinks = [
    { href: '/admin/stores', label: 'Lojas', icon: '🏪' },
    { href: '/admin/coupons', label: 'Cupons', icon: '🏷️' },
    { href: '/admin/pages', label: 'Páginas', icon: '📄' },
    { href: '/admin/apis', label: 'APIs', icon: '🔌' },
  ];

  const stats = [
    { label: 'Total de Lojas', value: storesCount, icon: '🏪' },
    { label: 'Total de Cupons', value: couponsCount, icon: '🏷️' },
    { label: 'Cupons Ativos', value: activeCoupons, icon: '✅' },
    { label: 'Total de Páginas', value: pagesCount, icon: '📄' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
      
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
