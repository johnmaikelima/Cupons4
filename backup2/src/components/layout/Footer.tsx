'use client';

import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';

const footerLinks = [
  {
    title: 'Sobre nós',
    links: [
      { href: '/sobre', label: 'Quem somos' },
      { href: '/como-funciona', label: 'Como funciona' },
      { href: '/contato', label: 'Contato' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/politica-de-privacidade', label: 'Política de Privacidade' },
      { href: '/termos-de-uso', label: 'Termos de Uso' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold text-blue-600">LinkCompra</span>
            </Link>
            <p className="mt-4 text-gray-600">
              Encontre os melhores cupons de desconto e ofertas das principais lojas do Brasil.
            </p>
          </div>

          {/* Links do Footer */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm text-center md:text-left">
              © {new Date().getFullYear()} LinkCompra. Todos os direitos reservados.
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              Feito com <FiHeart className="text-red-500" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
