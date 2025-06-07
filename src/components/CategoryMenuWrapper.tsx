'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoChevronDownOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { Category } from '@/types/category';
import { getCategoryIcon } from '@/utils/category-icons';

export default function CategoryMenuWrapper() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-item')) {
        setActiveCategory(null);
        setActiveSubcategory(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-blue-100 text-sm">
        Nenhuma categoria encontrada
      </div>
    );
  }

  // Versão mobile: ícones com dropdown ao clicar
  if (isMobile) {
    return (
      <div className="flex gap-6 md:gap-8">
        {categories.map((category) => (
          <div key={category._id} className="relative category-item">
            <button
              onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                setActiveCategory(activeCategory === category._id ? null : category._id);
                setActiveSubcategory(null);

                // Calcular posição do dropdown
                const target = event.currentTarget;
                const rect = target.getBoundingClientRect();
                const dropdownTop = rect.bottom + window.scrollY + 8;
                const dropdownLeft = rect.left - 24 + (rect.width / 2);

                // Atualizar CSS vars
                document.documentElement.style.setProperty('--menu-top', `${dropdownTop}px`);
                document.documentElement.style.setProperty('--menu-left', `${dropdownLeft}px`);
              }}
              className="flex flex-col items-center gap-1 min-w-max text-blue-100 hover:text-white transition-colors"
            >
              <div className="text-2xl">
                {getCategoryIcon(category.icon)}
              </div>
              <span className="text-xs font-medium whitespace-nowrap flex items-center gap-1">
                {category.name}
                {category.children && category.children.length > 0 && (
                  <IoChevronDownOutline 
                    className={`w-3 h-3 transition-transform ${activeCategory === category._id ? 'rotate-180' : ''}`} 
                  />
                )}
              </span>
            </button>

            {/* Dropdown de primeiro nível */}
            {activeCategory === category._id && category.children && (
              <div className="fixed top-[var(--menu-top)] left-[var(--menu-left)] w-48 bg-white rounded-lg shadow-lg py-2 mt-2" style={{ zIndex: 9999 }}>
                {category.children.map((subcat) => (
                  <div key={subcat._id} className="relative">
                    <button
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        if (subcat.children?.length) {
                          setActiveSubcategory(activeSubcategory === subcat._id ? null : subcat._id);

                          // Calcular posição do submenu
                          const target = event.currentTarget;
                          const rect = target.getBoundingClientRect();
                          const submenuTop = rect.top + window.scrollY;
                          const submenuLeft = rect.right + 4;

                          // Atualizar CSS vars para submenu
                          document.documentElement.style.setProperty('--submenu-top', `${submenuTop}px`);
                          document.documentElement.style.setProperty('--submenu-left', `${submenuLeft}px`);
                        } else {
                          window.location.href = `/categoria/${subcat.slug}`;
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                    >
                      <span className="truncate">{subcat.name}</span>
                      {subcat.children && subcat.children.length > 0 && (
                        <IoChevronForwardOutline className="w-4 h-4" />
                      )}
                    </button>

                    {/* Dropdown de segundo nível */}
                    {activeSubcategory === subcat._id && subcat.children && (
                      <div className="fixed top-[var(--submenu-top)] left-[var(--submenu-left)] w-48 bg-white rounded-lg shadow-lg py-2 ml-1" style={{ zIndex: 9999 }}>
                        {subcat.children.map((subsubcat) => (
                          <Link
                            key={subsubcat._id}
                            href={`/categoria/${subsubcat.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 truncate"
                          >
                            {subsubcat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Versão desktop: dropdowns com hover
  return (
    <div className="flex gap-4">
      {categories.map((category) => (
        <div key={category._id} className="relative group">
          <Link
            href={`/categoria/${category.slug}`}
            className="px-3 h-12 flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
          >
            {getCategoryIcon(category.icon)}
            <span>{category.name}</span>
            {category.children && category.children.length > 0 && (
              <IoChevronDownOutline className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
            )}
          </Link>

          {category.children && category.children.length > 0 && (
            <div className="absolute top-full left-0 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {category.children.map((subcat) => (
                <div key={subcat._id} className="relative group/sub">
                  <Link
                    href={`/categoria/${subcat.slug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                  >
                    <span className="truncate">{subcat.name}</span>
                    {subcat.children && subcat.children.length > 0 && (
                      <IoChevronForwardOutline className="w-4 h-4" />
                    )}
                  </Link>

                  {subcat.children && subcat.children.length > 0 && (
                    <div className="absolute top-0 left-full w-48 bg-white rounded-lg shadow-lg py-2 ml-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                      {subcat.children.map((subsubcat) => (
                        <Link
                          key={subsubcat._id}
                          href={`/categoria/${subsubcat.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 truncate"
                        >
                          {subsubcat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
