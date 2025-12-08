import React, { useEffect, useState } from 'react';
import { Account } from '../types';
import { useAuth } from '../context/AuthContext';
import { bankingService } from '../services/mockDatabase';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [aadhaar, setAadhaar] = useState(user?.aadhaar || '');
  const [pan, setPan] = useState(user?.pan || '');
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'Not Started');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const accs = await bankingService.getAccounts(user.id);
        setAccounts(accs);
        setAadhaar(user.aadhaar || '');
        setPan(user.pan || '');
        setKycStatus(user.kycStatus || 'Not Started');
      } catch (err) {
        console.error('Failed to load profile accounts', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleKycUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      // Basic validation for Aadhaar (12 digits) and PAN (5 letters, 4 digits, 1 letter)
      const aadhaarClean = aadhaar.replace(/\s+/g, '');
      const panClean = pan.toUpperCase();
      const aadhaarValid = /^\d{12}$/.test(aadhaarClean);
      const panValid = /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panClean);
      if (!aadhaarValid) throw new Error('Aadhaar must be 12 digits.');
      if (!panValid) throw new Error('PAN must match pattern: ABCDE1234F.');

      const updated = await bankingService.updateKyc(user.id, aadhaarClean, panClean);
      setAadhaar(updated.aadhaar || '');
      setPan(updated.pan || '');
      setKycStatus(updated.kycStatus || 'Verified');
      setMessage('KYC updated successfully.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to update KYC.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading profile...</div>;

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6 md:p-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-blue-700">Profile</h2>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-xl p-4 shadow-md space-y-1">
            <p className="text-sm opacity-80">Name</p>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-sm opacity-80 pt-2">Email</p>
            <p className="text-sm">{user?.email}</p>
            {user?.phone && (
              <>
                <p className="text-sm opacity-80 pt-2">Phone</p>
                <p className="text-sm">{user.phone}</p>
              </>
            )}
          </div>
          <form onSubmit={handleKycUpdate} className="border border-blue-100 rounded-xl p-4 bg-white/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">KYC Details (India)</p>
                <p className="text-xs text-gray-500">Provide Aadhaar (12 digits) and PAN (ABCDE1234F)</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${kycStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {kycStatus || 'Not Started'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Aadhaar Number</label>
                <input
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value)}
                  placeholder="1234 5678 9000"
                  className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">PAN Number</label>
                <input
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white uppercase"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-lg shadow hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {saving ? 'Updating...' : 'Update KYC'}
              </button>
              {message && <span className="text-sm text-gray-600">{message}</span>}
            </div>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-blue-100 rounded-xl p-4 bg-white/80 shadow-sm">
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-blue-700">{totalBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
              <p className="text-xs text-gray-500 mt-1">Across all linked accounts.</p>
            </div>
            <div className="border border-blue-100 rounded-xl p-4 bg-white/80 shadow-sm">
              <p className="text-sm text-gray-600">KYC Status</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
                <button className="px-3 py-1 text-xs rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">Update KYC</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">PAN & Aadhaar validated as per Indian banking norms.</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-700">Linked Accounts</h3>
          <div className="space-y-3">
            {accounts.map(acc => (
              <div key={acc.id} className="border border-blue-100 rounded-xl p-4 bg-gradient-to-br from-white via-blue-50 to-cyan-50 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span className="uppercase tracking-wide">{acc.type}</span>
                  <span className="text-gray-400">{acc.accountNumber}</span>
                </div>
                <div className="text-base font-semibold text-blue-800">{acc.name}</div>
                <div className="text-xl font-bold text-gray-900 mt-1">{acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
