import { type Coupon } from '../models/Coupon';
import { stores } from './stores';

export const coupons: Coupon[] = [
  {
    id: '1',
    title: '10% OFF em todo o site',
    description: 'Válido para compras acima de R$ 100',
    code: 'CUPOM10',
    type: 'Desconto',
    discount: 10,
    store: stores[0], // Amazon
    expirationDate: '2025-12-31',
  },
  {
    id: '2',
    title: 'R$ 50 OFF em Eletrônicos',
    description: 'Válido para a categoria de eletrônicos',
    code: 'ELETRO50',
    type: 'Valor Fixo',
    discount: 50,
    store: stores[1], // Americanas
    expirationDate: '2025-12-31',
  },
  {
    id: '3',
    title: 'Frete Grátis',
    description: 'Em compras acima de R$ 199',
    code: 'FRETEGRATIS',
    type: 'Frete Grátis',
    store: stores[2], // Magalu
    expirationDate: '2025-12-31',
  },
  {
    id: '4',
    title: '15% OFF em Móveis',
    description: 'Desconto especial na categoria de móveis',
    code: 'MOVEIS15',
    type: 'Desconto',
    discount: 15,
    store: stores[3], // Casas Bahia
    expirationDate: '2025-12-31',
  },
  {
    id: '5',
    title: '5% OFF + Frete Grátis',
    description: 'Cupom combinado de desconto e frete grátis',
    code: 'SUPER5',
    type: 'Desconto',
    discount: 5,
    store: stores[4], // Submarino
    expirationDate: '2025-12-31',
  },
];
