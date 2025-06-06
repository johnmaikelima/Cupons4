'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { 
  IoLaptopOutline,
  IoPhonePortraitOutline,
  IoTvOutline,
  IoHomeOutline,
  IoLogoApple,
  IoLogoAndroid,
  IoDesktopOutline,
  IoWaterOutline,
  IoSnowOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoEllipsisHorizontalOutline,
  IoCarSportOutline
} from 'react-icons/io5';

import { MdMicrowave } from 'react-icons/md';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  count: number;
  children?: Category[];
}

// Função para obter o ícone baseado na categoria
function getCategoryIcon(icon?: string): JSX.Element {
  switch (icon) {
    case 'devices':
      return <IoLaptopOutline className="w-5 h-5" />;
    case 'phone':
      return <IoPhonePortraitOutline className="w-5 h-5" />;
    case 'tv':
      return <IoTvOutline className="w-5 h-5" />;
    case 'home':
      return <IoHomeOutline className="w-5 h-5" />;
    case 'kitchen':
      return <MdMicrowave className="w-5 h-5" />;
    case 'apple':
      return <IoLogoApple className="w-5 h-5" />;
    case 'android':
      return <IoLogoAndroid className="w-5 h-5" />;
    case 'monitor':
      return <IoDesktopOutline className="w-5 h-5" />;
    case 'washer':
      return <IoWaterOutline className="w-5 h-5" />;
    case 'fridge':
      return <IoSnowOutline className="w-5 h-5" />;
    case 'car':
      return <IoCarSportOutline className="w-5 h-5" />;
    default:
      return <IoEllipsisHorizontalOutline className="w-5 h-5" />;
  }
}

export default function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
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
      <div className="w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="h-12 flex items-center justify-center">
            <div className="text-gray-400">Carregando categorias...</div>
          </div>
        </div>
      </div>
    );
  }

  // Todas as categorias já vem ordenadas da API

  return (
    <nav className="w-full bg-blue-600">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12 -mx-2">
          {/* Categorias principais */}
          {categories.map((category) => (
            <div key={category.id} className="relative group">
              <Link
                href={`/categoria/${category.slug}`}
                className="px-3 h-full flex items-center gap-2 text-white hover:text-white hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
                {category.children && (
                  <IoChevronDownOutline className="w-4 h-4 ml-1" />
                )}
              </Link>

              {/* Submenu */}
              {category.children && (
                <div className="absolute top-full left-0 w-56 mt-1 py-2 bg-white rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {category.children.map((subcat) => (
                    <Link
                      key={subcat.id}
                      href={`/categoria/${subcat.slug}`}
                      className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                    >
                      {getCategoryIcon(subcat.icon)}
                      <span>{subcat.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {subcat.count}
                      </span>
                      {subcat.children && (
                        <IoChevronForwardOutline className="w-4 h-4" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}


        </div>
      </div>
    </nav>
  );
}
