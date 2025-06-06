"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "@/components/auth/LoginModal";

interface Alert {
  productId: {
    _id: string;
    name: string;
    images: string[];
    prices: {
      amazon?: number;
      kabum?: number;
      magalu?: number;
      terabyte?: number;
      pichau?: number;
    };
    slug: string;
  };
  targetPrice: number;
  createdAt: string;
  lastNotified: string | null;
}

function getBestPrice(prices: Alert['productId']['prices']): number | undefined {
  if (!prices) return undefined;
  
  const validPrices = Object.entries(prices)
    .map(([_, price]) => price)
    .filter(price => typeof price === 'number' && price > 0);
    
  return validPrices.length > 0 ? Math.min(...validPrices) : undefined;
}

export default function MyAlertsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!user);

  // Fechar modal de login quando usuário estiver autenticado
  useEffect(() => {
    if (user) {
      setShowLoginModal(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) {
      fetchAlerts();
    } else {
      setAlerts([]); // Limpa os alertas quando não há usuário
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user?.token) {
      setAlerts([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/price-alerts`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      console.log('Alertas recebidos:', data.alerts);

      if (!response.ok) {
        throw new Error(data.message || "Erro ao carregar alertas");
      }

      setAlerts(data.alerts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar alertas");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
              <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Meus Alertas de Preço
              </h1>
              <p className="text-gray-600 mb-6">
                Faça login para ver seus alertas de preço
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Meus Alertas de Preço</h1>
            <button
              onClick={() => {
                logout();
                setAlerts([]);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sair
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Você ainda não tem alertas de preço cadastrados
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Explorar produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <div
                  key={alert.productId._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <Link href={`/produtos/${alert.productId.slug}`}>
                    <div className="aspect-square rounded-lg overflow-hidden mb-4">
                      <img
                        src={alert.productId.images[0] || "/placeholder.png"}
                        alt={alert.productId.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {alert.productId.name}
                    </h3>
                  </Link>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Preço atual:{" "}
                      <span className={`font-medium ${getBestPrice(alert.productId.prices) && alert.targetPrice && getBestPrice(alert.productId.prices) < alert.targetPrice ? 'text-green-600' : ''}`}>
                        {getBestPrice(alert.productId.prices)
                          ? `R$ ${getBestPrice(alert.productId.prices)?.toFixed(2)}`
                          : "Indisponível"}
                      </span>
                    </p>
                    {alert.targetPrice && (
                      <p className="text-sm text-gray-600">
                        Preço quando cadastrou:{" "}
                        <span className="font-medium">
                          R$ {alert.targetPrice.toFixed(2)}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Criado em:{" "}
                      {new Intl.DateTimeFormat('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }).format(new Date(alert.createdAt))}
                    </p>
                    {alert.lastNotified && (
                      <p className="text-xs text-gray-500">
                        Última notificação:{" "}
                        {new Intl.DateTimeFormat('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).format(new Date(alert.lastNotified))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
