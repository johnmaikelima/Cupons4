import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: {
    slug: string;
  };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Converte o slug para o nome da categoria
  const categoryName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${categoryName} | Melhores Preços e Ofertas | Link Compra`,
    description: `Compare preços e encontre as melhores ofertas de ${categoryName} nas principais lojas. Economize em sua compra!`,
    openGraph: {
      title: `${categoryName} | Melhores Preços e Ofertas`,
      description: `Compare preços e encontre as melhores ofertas de ${categoryName} nas principais lojas. Economize em sua compra!`,
      type: 'website',
      siteName: 'Link Compra'
    }
  };
}

export default function CategoryLayout({ children }: Props) {
  return children;
}
