import React, { useEffect, useState } from 'react';
import { Account } from '../types';
import { useAuth } from '../context/AuthContext';
import { bankingService } from '../services/mockDatabase';

export const Accounts: React.FC = () => {
  const { user, updateKyc } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [aadhaar, setAadhaar] = useState(user?.aadhaar || '');
  const [pan, setPan] = useState(user?.pan || '');
  const [kycMessage, setKycMessage] = useState<string | null>(null);
  const [kycSaving, setKycSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const accs = await bankingService.getAccounts(user.id);
        setAccounts(accs);
        setAadhaar(user.aadhaar || '');
        setPan(user.pan || '');
      } catch (err) {
        console.error('Failed to load accounts', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleKycUpdate = async () => {
    if (!user) return;
    setKycSaving(true);
    setKycMessage(null);
    try {
      const aadhaarClean = aadhaar.replace(/\s+/g, '');
      const panClean = pan.toUpperCase();
      const aadhaarValid = /^\d{12}$/?.test(aadhaarClean);
      const panValid = /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panClean);
      if (!aadhaarValid) throw new Error('Aadhaar must be 12 digits');
      if (!panValid) throw new Error('PAN must match pattern ABCDE1234F');
      await updateKyc(aadhaarClean, panClean);
      setKycMessage('KYC updated successfully');
    } catch (err: any) {
      setKycMessage(err?.message || 'Failed to update KYC');
      console.error(err);
    } finally {
      setKycSaving(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (loading) return <div className="p-6 text-gray-500">Loading accounts...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Account Overview</h2>
          <p className="text-sm text-gray-500 mb-6">Your linked NovaBank accounts and balances.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="border border-blue-100 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white via-blue-50 to-cyan-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500">{acc.type}</span>
                  <span className="text-xs text-gray-400">{acc.accountNumber}</span>
                </div>
                <div className="text-lg font-semibold text-blue-800">{acc.name}</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-blue-700">Profile & KYC</h2>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-xl p-4 shadow-md">
            <p className="text-sm opacity-80">Name</p>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-sm mt-2 opacity-80">Email</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div className="border border-blue-100 rounded-xl p-4 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">KYC Status</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Keep your profile up to date for secure banking.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <input
                value={aadhaar}
                onChange={e => setAadhaar(e.target.value)}
                placeholder="Aadhaar (12 digits)"
                className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              <input
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase())}
                placeholder="PAN (ABCDE1234F)"
                className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white uppercase"
              />
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleKycUpdate}
                disabled={kycSaving}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-lg shadow hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {kycSaving ? 'Updating...' : 'Update KYC'}
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'profile' }))}
                className="px-3 py-2 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50"
              >
                View Profile
              </button>
            </div>
            {kycMessage && <p className="text-xs text-gray-600 mt-2">{kycMessage}</p>}
          </div>
          <div className="border border-blue-100 rounded-xl p-4 bg-white/80">
            <p className="text-sm text-gray-600">Total Balance</p>
            <p className="text-2xl font-bold text-blue-700">{totalBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
            <p className="text-xs text-gray-500 mt-1">Includes checking, savings, and credit balances.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
