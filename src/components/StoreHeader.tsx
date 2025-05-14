'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiPercent, FiTrendingUp, FiClock, FiExternalLink, FiTag, FiCalendar } from 'react-icons/fi';

interface StoreHeaderProps {
  logo: string;
  name: string;
  maxDiscount: number;
  successRate?: number;
  averageApprovalTime?: string;
  affiliateLink?: string;
  activeCoupons?: number;
  expirationDate?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: 'default' | 'highlight';
}

const StatCard = ({ icon, label, value, variant = 'default' }: StatCardProps) => {
  if (variant === 'highlight') {
    return (
      <a
        href={value as string}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
        transition-all duration-200 rounded-lg px-6 py-3 flex items-center justify-center gap-2 
        text-white font-medium shadow-md hover:shadow-lg w-full md:w-auto"
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center space-x-3 w-full md:w-auto">
      <div className="text-blue-600">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-base font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
};

export default function StoreHeader({ 
  logo, 
  name, 
  maxDiscount, 
  successRate = 95,
  averageApprovalTime = "Imediato",
  affiliateLink = "#",
  activeCoupons = 0,
  expirationDate = "Mai/2025"
}: StoreHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Logo */}
        <div className="w-32 h-32 relative flex-shrink-0 mx-auto md:mx-0">
          <Image
            src={logo}
            alt={name}
            fill
            className="rounded-lg object-contain bg-white shadow-md"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Nome e Descrição */}
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
            <p className="text-gray-600">
              Cupons e ofertas verificadas
            </p>
          </div>

          {/* Stats e Botão */}
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
            {/* Stats - Visível apenas em desktop */}
            <div className="hidden md:flex md:flex-row md:items-center gap-4">
              <StatCard
                icon={<FiPercent className="w-5 h-5" />}
                label="Desconto Máximo"
                value={`${maxDiscount}% OFF`}
              />
              
              <StatCard
                icon={<FiTrendingUp className="w-5 h-5" />}
                label="Taxa de Sucesso"
                value={`${successRate}%`}
              />
              
              <StatCard
                icon={<FiTag className="w-5 h-5" />}
                label="Cupons Ativos"
                value={activeCoupons}
              />

              <StatCard
                icon={<FiCalendar className="w-5 h-5" />}
                label="Vencimento"
                value={expirationDate}
              />
              
              <StatCard
                icon={<FiClock className="w-5 h-5" />}
                label="Aprovação"
                value={averageApprovalTime}
              />
            </div>

            {/* Botão */}
            <StatCard
              icon={<FiExternalLink className="w-5 h-5" />}
              label="IR PARA LOJA"
              value={affiliateLink}
              variant="highlight"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
