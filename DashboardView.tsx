import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Wallet, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Account, Transaction, TransactionType } from '../types';
import StatCard from './StatCard';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ accounts, transactions }) => {
  // Calculate Stats
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAccounts = accounts.length;
  
  // Recent activity (last 5)
  const recentActivity = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Prepare Chart Data (Monthly)
  const getMonthlyData = () => {
    const data: Record<string, { name: string; deposits: number; withdrawals: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // Format MM/YYYY
      
      // Convert to base currency (ILS) for charting if it's USD
      const amountInILS = t.currency === 'USD' && t.exchangeRate 
        ? t.amount * t.exchangeRate 
        : t.amount;

      if (!data[key]) {
        data[key] = { name: key, deposits: 0, withdrawals: 0 };
      }
      
      if (t.type === TransactionType.DEPOSIT) {
        data[key].deposits += amountInILS;
      } else {
        data[key].withdrawals += amountInILS;
      }
    });

    return Object.values(data).slice(-6); // Last 6 months
  };

  const chartData = getMonthlyData();

  // Helper to get symbol
  const getSymbol = (currency: string) => currency === 'USD' ? '$' : '₪';

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي الرصيد" 
          value={`${totalBalance.toLocaleString()} ₪`} 
          icon={<Wallet size={24} />}
          color="blue"
        />
        <StatCard 
          title="عدد الحسابات" 
          value={totalAccounts} 
          icon={<Users size={24} />}
          color="indigo"
        />
        <StatCard 
          title="إيداعات الشهر" 
          value={`${chartData.length > 0 ? Math.round(chartData[chartData.length-1].deposits).toLocaleString() : 0} ₪`}
          icon={<ArrowUpRight size={24} />}
          color="green"
        />
        <StatCard 
          title="سحوبات الشهر" 
          value={`${chartData.length > 0 ? Math.round(chartData[chartData.length-1].withdrawals).toLocaleString() : 0} ₪`}
          icon={<ArrowDownLeft size={24} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">النشاط الشهري (بالشيكل)</h3>
          <div className="h-64 md:h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} width={35} />
                <Tooltip 
                  contentStyle={{ direction: 'rtl', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value: number) => [`${Math.round(value).toLocaleString()} ₪`, '']}
                />
                <Bar dataKey="deposits" name="إيداع" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" name="سحب" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">آخر العمليات</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد عمليات حديثة</p>
            ) : (
              recentActivity.map(t => {
                const account = accounts.find(a => a.id === t.accountId);
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${t.type === TransactionType.DEPOSIT ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === TransactionType.DEPOSIT ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{account?.name || 'حساب محذوف'}</p>
                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`font-bold text-sm block ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === TransactionType.DEPOSIT ? '+' : '-'}{t.amount.toLocaleString()} {getSymbol(t.currency)}
                      </span>
                      {t.currency === 'USD' && (
                         <span className="text-[10px] text-gray-400 block">
                           {t.exchangeRate}
                         </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-primary-600 font-medium hover:text-primary-700">
            عرض كل السجل
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;