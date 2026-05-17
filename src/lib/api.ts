import { getToken } from "@/lib/auth-storage";
import type {
  ApiError,
  AuthResponse,
  BalanceResponse,
  Recipient,
  Transaction,
} from "@/types/wallet";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiClientError extends Error {
  errors?: Record<string, string[]>;
  code?: string;

  constructor(message: string, errors?: Record<string, string[]>, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.errors = errors;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data as ApiError;
    const message =
      err.message ??
      (err.errors ? Object.values(err.errors).flat().join(" ") : "Erro na requisição");
    throw new ApiClientError(message, err.errors, err.error);
  }

  return data as T;
}

export const api = {
  register(body: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return request<AuthResponse>("/register", { method: "POST", body: JSON.stringify(body) }, false);
  },

  login(body: { email: string; password: string }) {
    return request<AuthResponse>("/login", { method: "POST", body: JSON.stringify(body) }, false);
  },

  logout() {
    return request<{ message: string }>("/logout", { method: "POST" });
  },

  balance() {
    return request<BalanceResponse>("/wallet/balance");
  },

  deposit(amount: number) {
    return request("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  transfer(toUserId: number, amount: number) {
    return request("/wallet/transfer", {
      method: "POST",
      body: JSON.stringify({ to_user_id: toUserId, amount }),
    });
  },

  transactions() {
    return request<{ data: Transaction[] }>("/transactions");
  },

  recipients() {
    return request<{ data: Recipient[] }>("/users/recipients");
  },

  reverseTransaction(transactionId: number) {
    return request(`/transactions/${transactionId}/reverse`, { method: "POST" });
  },
};
