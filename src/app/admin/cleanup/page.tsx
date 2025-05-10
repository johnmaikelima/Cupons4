'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCleanup = async () => {
    if (!confirm('Tem certeza que deseja excluir todos os cupons e lojas? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cleanup', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao limpar dados');
      }

      toast.success('Dados limpos com sucesso!');
      router.refresh();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao limpar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Limpar Banco de Dados</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">
          Esta ação irá excluir todos os cupons e lojas do banco de dados. 
          Use esta opção apenas quando quiser começar do zero.
          <br />
          <strong className="text-red-600">Atenção: Esta ação não pode ser desfeita!</strong>
        </p>

        <button
          onClick={handleCleanup}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Limpando...' : 'Limpar Tudo'}
        </button>
      </div>
    </div>
  );
}
