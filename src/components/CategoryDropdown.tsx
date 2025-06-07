'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { IoChevronDownOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { getCategoryIcon } from '@/utils/category-icons';

import { Category } from '@/types/category';

interface CategoryDropdownProps {
  category: Category;
}

export default function CategoryDropdown({ category }: CategoryDropdownProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSubcat, setHoveredSubcat] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && menuRef.current) {
      const rect = menuRef.current.parentElement?.getBoundingClientRect();
      if (rect) {
        document.documentElement.style.setProperty('--submenu-top', `${rect.top}px`);
        document.documentElement.style.setProperty('--submenu-left', `${rect.left}px`);
      }
    }
  }, [isHovered]);
  
  return (
    <div 
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredSubcat(null);
      }}
    >
      <div className="h-full">
        <Link
          href={`/categoria/${category.slug}`}
          className={`px-3 h-12 flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm font-medium whitespace-nowrap ${isHovered ? 'bg-blue-700' : ''}`}
        >
          {getCategoryIcon(category.icon)}
          <span>{category.name}</span>
          {category.children && category.children.length > 0 && (
            <IoChevronDownOutline className={`w-4 h-4 ml-1 transition-transform ${isHovered ? 'rotate-180' : ''}`} />
          )}
        </Link>
      </div>

      {/* Submenu */}
      {category.children && category.children.length > 0 && (
        <div 
          ref={menuRef}
          className={`fixed top-[7rem] w-48 py-2 bg-white rounded-lg shadow-lg transition-all duration-200 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
          style={{ zIndex: 1000, left: 'var(--submenu-left, auto)' }}
        >
          {category.children.map((subcat) => (
            <div 
              key={subcat._id}
              className="relative group"
              onMouseEnter={() => setHoveredSubcat(subcat._id)}
              onMouseLeave={() => setHoveredSubcat(null)}
            >
              <Link
                href={`/categoria/${subcat.slug}`}
                className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors text-sm w-full truncate group-hover:bg-blue-50"
              >
                {getCategoryIcon(subcat.icon)}
                <span className="truncate">{subcat.name}</span>
                {subcat.children && (
                  <IoChevronForwardOutline className="w-4 h-4 flex-shrink-0 ml-auto" />
                )}
              </Link>

              {/* Sub-submenu */}
              {subcat.children && (
                <div 
                  className={`fixed ml-48 w-48 py-2 bg-white rounded-lg shadow-lg transition-all duration-200 ${hoveredSubcat === subcat._id ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                  style={{ zIndex: 1001, top: 'var(--submenu-top)' }}
                >
                  {subcat.children && subcat.children.map((subsubcat) => (
                    <Link
                      key={subsubcat._id}
                      href={`/categoria/${subsubcat.slug}`}
                      className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors text-sm w-full truncate"
                    >
                      {getCategoryIcon(subsubcat.icon)}
                      <span className="truncate">{subsubcat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
