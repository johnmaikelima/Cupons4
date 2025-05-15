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
    <footer className="bg-[#1F55DE] text-white">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Logo e Descrição */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">LinkCompra</span>
            </Link>
            <p className="mt-4 text-blue-100/90 leading-relaxed">
              Encontre os melhores cupons de desconto e ofertas das principais lojas do Brasil.
            </p>
          </div>

          {/* Links do Footer */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white/90 mb-6 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-blue-100/80 hover:text-white transition-colors duration-200"
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
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-100/80 text-sm text-center md:text-left">
              © {new Date().getFullYear()} LinkCompra. Todos os direitos reservados.
            </p>
            <p className="text-blue-100/80 text-sm flex items-center gap-2">
              Feito com <FiHeart className="text-pink-400 animate-pulse" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
