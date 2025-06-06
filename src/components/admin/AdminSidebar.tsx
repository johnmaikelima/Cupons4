import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Network,
  Trash2,
  Bell,
  LineChart,
  Upload
} from 'lucide-react';
import { FiSettings } from 'react-icons/fi';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startPriceMonitoring = async () => {
    try {
      setIsMonitoring(true);
      const response = await fetch('/api/admin/monitor-prices', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao iniciar monitoramento');
      }

      alert('Monitoramento de preços iniciado!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao iniciar monitoramento');
    } finally {
      setIsMonitoring(false);
    }
  };

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

        <button
          onClick={startPriceMonitoring}
          disabled={isMonitoring}
          className={cn(
            'w-full flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50',
            isMonitoring && 'bg-blue-50 text-blue-600'
          )}
        >
          <Bell size={20} />
          <span>{isMonitoring ? 'Monitorando...' : 'Monitorar Preços'}</span>
        </button>

        <Link
          href="/admin/comparacao-de-preco"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin/comparacao-de-preco' && 'bg-gray-100'
          )}
        >
          <LineChart size={20} />
          <span>Comparação de Preços</span>
        </Link>

        <Link
          href="/admin/import"
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100',
            pathname === '/admin/import' && 'bg-gray-100'
          )}
        >
          <Upload size={20} />
          <span>Importar Dados</span>
        </Link>
      </nav>
    </aside>
  );
}
