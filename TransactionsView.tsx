import React, { useState } from 'react';
import { PlusCircle, Search, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { Account, Transaction, TransactionType, Currency } from '../types';

interface TransactionsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ accounts, transactions, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Transaction Form State
  const [form, setForm] = useState({
    accountId: '',
    type: TransactionType.DEPOSIT,
    currency: 'ILS' as Currency,
    exchangeRate: '3.5', // Default exchange rate
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId || !form.amount) return;

    onAddTransaction({
      accountId: form.accountId,
      type: form.type,
      currency: form.currency,
      exchangeRate: form.currency === 'USD' ? parseFloat(form.exchangeRate) : undefined,
      amount: parseFloat(form.amount),
      date: new Date(form.date).toISOString(),
      notes: form.notes
    });

    setSuccessMessage('تم الحفظ بنجاح!');
    setForm({
      accountId: '',
      type: TransactionType.DEPOSIT,
      currency: 'ILS',
      exchangeRate: '3.5',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    setTimeout(() => {
      setSuccessMessage('');
      setActiveTab('history'); // Switch to history to see the new entry
    }, 1500);
  };

  const filteredTransactions = transactions.filter(t => {
    const account = accounts.find(a => a.id === t.accountId);
    const searchString = `${account?.name || ''} ${t.notes || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Determine label for currency
  const getSymbol = (curr: string) => curr === 'USD' ? '$' : '₪';

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 md:flex-none px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'new' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('new')}
        >
          إضافة عملية جديدة
        </button>
        <button
          className={`flex-1 md:flex-none px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'history' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        >
          سجل العمليات
        </button>
      </div>

      {/* Content */}
      {activeTab === 'new' ? (
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PlusCircle className="text-primary-600" />
            تسجيل عملية مالية
          </h2>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-center font-bold border border-green-100 animate-pulse">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الحساب المرتبط</label>
                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                  value={form.accountId}
                  onChange={e => setForm({...form, accountId: e.target.value})}
                >
                  <option value="">اختر الحساب...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (الرصيد: {acc.balance.toLocaleString()} ₪)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع العملية</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({...form, type: TransactionType.DEPOSIT})}
                    className={`p-3 rounded-lg border text-center font-bold transition-all ${form.type === TransactionType.DEPOSIT ? 'bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    إيداع (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, type: TransactionType.WITHDRAWAL})}
                    className={`p-3 rounded-lg border text-center font-bold transition-all ${form.type === TransactionType.WITHDRAWAL ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    خصم (-)
                  </button>
                </div>
              </div>

              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({...form, currency: 'ILS'})}
                    className={`p-3 rounded-lg border text-center font-medium transition-all ${form.currency === 'ILS' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    شيكل (₪)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, currency: 'USD'})}
                    className={`p-3 rounded-lg border text-center font-medium transition-all ${form.currency === 'USD' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    دولار ($)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className={form.currency === 'USD' ? "col-span-1" : "col-span-1 md:col-span-2"}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ ({getSymbol(form.currency)})
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              {/* Exchange Rate Input (Only for USD) */}
              {form.currency === 'USD' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <RefreshCw size={14} />
                    سعر صرف الدولار (مقابل الشيكل)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 text-blue-800 font-bold"
                    value={form.exchangeRate}
                    onChange={e => setForm({...form, exchangeRate: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    سيتم إضافة: {(parseFloat(form.amount || '0') * parseFloat(form.exchangeRate || '0')).toLocaleString()} ₪ للرصيد
                  </p>
                </div>
              )}

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <input
                  required
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="وصف العملية..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-transform active:scale-95"
            >
              حفظ البيانات
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Mobile History Card View */}
          <div className="md:hidden space-y-4">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="بحث في السجلات..."
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredTransactions.map(t => {
                const account = accounts.find(a => a.id === t.accountId);
                return (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-full ${t.type === TransactionType.DEPOSIT ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {t.type === TransactionType.DEPOSIT ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                         </div>
                         <div>
                           <p className="font-bold text-gray-900 text-sm">{account?.name || 'مجهول'}</p>
                           <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                         </div>
                      </div>
                      <div className="text-left">
                        <span className={`block font-bold ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === TransactionType.DEPOSIT ? '+' : '-'}{t.amount.toLocaleString()} {getSymbol(t.currency)}
                        </span>
                        {t.currency === 'USD' && (
                          <span className="text-[10px] text-gray-400">سعر الصرف: {t.exchangeRate}</span>
                        )}
                      </div>
                    </div>
                    {t.notes && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                        {t.notes}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredTransactions.length === 0 && (
                <div className="text-center p-8 text-gray-500 bg-white rounded-xl">لا توجد عمليات مطابقة</div>
              )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-4">
               <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="بحث في السجلات..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-gray-600 font-medium text-sm">التاريخ</th>
                    <th className="p-4 text-gray-600 font-medium text-sm">الحساب</th>
                    <th className="p-4 text-gray-600 font-medium text-sm">نوع العملية</th>
                    <th className="p-4 text-gray-600 font-medium text-sm">المبلغ</th>
                    <th className="p-4 text-gray-600 font-medium text-sm">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(t => {
                    const account = accounts.find(a => a.id === t.accountId);
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-600 text-sm">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                        <td className="p-4 font-bold text-gray-900">{account?.name || 'مجهول'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${t.type === TransactionType.DEPOSIT ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type === TransactionType.DEPOSIT ? 'إيداع' : 'خصم'}
                            {t.type === TransactionType.DEPOSIT ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`font-bold ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-red-600'}`}>
                            {t.amount.toLocaleString()} {getSymbol(t.currency)}
                          </div>
                          {t.currency === 'USD' && (
                            <div className="text-xs text-gray-400 mt-1">
                              سعر الصرف: {t.exchangeRate}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-sm max-w-xs truncate">{t.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsView;