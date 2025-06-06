'use client';

import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBox from './SearchBox';

export default function SearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
        aria-label="Buscar"
      >
        <FiSearch className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 left-0 right-0 bg-white shadow-xl z-50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <SearchBox autoFocus onSearch={() => setIsSearchOpen(false)} />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
