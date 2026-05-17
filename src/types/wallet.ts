export type User = {
  id: number;
  name: string;
  email: string;
};

export type Wallet = {
  id: number;
  balance_cents: number;
};

export type AuthResponse = {
  user: User;
  wallet: Wallet;
  token: string;
};

export type Recipient = {
  id: number;
  name: string;
  email: string;
};

export type Transaction = {
  id: number;
  type: string;
  amount_cents: number;
  amount: number;
  status: string;
  counterpart_wallet_id: number | null;
  transfer_group_id: string | null;
  created_at: string | null;
};

export type BalanceResponse = {
  balance_cents: number;
  balance: number;
};

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};
