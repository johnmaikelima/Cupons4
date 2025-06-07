'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoSearchOutline, IoNotificationsOutline, IoTicketOutline } from 'react-icons/io5';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import CategoryMenuWrapper from '../CategoryMenuWrapper';

interface SiteConfig {
  logo: string;
  name: string;
}

export default function Header() {
  const [config, setConfig] = useState<SiteConfig>({ logo: '', name: 'LinkCompra' });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data);
        }
      })
      .catch(console.error);
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? categoryScrollRef.current.scrollLeft - scrollAmount
        : categoryScrollRef.current.scrollLeft + scrollAmount;
      
      categoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <header className="bg-blue-600 sticky top-0 z-[100] shadow-sm">
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Barra superior */}
          <div className="relative h-16 flex items-center justify-between z-[101]">
            {/* Menu Cupons Mobile */}
            <div className="lg:hidden">
              <Link href="/cupons" className="text-white hover:text-blue-100">
                <IoTicketOutline className="w-6 h-6" />
              </Link>
            </div>

            {/* Menu Cupons Desktop */}
            <div className="hidden lg:block">
              <Link href="/cupons" className="text-white hover:text-blue-100 font-medium">
                Cupons
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center">
              <Link href="/" className="relative w-32 h-8">
                {config.logo ? (
                  <Image
                    src={config.logo}
                    alt={config.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="brightness-0 invert"
                    priority
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {config.name}
                  </span>
                )}
              </Link>
            </div>

            {/* Busca */}
            <div className="flex items-center justify-end">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="text-white hover:text-blue-100"
              >
                <IoSearchOutline className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Campo de busca expandido */}
          <div className={`absolute inset-x-0 top-16 bg-blue-700 p-4 transition-all duration-300 ${showSearch ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cupons..."
              className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
            />
          </div>

          {/* Menu de Categorias com scroll */}
          <div className="relative z-[102] border-t border-blue-500">
            <button 
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-700 text-white p-1 rounded-r-lg z-10 lg:hidden"
            >
              <IoIosArrowBack className="w-5 h-5" />
            </button>

            <div 
              ref={categoryScrollRef}
              className="overflow-x-auto scrollbar-hide py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <nav className="flex items-center gap-2 px-6 lg:px-0">
                <CategoryMenuWrapper />
              </nav>
            </div>

            <button 
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-700 text-white p-1 rounded-l-lg z-10 lg:hidden"
            >
              <IoIosArrowForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Botão flutuante de alertas */}
      <Link 
        href="/meus-alertas" 
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <IoNotificationsOutline className="w-6 h-6" />
      </Link>
    </>
  );
}
