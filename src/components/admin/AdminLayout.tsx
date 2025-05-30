import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegação */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-800">
                  Admin
                </Link>
              </div>

              {/* Links de navegação */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  href="/admin/comparacao-de-preco"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Comparação de Preços
                </Link>
                <Link 
                  href="/admin/coupons"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Cupons
                </Link>
                <Link 
                  href="/admin/stores"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Lojas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="py-10">
        {children}
      </main>
    </div>
  );
}
