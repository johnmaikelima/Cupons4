export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parent?: string;
  order?: number;
}

export const categories: Category[] = [
  // Automotivo (336 produtos)
  { id: 'automotivo', name: 'Automotivo', slug: 'automotivo', icon: 'car', order: 1 },
  { id: 'pneus', name: 'Pneus para Carro', slug: 'pneus', parent: 'automotivo', order: 1 },

  // Smartphones (405 produtos)
  { id: 'smartphones', name: 'Smartphones', slug: 'smartphones', icon: 'phone', order: 2 },
  { id: 'android', name: 'Android', slug: 'android', parent: 'smartphones', order: 1 },
  { id: 'iphone', name: 'iPhone', slug: 'iphone', parent: 'smartphones', order: 2 },
  { id: 'acessorios', name: 'Acessórios', slug: 'acessorios', parent: 'smartphones', order: 3 },

  // Eletrodomésticos (283 produtos)
  { id: 'eletrodomesticos', name: 'Eletrodomésticos', slug: 'eletrodomesticos', icon: 'kitchen', order: 3 },
  { id: 'geladeira', name: 'Geladeira 2 Portas', slug: 'geladeira', parent: 'eletrodomesticos', order: 1 },
  { id: 'lava-e-seca', name: 'Lava e Seca', slug: 'lava-e-seca', parent: 'eletrodomesticos', order: 2 },
  { id: 'micro-ondas', name: 'Micro-ondas', slug: 'micro-ondas', parent: 'eletrodomesticos', order: 3 },
  { id: 'liquidificador', name: 'Liquidificadores', slug: 'liquidificador', parent: 'eletrodomesticos', order: 4 },
  { id: 'fritadeira', name: 'Fritadeiras', slug: 'fritadeira', parent: 'eletrodomesticos', order: 5 },

  // TV e Áudio (234 produtos)
  { id: 'tv-audio', name: 'TV e Áudio', slug: 'tv-audio', icon: 'tv', order: 4 },
  { id: 'smart-tv', name: 'Smart TV', slug: 'smart-tv', parent: 'tv-audio', order: 1 },
  { id: 'tv-4k', name: 'TV 4K', slug: 'tv-4k', parent: 'tv-audio', order: 2 },
  { id: 'caixa-som', name: 'Caixa de Som Portátil', slug: 'caixa-som', parent: 'tv-audio', order: 3 },
  { id: 'soundbar', name: 'Soundbar', slug: 'soundbar', parent: 'tv-audio', order: 4 },

  // Informática (140 produtos)
  { id: 'informatica', name: 'Informática', slug: 'informatica', icon: 'devices', order: 5 },
  { id: 'notebook', name: 'Notebook', slug: 'notebook', parent: 'informatica', order: 1 },
  { id: 'monitores', name: 'Monitores', slug: 'monitores', parent: 'informatica', order: 2 },

  // Móveis (88 produtos)
  { id: 'moveis', name: 'Móveis', slug: 'moveis', icon: 'home', order: 6 },
  { id: 'poltronas', name: 'Poltronas', slug: 'poltronas', parent: 'moveis', order: 1 },
  { id: 'sofa-cama', name: 'Sofás-camas', slug: 'sofa-cama', parent: 'moveis', order: 2 },

  // Ver mais
  { id: 'ver-mais', name: 'Ver mais', slug: 'ver-mais', icon: 'more_horiz', order: 7 },
  { id: 'ferramentas', name: 'Ferramentas', slug: 'ferramentas', parent: 'ver-mais', order: 1 },
  { id: 'casa-jardim', name: 'Casa e Jardim', slug: 'casa-jardim', parent: 'ver-mais', order: 2 },
  { id: 'esporte-lazer', name: 'Esporte e Lazer', slug: 'esporte-lazer', parent: 'ver-mais', order: 3 },
  { id: 'brinquedos', name: 'Brinquedos', slug: 'brinquedos', parent: 'ver-mais', order: 4 },
  { id: 'beleza', name: 'Beleza', slug: 'beleza', parent: 'ver-mais', order: 5 }
];
