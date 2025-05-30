import { Metadata } from 'next';
import { IComparisonProduct } from '@/models/ComparisonProduct';

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/${params.slug}`);
    const data = await response.json();

    if (!data.product) {
      return {
        title: 'Produto não encontrado | Link Compra'
      };
    }

    return {
      title: `${data.product.name} | Compare Preços | Link Compra`
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
