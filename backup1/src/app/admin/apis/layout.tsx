import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuração de APIs - Painel Admin',
  description: 'Configure as APIs para importação de lojas e cupons',
};

export default function ApisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
