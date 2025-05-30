'use client';

import './TopSortFilter.css';

type SortDirection = 'asc' | 'desc' | 'relevance';

interface TopSortFilterProps {
  totalItems: number;
  sortType: SortDirection;
  onSortChange: (sort: SortDirection) => void;
}

export function TopSortFilter({ totalItems, sortType, onSortChange }: TopSortFilterProps) {
  return (
    <div className="offers-header">
      <div className="offers-stats">
        {totalItems} produtos encontrados
      </div>
      <div className="offers-sort">
        <select 
          className="sort-select"
          value={sortType}
          onChange={(e) => onSortChange(e.target.value as SortDirection)}
        >
          <option value="relevance">Relevância</option>
          <option value="asc">Menor preço</option>
          <option value="desc">Maior preço</option>
        </select>
      </div>
    </div>
  );
}
