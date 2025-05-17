'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Coupon {
  _id: string;
  title?: string;
  description: string;
  code?: string;
  type?: 'COUPON' | 'URL_CUPONADA';
  url: string;
  affiliateLink?: string;
  image?: string;
  store: {
    name: string;
  };
  expiresAt?: string;
  discount?: string;
  active?: boolean;
  provider?: string;
  externalId?: string;
  slug: string;
}

function formatDate(date: string) {
  if (!date) return 'Sem data';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Data inválida';
  return d.toLocaleDateString('pt-BR');
}

function isExpired(date: string) {
  if (!date) return false;
  const expiryDate = new Date(date);
  if (isNaN(expiryDate.getTime())) return false;
  return expiryDate < new Date();
}

export default function CouponsPage() {
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        console.log('Iniciando busca de cupons...');
        const response = await fetch('/api/coupons');
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
          console.log('Resposta não ok:', response.status, response.statusText);
          throw new Error('Erro ao carregar cupons');
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data.length, 'cupons');
        setCoupons(data);
      } catch (error) {
        console.error('Erro ao carregar cupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCoupons(coupons.map(coupon => coupon._id));
    } else {
      setSelectedCoupons([]);
    }
  };

  const handleSelect = (couponId: string) => {
    setSelectedCoupons(prev => {
      if (prev.includes(couponId)) {
        return prev.filter(id => id !== couponId);
      }
      return [...prev, couponId];
    });
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir cupom');

      // Remove o cupom excluído do estado
      setCoupons(prev => prev.filter(coupon => coupon._id !== id));
      setSelectedCoupons(prev => prev.filter(selectedId => selectedId !== id));
      alert('Cupom excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir cupom. Tente novamente.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupons.length) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selectedCoupons.length} cupom(ns)?`)) {
      try {
        const response = await fetch('/api/coupons/bulk-delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: selectedCoupons }),
        });

        if (!response.ok) throw new Error('Erro ao excluir cupons');

        // Remove os cupons excluídos do estado
        setCoupons(prev => prev.filter(coupon => !selectedCoupons.includes(coupon._id)));
        setSelectedCoupons([]);
        alert('Cupons excluídos com sucesso!');
      } catch (error) {
        alert('Erro ao excluir cupons. Tente novamente.');
        console.error(error);
      }
    }
  };

  if (loading) {
    return null; 
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cupons</h1>
        <div className="flex gap-4">
          {selectedCoupons.length > 0 && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir Selecionados ({selectedCoupons.length})
            </button>
          )}
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Novo Cupom
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCoupons.length === coupons.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título/Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Validade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon: Coupon) => (
              <tr key={coupon._id} className={selectedCoupons.includes(coupon._id) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.includes(coupon._id)}
                    onChange={() => handleSelect(coupon._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {coupon.title || coupon.description}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {coupon.code || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {coupon.store.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {coupon.type === 'COUPON' && 'Cupom'}
                    {coupon.type === 'URL_CUPONADA' && 'Link'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(coupon.expiresAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isExpired(coupon.expiresAt) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Vencido
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/coupons/${coupon._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este cupom?')) {
                          handleDeleteSingle(coupon._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
