import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AccountsView from './components/AccountsView';
import TransactionsView from './components/TransactionsView';
import SettingsView from './components/SettingsView';
import { Account, Transaction, TransactionType } from './types';
import { getAccounts, getTransactions, saveAccounts, saveTransactions, exportDataToCSV, saveSyncUrl, getSyncUrl } from './services/storage';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // App State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data on Mount
  useEffect(() => {
    const loadedAccounts = getAccounts();
    const loadedTransactions = getTransactions();
    setAccounts(loadedAccounts);
    setTransactions(loadedTransactions);
    setLoading(false);
  }, []);

  // Helper to sync to cloud if URL exists
  const syncToCloud = async (currentAccounts: Account[], currentTransactions: Transaction[]) => {
    const url = getSyncUrl();
    if (!url) return;

    try {
      // We send the data in a simplified format or full JSON
      // Note: Google Apps Script Web App must handle CORS and POST requests
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Script Simple Triggers
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts: currentAccounts, transactions: currentTransactions })
      });
      console.log('Sync sent to cloud');
    } catch (e) {
      console.error('Cloud Sync failed', e);
    }
  };

  // Handlers
  const handleAddAccount = (newAccount: Account) => {
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    saveAccounts(updated);
    syncToCloud(updated, transactions);
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    const updated = accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a);
    setAccounts(updated);
    saveAccounts(updated);
    syncToCloud(updated, transactions);
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    saveAccounts(updated);
    syncToCloud(updated, transactions);
  };

  const handleAddTransaction = (tData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...tData,
      id: crypto.randomUUID()
    };
    
    // Update Transactions List
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Update Account Balance
    const accountIndex = accounts.findIndex(a => a.id === tData.accountId);
    if (accountIndex >= 0) {
      const account = accounts[accountIndex];
      
      let amountInBaseCurrency = tData.amount;
      if (tData.currency === 'USD' && tData.exchangeRate) {
        amountInBaseCurrency = tData.amount * tData.exchangeRate;
      }

      const newBalance = tData.type === TransactionType.DEPOSIT 
        ? account.balance + amountInBaseCurrency 
        : account.balance - amountInBaseCurrency;
      
      const updatedAccount = {
        ...account,
        balance: newBalance,
        lastTransactionDate: tData.date
      };
      
      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex] = updatedAccount;
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      
      syncToCloud(updatedAccounts, updatedTransactions);
    }
  };

  const handleImportData = (newAccounts: Account[], newTransactions: Transaction[]) => {
    setAccounts(newAccounts);
    setTransactions(newTransactions);
    saveAccounts(newAccounts);
    saveTransactions(newTransactions);
    syncToCloud(newAccounts, newTransactions);
    alert('تم استيراد البيانات بنجاح!');
  };

  const renderContent = () => {
    if (loading) return <div className="flex h-full items-center justify-center">جار التحميل...</div>;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardView accounts={accounts} transactions={transactions} />;
      case 'accounts':
        return (
          <AccountsView 
            accounts={accounts} 
            transactions={transactions}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onExport={exportDataToCSV}
          />
        );
      case 'transactions':
        return (
          <TransactionsView 
            accounts={accounts} 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            onImportData={handleImportData}
            accountsCount={accounts.length}
            transactionsCount={transactions.length}
          />
        );
      default:
        return <DashboardView accounts={accounts} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-gray-900">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 md:hidden flex items-center justify-between bg-white shadow-sm mb-4">
          <h1 className="font-bold text-lg">مدير الأرصدة</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;