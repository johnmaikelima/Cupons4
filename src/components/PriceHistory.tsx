'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceHistoryProps {
  ean: string;
}

// Função auxiliar para formatar preços
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

export default function PriceHistory({ ean }: PriceHistoryProps) {
  if (!ean) return null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PricePoint[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const historyResponse = await fetch(`/api/products/price-history/${ean}`);
        const historyData = await historyResponse.json();
        
        if (historyResponse.ok) {
          setData(historyData.history || []);
        } else {
          throw new Error('Erro ao carregar histórico');
        }
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        setError('Erro ao carregar histórico de preços');
      } finally {
        setLoading(false);
      }
    };

    if (ean) {
      // Adiciona um pequeno delay para simular carregamento
      const timer = setTimeout(() => {
        loadHistory();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [ean]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4 h-64">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Carregando histórico de preços...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-500">Nenhum histórico de preço disponível</p>
      </div>
    );
  }

  // Encontra o menor e maior preço
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];

  // Formata os dados para o gráfico
  const chartData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('pt-BR'),
    price: Number(point.price.toFixed(2))
  }));

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Menor Preço</p>
          <p className="text-2xl font-bold text-green-700">
            {formatPrice(minPrice)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Preço Atual</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatPrice(currentPrice)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Maior Preço</p>
          <p className="text-2xl font-bold text-red-700">
            {formatPrice(maxPrice)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              domain={[minPrice * 0.95, maxPrice * 1.05]}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip
              formatter={(value) => [formatPrice(Number(value)), 'Preço']}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4B89DC"
              strokeWidth={2}
              dot={{ r: 4, fill: '#4B89DC' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
