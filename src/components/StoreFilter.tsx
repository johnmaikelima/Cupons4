'use client';

interface Store {
  name: string;
  count: number;
}

interface StoreFilterProps {
  stores: Store[];
  selectedStore: string | null;
  onStoreSelect: (store: string | null) => void;
}

export function StoreFilter({ stores, selectedStore, onStoreSelect }: StoreFilterProps) {
  return (
    <div className="store-filter">
      <h3 className="filter-title">Filtrar por loja</h3>
      <div className="store-buttons">
        <button
          className={`store-button ${!selectedStore ? 'active' : ''}`}
          onClick={() => onStoreSelect(null)}
        >
          Todas as Lojas ({stores.reduce((acc, store) => acc + store.count, 0)})
        </button>
        {stores.map((store) => (
          <button
            key={store.name}
            className={`store-button ${selectedStore === store.name ? 'active' : ''}`}
            onClick={() => onStoreSelect(store.name)}
          >
            {store.name} ({store.count})
          </button>
        ))}
      </div>
    </div>
  );
}
