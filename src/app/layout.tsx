import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CldUploadWidgetInfo } from 'next-cloudinary';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/providers/SessionProvider';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkCompra - Cupons de Desconto',
  description: 'Encontre os melhores cupons de desconto das suas lojas favoritas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Lomadee Verification */}
        <meta name="lomadee-verification" content="22720784" />

        <script
          src={`https://widget.cloudinary.com/v2.0/global/all.js`}
          async
        />

        <GoogleTagManager />
      </head>
      <body className={inter.className}>

        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
