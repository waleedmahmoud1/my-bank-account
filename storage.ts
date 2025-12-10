import { Account, Transaction, TransactionType, AppState } from '../types';

const ACCOUNTS_KEY = 'clients_manager_accounts';
const TRANSACTIONS_KEY = 'clients_manager_transactions';
const SYNC_URL_KEY = 'clients_manager_sync_url';

// Initialize with dummy data if empty
const initialAccounts: Account[] = [
  { id: '1', name: 'أحمد محمد', balance: 5000, phoneNumber: '0501234567', createdAt: new Date().toISOString(), lastTransactionDate: new Date().toISOString() },
  { id: '2', name: 'شركة النور', balance: 12500, phoneNumber: '0509876543', createdAt: new Date().toISOString(), lastTransactionDate: new Date().toISOString() },
  { id: '3', name: 'خالد العمري', balance: -200, phoneNumber: '0561122334', createdAt: new Date().toISOString(), lastTransactionDate: new Date().toISOString() },
];

const initialTransactions: Transaction[] = [
  { id: '101', accountId: '1', amount: 5000, currency: 'ILS', type: TransactionType.DEPOSIT, date: new Date().toISOString(), notes: 'دفعة أولى' },
  { id: '102', accountId: '2', amount: 15000, currency: 'ILS', type: TransactionType.DEPOSIT, date: new Date().toISOString(), notes: 'مشروع التصميم' },
  { id: '103', accountId: '2', amount: 2500, currency: 'ILS', type: TransactionType.WITHDRAWAL, date: new Date().toISOString(), notes: 'شراء مواد' },
];

export const getAccounts = (): Account[] => {
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (!stored) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initialAccounts));
    return initialAccounts;
  }
  return JSON.parse(stored);
};

export const saveAccounts = (accounts: Account[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (!stored) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialTransactions));
    return initialTransactions;
  }
  return JSON.parse(stored);
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getSyncUrl = (): string => {
  return localStorage.getItem(SYNC_URL_KEY) || '';
};

export const saveSyncUrl = (url: string) => {
  localStorage.setItem(SYNC_URL_KEY, url);
};

// --- Backup & Restore Logic ---

export const createBackupJSON = (): string => {
  const data: AppState = {
    accounts: getAccounts(),
    transactions: getTransactions(),
    lastBackup: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const downloadBackup = () => {
  const json = createBackupJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `backup_balance_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseBackupFile = async (file: File): Promise<{ accounts: Account[], transactions: Transaction[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.accounts && json.transactions) {
          resolve({ accounts: json.accounts, transactions: json.transactions });
        } else {
          reject(new Error("ملف غير صالح"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

// --- Excel Export ---

export const exportDataToCSV = () => {
  const accounts = getAccounts();
  const transactions = getTransactions();

  // Create Accounts CSV
  const accountsHeader = "Account ID,Name,Phone,Balance (ILS),Last Transaction\n";
  const accountsRows = accounts.map(a => `${a.id},${a.name},${a.phoneNumber || ''},${a.balance},${a.lastTransactionDate || ''}`).join("\n");
  const accountsCsv = accountsHeader + accountsRows;

  // Create Transactions CSV
  const transHeader = "Transaction ID,Account ID,Type,Amount,Currency,Exchange Rate,Date,Notes\n";
  const transRows = transactions.map(t => `${t.id},${t.accountId},${t.type},${t.amount},${t.currency},${t.exchangeRate || 1},${t.date},${t.notes || ''}`).join("\n");
  const transCsv = transHeader + transRows;

  downloadFile(accountsCsv, 'accounts.csv');
  setTimeout(() => downloadFile(transCsv, 'transactions.csv'), 500);
};

const downloadFile = (content: string, fileName: string) => {
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: 'text/csv;charset=utf-8;' }); 
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
