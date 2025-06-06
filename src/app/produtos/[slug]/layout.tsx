import { Metadata } from 'next';
import { IComparisonProduct } from '@/models/ComparisonProduct';

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const productName = decodeURIComponent(params.slug).replace(/-/g, ' ');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/${params.slug}`);
    const data = await response.json();

    if (!data.product) {
      return {
        title: 'Produto não encontrado | Link Compra'
      };
    }

    return {
      title: `${data.product.name} | Compare Preços | Link Compra`,
      description: `Compare preços e encontre as melhores ofertas para ${data.product.name}. Veja histórico de preços, avaliações e recomendações similares.`,
      openGraph: {
        title: data.product.name,
        description: `Compare preços e encontre as melhores ofertas para ${data.product.name}`,
        type: 'website',
        locale: 'pt_BR',
        images: [{
          url: data.product.images?.[0] || '',
          width: 800,
          height: 800,
          alt: data.product.name
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: data.product.name,
        description: `Compare preços e encontre as melhores ofertas para ${data.product.name}`
      }
    };
  } catch (error) {
    console.error('Erro ao buscar produto para metadata:', error);
    return {
      title: 'Erro | Link Compra'
    };
  }
}

export default function ProductLayout({ children }: Props) {
  return children;
}
