'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IoSearchOutline, IoNotificationsOutline } from 'react-icons/io5';
import CategoryMenuWrapper from '@/components/CategoryMenuWrapper';

export default function TestMenu() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header de teste */}
      <header className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4">
          {/* Barra superior */}
          <div className="h-16 flex items-center justify-between">
            {/* Menu Cupons */}
            <div className="flex-1">
              <Link href="/cupons" className="text-white hover:text-blue-100 font-medium">
                Cupons
              </Link>
            </div>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="relative w-32 h-8">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Link>
            </div>

            {/* Alertas e Busca */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <button className="text-white hover:text-blue-100">
                <IoNotificationsOutline className="w-6 h-6" />
              </button>
              <button className="text-white hover:text-blue-100">
                <IoSearchOutline className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Menu de Categorias */}
          <nav className="h-12 flex items-center overflow-x-auto no-scrollbar border-t border-blue-500">
            <CategoryMenuWrapper />
          </nav>
        </div>
      </header>

      {/* Conteúdo para teste */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Página de Teste - Menu de Categorias</h1>
          <p>Esta página existe apenas para testar o menu de categorias isoladamente.</p>
          <p className="mt-2 text-gray-600">Passe o mouse sobre as categorias acima para testar o dropdown.</p>
        </div>
      </main>
    </div>
  );
}
