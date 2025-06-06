'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiMenu3Line } from "react-icons/ri";
import { FiMenu, FiX, FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBox from '@/components/SearchBox';
import SearchButton from '@/components/SearchButton';
import CategoryMenu from '@/components/CategoryMenu';
import CouponsMenu from '@/components/CouponsMenu';
import FloatingBell from '@/components/FloatingBell';

interface SiteConfig {
  logo: string;
  name: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({ logo: '', name: 'LinkCompra' });

  useEffect(() => {
    // Carregar configurações do site
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data);
        }
      })
      .catch(console.error);
  }, []);

  const menuLinks = [
    { href: '/', label: 'Início' },
    { href: '/lojas', label: 'Lojas' },
    { href: '/cupons', label: 'Cupons' },
  ];

  return (
    <header className="bg-blue-600 sticky top-0 z-50 shadow-sm">
      {/* Barra Principal */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center h-16 md:h-16 justify-between gap-4">
          {/* Menu Button - Mobile */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors md:hidden"
            aria-label="Menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center flex-none w-32 md:w-40"
          >
            {config.logo ? (
              <div className="relative h-8 w-32 md:w-40 transition-all duration-200">
                <Image
                  src={config.logo}
                  alt={config.name}
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
            ) : (
              <span className="text-xl font-bold text-white">
                {config.name}
              </span>
            )}
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center flex-1 h-full gap-1">
            <CategoryMenu />
            <CouponsMenu />
            <Link
              href="/meus-alertas"
              className="flex items-center gap-2 px-4 h-full text-white hover:text-white hover:bg-blue-700 transition-colors font-medium"
            >
              <FiBell className="w-5 h-5" />
              <span>Meus Alertas</span>
            </Link>
          </div>

          {/* Busca */}
          <div className="flex items-center">
            <div className="hidden md:block">
              <SearchButton />
            </div>
            <div className="md:hidden">
              <SearchButton />
            </div>
          </div>

        </div>
      </div>

      {/* Menu Lateral */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50"
            >
              <div className="p-4">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors float-right"
                >
                  <FiX className="w-6 h-6" />
                </button>

                <nav className="mt-12">
                  {menuLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Menu de Categorias Mobile */}
      <div className="md:hidden">
        <CategoryMenu />
      </div>
      
      {/* Sino Flutuante */}
      <FloatingBell />
    </header>
  );
}
