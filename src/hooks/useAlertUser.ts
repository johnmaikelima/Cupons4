'use client';

import { useLocalStorage } from './useLocalStorage';

interface AlertUser {
  phone: string;
  password: string;
}

export function useAlertUser() {
  const [user, setUser] = useLocalStorage<AlertUser | null>('alertUser', null);

  const saveUser = (phone: string, password: string) => {
    setUser({ phone, password });
  };

  const clearUser = () => {
    setUser(null);
  };

  return {
    user,
    saveUser,
    clearUser
  };
}
