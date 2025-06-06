'use client';

import { useLocalStorage } from './useLocalStorage';

interface User {
  phone: string;
  token?: string;
}

export function useAuth() {
  const [user, setUser, loading] = useLocalStorage<User | null>('user', null);

  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      const data = await response.json();
      const userData = { phone, token: data.token };
      
      setUser(userData);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const resetPassword = async (phone: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao solicitar redefinição de senha');
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user
  };
}
