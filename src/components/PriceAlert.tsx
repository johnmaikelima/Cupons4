"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Switch, Dialog } from "@headlessui/react";
import { IMaskInput } from "react-imask";
import { AlertOctagon } from "lucide-react";
import { useAlertUser } from "../hooks/useAlertUser";

interface PriceAlertProps {
  productId: string;
  productName: string;
  currentPrice?: number;
}

export default function PriceAlert({ productId, productName, currentPrice }: PriceAlertProps) {
  const { user, saveUser } = useAlertUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState(user?.password || "");
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(!!user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!currentPrice || currentPrice <= 0) {
        throw new Error("Preço não disponível no momento");
      }

      const response = await fetch("/api/price-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
          productId,
          currentPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar alerta");
      }

      toast.success("Alerta de preço criado com sucesso!");
      saveUser(phone, password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar alerta");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold">Achou caro? 🤔</h3>
              <p className="text-sm text-gray-600">Receba um alerta quando o preço cair</p>
            </div>
          </div>
          
          <Switch
            checked={isEnabled}
            onChange={() => {
              setIsEnabled(!isEnabled);
              setIsModalOpen(true);
            }}
            className={`${isEnabled ? 'bg-green-500' : 'bg-gray-300'}
              relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Ativar alerta de preço</span>
            <span
              className={`${isEnabled ? 'translate-x-7' : 'translate-x-1'}
                inline-block h-6 w-6 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (!phone || !password) setIsEnabled(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Configurar Alerta de Preço
            </Dialog.Title>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Como funciona:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Você receberá uma notificação no WhatsApp quando o preço baixar</li>
                <li>Monitoramos os preços 24h por dia</li>
                <li>Você pode cancelar o alerta a qualquer momento</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  type="tel"
                  id="phone"
                  value={phone}
                  onAccept={(value) => setPhone(value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite uma senha"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Essa senha será usada para gerenciar seus alertas
                </p>
              </div>

              <div className="flex items-start space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Li e aceito os {' '}
                  <a href="/termos" target="_blank" className="text-green-600 hover:underline">termos de uso</a>
                  {' '} e a {' '}
                  <a href="/privacidade" target="_blank" className="text-green-600 hover:underline">política de privacidade</a>
                </label>
              </div>

              {currentPrice && (
                <p className="text-sm text-gray-600 mt-4">
                  Você será notificado quando o preço estiver mais baixo que <strong>R$ {currentPrice.toFixed(2)}</strong>
                </p>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (!phone || !password) {
                      setIsEnabled(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !acceptedTerms}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Ativando..." : "Ativar Alerta"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
