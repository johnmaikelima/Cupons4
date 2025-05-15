'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteConfig {
  logo: string;
  name: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`;
  };

  const menuLinks = [
    { href: '/', label: 'Início' },
    { href: '/lojas', label: 'Lojas' },
    { href: '/cupons', label: 'Cupons' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center h-20 md:h-24 md:justify-between md:gap-8">
          {/* Menu Button - Mobile */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            aria-label="Menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center justify-center flex-1 md:flex-none md:w-1/5"
          >
            {config.logo ? (
              <div className="relative h-10 w-40 md:h-12 md:w-48 transition-all duration-200">
                <Image
                  src={config.logo}
                  alt={config.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {config.name}
              </span>
            )}
          </Link>

          {/* Busca */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Buscar lojas ou cupons..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          {/* Menu Button - Desktop */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="hidden md:flex md:w-1/5 md:justify-end p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            aria-label="Menu"
          >
            <FiMenu className="w-5 h-5" />
            <span>Menu</span>
          </button>
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

      {/* Busca Mobile */}
      <div className="md:hidden border-t border-gray-100 bg-gray-50">
        <form onSubmit={handleSearch} className="p-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Buscar lojas ou cupons..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </form>
      </div>
    </header>
  );
}
