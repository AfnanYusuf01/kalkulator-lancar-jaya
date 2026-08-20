import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Catalog from './components/Catalog';
import Proposals from './components/Proposals';
import UserManagement from './components/UserManagement';

export default function App() {
  const { user, logout, proposals, fetchProposals } = useApp();
  const [activeTab, setActiveTab] = useState('kalkulator');

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', roles: ['superadmin', 'admin'] },
    { id: 'kalkulator', label: 'Kalkulator', roles: ['superadmin', 'admin', 'inputer', 'user'] },
    { id: 'proposal', label: 'Daftar Proposal', roles: ['superadmin', 'admin', 'inputer', 'user'] },
    { id: 'catalog', label: 'Katalog Tarif', roles: ['superadmin', 'admin', 'inputer'] },
    { id: 'users', label: 'Kelola Akun', roles: ['superadmin'] }
  ];

  const allowedTabs = tabs.filter(t => t.roles.includes(user.role));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'kalkulator':
        return <Calculator />;
      case 'proposal':
        return <Proposals />;
      case 'catalog':
        return <Catalog />;
      case 'users':
        return <UserManagement />;
      default:
        return <Calculator />;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const tabIcons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    kalkulator: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <circle cx="8" cy="14" r="1" />
        <circle cx="12" cy="14" r="1" />
        <circle cx="16" cy="14" r="1" />
        <circle cx="8" cy="18" r="1" />
        <circle cx="12" cy="18" r="1" />
        <circle cx="16" cy="18" r="1" />
      </svg>
    ),
    proposal: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    catalog: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  };

  const pendingCount = proposals ? proposals.filter(p => p.status === 'PENDING_APPROVAL').length : 0;
  const totalCount = proposals ? proposals.length : 0;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A] font-sans antialiased overflow-hidden">
      
      {/* 1. DESKTOP LAYOUT: SIDEBAR (hidden on mobile) */}
      <aside className="hidden md:flex desktop-sidebar no-print">
        {/* Brand Header */}
        <div className="brand-header flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0066FF] text-white flex items-center justify-center font-black text-sm shadow-[0_4px_12px_rgba(0,102,255,0.3)]">
            LJ
          </div>
          <div className="text-left leading-none">
            <h1 className="text-xs font-black tracking-tight text-white uppercase">Lancar Jaya</h1>
            <span className="text-[8px] font-bold text-[#64748B] tracking-wider uppercase mt-1 block">LA &amp; Handling Services</span>
          </div>
        </div>

        {/* User profile card */}
        <div className="profile-card flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
            {user.username.substring(0, 2)}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[10px] font-bold text-slate-400">Selamat pagi,</div>
            <div className="text-xs font-black text-white truncate max-w-[130px]">{user.username}</div>
            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-[#0066FF] border border-[#0066FF]/20 mt-1 inline-block">
              {user.role}
            </span>
          </div>
        </div>

        {/* Desktop Sidebar Links */}
        <nav className="nav-links">
          {allowedTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {tabIcons[tab.id]}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={logout}
            className="w-full nav-item hover:bg-red-950/20 hover:text-red-400 flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 font-semibold text-xs transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* MOBILE LAYOUT: CURVED GRADIENT HEADER BANNER (hidden on desktop) */}
        <div className="md:hidden mobile-header-banner p-6 pb-12 text-white no-print">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-extrabold tracking-wider uppercase text-blue-200">LA &amp; Handling Services</span>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">Kalkulator Lancar Jaya</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/10 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-wider">
                {user.role}
              </span>
              <button
                type="button"
                onClick={logout}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer relative z-[99]"
                title="Keluar"
              >
                <svg className="w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-5 text-left leading-relaxed">
            <p className="text-[10px] font-bold text-blue-200">Selamat bekerja,</p>
            <h3 className="text-sm font-black text-white uppercase">{user.username}</h3>
          </div>
        </div>

        {/* MOBILE Ringkasan Stats Cards overlaying mobile curves */}
        <div className="md:hidden mobile-stats-row no-print">
          <div className="grid grid-cols-2 gap-3">
            <div className="mobile-stats-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center shadow-2xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[14px] font-black text-[#0F172A] leading-tight">{totalCount}</div>
                <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Total Proposal</div>
              </div>
            </div>

            <div className="mobile-stats-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center shadow-2xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[14px] font-black text-[#0F172A] leading-tight">{pendingCount}</div>
                <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Pending Approval</div>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP Top Header Ribbon (only on desktop) */}
        <header className="hidden md:flex no-print h-14 border-b border-slate-200 bg-white items-center justify-between px-6 z-20 shadow-2xs">
          <div>
            <h2 className="text-xs font-black tracking-wider text-slate-400 uppercase">
              Workspace &middot; {activeTab === 'kalkulator' ? 'Kalkulator Paket' : activeTab === 'proposal' ? 'Daftar Proposal' : activeTab === 'catalog' ? 'Katalog Item & Paket' : activeTab === 'users' ? 'Kelola Akun' : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xs font-bold text-slate-400">
              Koneksi database aman &middot; PT Lancar Jaya
            </span>
          </div>
        </header>

        {/* Scrollable Main content pane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 md:pb-6 print:p-0 print:overflow-visible">
          {renderContent()}
        </main>

        {/* MOBILE LAYOUT: BOTTOM NAVIGATION BAR (fixed, hidden on desktop) */}
        <nav className="md:hidden mobile-bottom-nav no-print">
          {allowedTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                {tabIcons[tab.id]}
                <span className="text-[8px] font-extrabold uppercase mt-1">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
