import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Download, Phone, Calendar, Hash } from 'lucide-react';
import { Account, Transaction } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount: (account: Account) => void;
  onUpdateAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onExport: () => void;
}

const AccountsView: React.FC<AccountsViewProps> = ({ 
  accounts, transactions, onAddAccount, onUpdateAccount, onDeleteAccount, onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const filteredAccounts = accounts.filter(acc => 
    acc.name.includes(searchTerm) || (acc.phoneNumber && acc.phoneNumber.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      onUpdateAccount({
        ...editingAccount,
        name: formData.name,
        phoneNumber: formData.phone
      });
    } else {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        name: formData.name,
        phoneNumber: formData.phone,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      onAddAccount(newAccount);
    }
    closeModal();
  };

  const openModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({ name: account.name, phone: account.phoneNumber || '' });
    } else {
      setEditingAccount(null);
      setFormData({ name: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث باسم الحساب أو الرقم..."
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 md:flex-none"
          >
            <Download size={18} />
            <span className="hidden md:inline">تصدير</span>
            <span className="md:hidden">Excel</span>
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex-1 md:flex-none"
          >
            <Plus size={18} />
            <span>إضافة حساب</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View (Visible on small screens) */}
      <div className="md:hidden space-y-4">
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map(account => (
            <div key={account.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-mono mt-1">
                    <Hash size={10} />
                    {account.id.slice(0, 8)}
                  </div>
                </div>
                <div className={`text-lg font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {account.balance.toLocaleString()} ₪
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>{account.phoneNumber || 'لا يوجد'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{account.lastTransactionDate ? new Date(account.lastTransactionDate).toLocaleDateString('ar-EG') : '-'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => openModal(account)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-700 bg-blue-50 rounded-lg text-sm font-bold active:bg-blue-100" 
                >
                  <Edit2 size={16} />
                  تعديل
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) onDeleteAccount(account.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-red-700 bg-red-50 rounded-lg text-sm font-bold active:bg-red-100" 
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-gray-500 bg-white rounded-xl">لا توجد حسابات</div>
        )}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-gray-600 font-medium text-sm">اسم صاحب الحساب</th>
                <th className="p-4 text-gray-600 font-medium text-sm">رقم الحساب (ID)</th>
                <th className="p-4 text-gray-600 font-medium text-sm">رقم الهاتف</th>
                <th className="p-4 text-gray-600 font-medium text-sm">الرصيد الحالي</th>
                <th className="p-4 text-gray-600 font-medium text-sm">آخر عملية</th>
                <th className="p-4 text-gray-600 font-medium text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 font-bold text-gray-900">{account.name}</td>
                    <td className="p-4 text-gray-500 text-sm font-mono">{account.id.slice(0, 8)}...</td>
                    <td className="p-4 text-gray-600 text-sm">{account.phoneNumber || '-'}</td>
                    <td className={`p-4 font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {account.balance.toLocaleString()} ₪
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {account.lastTransactionDate 
                        ? new Date(account.lastTransactionDate).toLocaleDateString('ar-EG') 
                        : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(account)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) onDeleteAccount(account.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded" 
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    لا توجد حسابات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم صاحب الحساب</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsView;