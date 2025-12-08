import React, { useEffect, useMemo, useState } from 'react';
import { Account, Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { bankingService } from '../services/mockDatabase';

export const Statements: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [accs, txs] = await Promise.all([
          bankingService.getAccounts(user.id),
          bankingService.getTransactions(user.id, 20)
        ]);
        setAccounts(accs);
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to load statements data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filteredTx = useMemo(() => {
    if (selectedAccountId === 'all') return transactions;
    return transactions.filter(t => t.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  const accountMap = useMemo(() => Object.fromEntries(accounts.map(a => [a.id, a])), [accounts]);

  if (loading) return <div className="p-6 text-gray-500">Loading statements...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">Statements</h2>
          <p className="text-gray-600 text-sm">View recent activity by account.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Account</label>
          <select
            value={selectedAccountId}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-blue-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.accountNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="grid grid-cols-12 text-sm font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b border-blue-200">
          <div className="col-span-4">Description</div>
          <div className="col-span-3">Account</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        {filteredTx.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTx.map(tx => {
              const acc = accountMap[tx.accountId];
              const amount = tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
              return (
                <div key={tx.id} className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-blue-50 transition-colors">
                  <div className="col-span-4 font-medium text-gray-900">{tx.description}</div>
                  <div className="col-span-3 text-gray-600">{acc ? `${acc.name} (${acc.accountNumber})` : 'Account'}</div>
                  <div className="col-span-3 text-gray-500">{new Date(tx.date).toLocaleDateString()}</div>
                  <div className={`col-span-2 text-right font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount >= 0 ? '+' : ''}{amount}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
