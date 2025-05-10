import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Network,
  Trash2
} from 'lucide-react';
import { FiSettings } from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold">Admin</h1>
      </div>
      
      <nav className="mt-4 space-y-1">
        <Link
          href="/admin"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin' && 'bg-gray-100'
          )}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/stores"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin/stores' && 'bg-gray-100'
          )}
        >
          <ShoppingBag size={20} />
          <span>Lojas</span>
        </Link>

        <Link
          href="/admin/coupons"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin/coupons' && 'bg-gray-100'
          )}
        >
          <Tag size={20} />
          <span>Cupons</span>
        </Link>

        <Link
          href="/admin/apis"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin/apis' && 'bg-gray-100'
          )}
        >
          <Network size={20} />
          <span>APIs</span>
        </Link>

        <Link
          href="/admin/settings"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            pathname === '/admin/settings'
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100'
          }`}
        >
          <FiSettings className="w-5 h-5" />
          <span>Configurações</span>
        </Link>

        <Link
          href="/admin/cleanup"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin/cleanup' && 'bg-gray-100'
          )}
        >
          <Trash2 size={20} />
          <span>Limpar Dados</span>
        </Link>
      </nav>
    </aside>
  );
}
