'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CategoryDropdown from './CategoryDropdown';
import { Category } from '@/types/category';
import { getCategoryIcon } from '@/utils/category-icons';

export default function CategoryMenuWrapper() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

  // Versão mobile: links simples com ícones
  if (isMobile) {
    return (
      <div className="flex gap-6 md:gap-8">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/categoria/${category.slug}`}
            className="flex flex-col items-center gap-1 min-w-max text-blue-100 hover:text-white transition-colors"
          >
            <div className="text-2xl">
              {getCategoryIcon(category.icon)}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  // Versão desktop: dropdowns
  return (
    <div className="flex gap-4">
      {categories.map((category) => (
        <CategoryDropdown key={category._id} category={category} />
      ))}
    </div>
  );
}
