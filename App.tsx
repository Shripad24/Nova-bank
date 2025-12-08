import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { Accounts } from './components/Accounts';
import { Statements } from './components/Statements';
import { Profile } from './components/Profile';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'statements' | 'profile'>('dashboard');

  // Listen for cross-page navigation events (e.g., View Profile button)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === 'profile') setActiveTab('profile');
      if (detail === 'accounts') setActiveTab('accounts');
      if (detail === 'statements') setActiveTab('statements');
      if (detail === 'dashboard') setActiveTab('dashboard');
    };
    window.addEventListener('app:navigate', handler as EventListener);
    return () => window.removeEventListener('app:navigate', handler as EventListener);
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700 border-r border-blue-700 hidden md:flex flex-col shadow-xl">
        <div className="p-6 border-b border-blue-400">
          <div className="flex items-center space-x-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xl font-bold tracking-tight drop-shadow">NovaBank</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'text-white bg-white/25' : 'text-blue-100 hover:bg-white/15'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('accounts')} className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'accounts' ? 'text-white bg-white/25' : 'text-blue-100 hover:bg-white/15'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Accounts</span>
          </button>
          <button onClick={() => setActiveTab('statements')} className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'statements' ? 'text-white bg-white/25' : 'text-blue-100 hover:bg-white/15'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Statements</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'text-white bg-white/25' : 'text-blue-100 hover:bg-white/15'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A11.955 11.955 0 0112 15c2.5 0 4.8.768 6.879 2.084M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Profile</span>
          </button>
        </nav>
        <div className="p-4 border-t border-blue-400">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-blue-100 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-blue-400 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        {/* Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-blue-600 to-cyan-400 p-4 border-b border-blue-700 flex justify-between items-center shadow-lg">
          <span className="font-bold text-white drop-shadow">NovaBank</span>
          <button onClick={logout} className="text-white hover:text-blue-100 transition-colors">Sign Out</button>
        </div>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'accounts' && <Accounts />}
        {activeTab === 'statements' && <Statements />}
        {activeTab === 'profile' && <Profile />}
        <Chatbot />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;