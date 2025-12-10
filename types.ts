export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export type Currency = 'ILS' | 'USD';

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number; // Rate used to convert to base currency (ILS)
  type: TransactionType;
  date: string; // ISO string
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  phoneNumber?: string;
  balance: number; // Always stored in Base Currency (ILS)
  createdAt: string;
  lastTransactionDate?: string;
}

export interface DashboardStats {
  totalAccounts: number;
  totalBalance: number;
  monthlyActivity: { name: string; deposits: number; withdrawals: number }[];
  recentTransactions: Transaction[];
}

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  lastBackup: string;
}