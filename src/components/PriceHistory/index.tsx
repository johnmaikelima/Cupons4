'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  ean: string;
  prices: Array<{
    storeName: string;
    price: number;
    lastUpdate: Date;
  }>;
}

export default function PriceHistory({ ean, prices }: Props) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Agrupa preços por data e loja
    const pricesByDate = prices.reduce((acc: any, price) => {
      const date = new Date(price.lastUpdate).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][price.storeName] || acc[date][price.storeName] > price.price) {
        acc[date][price.storeName] = price.price;
      }
      return acc;
    }, {});

    // Prepara dados para o gráfico
    const dates = Object.keys(pricesByDate).sort((a, b) => 
      new Date(a.split('/').reverse().join('-')).getTime() - 
      new Date(b.split('/').reverse().join('-')).getTime()
    );

    const stores = Array.from(new Set(prices.map(p => p.storeName)));
    const datasets = stores.map(store => ({
      label: store,
      data: dates.map(date => pricesByDate[date][store] || null),
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.1
    }));

    setChartData({
      labels: dates,
      datasets
    });
  }, [prices]);

  if (!chartData) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Histórico de Preços por Loja'
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => {
                  return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value as number);
                }
              }
            }
          }
        }}
      />
    </div>
  );
}
