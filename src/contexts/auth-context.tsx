"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  clearAuth,
  getStoredUser,
  getToken,
  saveAuth,
} from "@/lib/auth-storage";
import type { User } from "@/types/wallet";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (token && stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.login({ email, password });
      saveAuth(data);
      setUser(data.user);
      router.push("/dashboard");
    },
    [router],
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const response = await api.register(data);
      saveAuth(response);
      setUser(response.user);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore — token may already be invalid
    }
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
