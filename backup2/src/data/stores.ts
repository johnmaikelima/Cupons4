import { type Store } from '../models/Store';

export const stores: Store[] = [
  {
    id: '1',
    name: 'Amazon',
    slug: 'amazon',
    logo: '/stores/amazon.png',
    description: 'A maior loja online do mundo, com milhões de produtos.',
    couponsCount: 15,
  },
  {
    id: '2',
    name: 'Americanas',
    slug: 'americanas',
    logo: '/stores/americanas.png',
    description: 'Uma das maiores redes varejistas do Brasil.',
    couponsCount: 10,
  },
  {
    id: '3',
    name: 'Magalu',
    slug: 'magalu',
    logo: '/stores/magalu.png',
    description: 'Magazine Luiza - Produtos para sua casa com os melhores preços.',
    couponsCount: 8,
  },
  {
    id: '4',
    name: 'Casas Bahia',
    slug: 'casas-bahia',
    logo: '/stores/casas-bahia.png',
    description: 'Móveis, eletrodomésticos e tecnologia com preços imperdíveis.',
    couponsCount: 12,
  },
  {
    id: '5',
    name: 'Submarino',
    slug: 'submarino',
    logo: '/stores/submarino.png',
    description: 'Produtos de tecnologia, livros, games e muito mais.',
    couponsCount: 7,
  },
];
