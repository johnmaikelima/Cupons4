'use client';

import { useState, useEffect } from 'react';
import './MobileFiltersToggle.css';

export function MobileFiltersToggle() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector('.filters-sidebar') as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle('show-mobile', isOpen);
    }
  }, [isOpen]);

  return (
    <button 
      className="mobile-filters-toggle"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
    >
      <span className="toggle-icon">{isOpen ? '×' : '☰'}</span>
      {isOpen ? 'Fechar Filtros' : 'Filtrar Produtos'}
    </button>
  );
}
