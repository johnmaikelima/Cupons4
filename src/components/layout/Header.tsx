'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiMenu3Line } from "react-icons/ri";
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBox from '@/components/SearchBox';
import CategoryMenu from '@/components/CategoryMenu';

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
          <div className="hidden md:flex flex-1 max-w-2xl">
            <SearchBox />
          </div>

          {/* Menu Button - Desktop */}
          <div className="hidden md:flex md:w-1/5 md:justify-end items-center gap-4">
            <Link
              href="/meus-alertas"
              className="p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Meus Alertas</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
              aria-label="Menu"
            >
              <RiMenu3Line className="w-5 h-5" />
              <span>Menu</span>
            </button>
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

      {/* Busca Mobile */}
      <div className="md:hidden border-t border-gray-100 bg-gray-50">
        <div className="p-4 space-y-4">
          <SearchBox />
          <Link
            href="/meus-alertas"
            className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Meus Alertas</span>
          </Link>
        </div>
      </div>

      {/* Menu de Categorias */}
      <CategoryMenu />
    </header>
  );
}
