'use client';

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { User } from '@/types/user';
import { apiClient } from '@/libs/api-client';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
};

type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const me = await apiClient<MeResponse>('/me');
        if (!isMounted || !me) return;
        setUser({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
        });
      } catch {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isLoading,
    }),
    [user, isLoading],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
