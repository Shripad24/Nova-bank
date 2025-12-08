import React, { useEffect, useState } from 'react';
import { Account, Transaction } from '../types';
import { bankingService } from '../services/mockDatabase';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, txs] = await Promise.all([
        bankingService.getAccounts(user.id),
        bankingService.getTransactions(user.id, 5)
      ]);
      setAccounts(accs);
      setTransactions(txs);
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh interval for demo purposes when things change via chat
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6 md:p-8">
      <header className="mb-8 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold drop-shadow">Good Morning, {user?.name.split(' ')[0]}</h1>
        <p className="text-blue-100 mt-2">Here's your financial overview.</p>
      </header>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full ${
              account.type === 'CHECKING' ? 'bg-blue-500' : 
              account.type === 'SAVINGS' ? 'bg-green-500' : 'bg-purple-500'
            }`}></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{account.type}</p>
                <h3 className="font-semibold text-gray-900">{account.name}</h3>
              </div>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{account.accountNumber}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {account.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <th className="pb-3 font-medium text-gray-500 text-sm">Description</th>
                <th className="pb-3 font-medium text-gray-500 text-sm">Date</th>
                <th className="pb-3 font-medium text-gray-500 text-sm text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
                  <td className="py-4 text-gray-900 font-medium">{tx.description}</td>
                  <td className="py-4 text-gray-500 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className={`py-4 text-right font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <p className="text-center text-gray-400 py-8">No recent transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};