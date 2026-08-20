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
      if (user.role === 'superadmin' || user.role === 'admin') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('kalkulator');
      }
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', roles: ['superadmin', 'admin'] },
    { id: 'kalkulator', label: 'Calculator', roles: ['superadmin', 'admin', 'inputer', 'user'] },
    { id: 'proposal', label: 'Proposals', roles: ['superadmin', 'admin', 'inputer', 'user'] },
    { id: 'catalog', label: 'Price Catalog', roles: ['superadmin', 'admin', 'inputer'] },
    { id: 'users', label: 'Manage Accounts', roles: ['superadmin'] }
  ];

  const allowedTabs = tabs.filter(t => t.roles.includes(user.role));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
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
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="var(--tanS)" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="var(--n5)" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    kalkulator: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="var(--n5)" />
        <rect x="7" y="5" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="2" fill="#fff" />
        <circle cx="8" cy="13" r="1.5" fill="currentColor" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
        <circle cx="16" cy="13" r="1.5" fill="currentColor" />
        <circle cx="8" cy="17" r="1.5" fill="currentColor" />
        <circle cx="12" cy="17" r="1.5" fill="currentColor" />
        <circle cx="16" cy="17" r="1.5" fill="var(--tan)" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    proposal: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" fill="var(--n5)" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="#fff" />
        <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15.5" cy="17" r="1.5" fill="var(--tan)" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    catalog: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" fill="var(--tanS)" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--n5)" opacity="0.5" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" fill="var(--n5)" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="var(--tanS)" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
        <div className="brand-header flex flex-col gap-1 items-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-main text-white flex items-center justify-center font-black text-sm shadow-[0_4px_12px_rgba(0,31,209,0.3)]">
              LJ
            </div>
            <div className="text-left leading-none">
              <h1 className="text-xs font-black tracking-tight text-white uppercase">Lancar Jaya</h1>
              <span className="text-[8px] font-bold text-[#64748B] tracking-wider uppercase mt-1 block">LA &amp; Handling Services</span>
            </div>
          </div>
          <div className="text-[10px] font-arabic font-bold text-amber-400 mt-2 px-1 select-none pointer-events-none opacity-80">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>
        </div>

        {/* User profile card */}
        <div className="profile-card flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
            {user.username.substring(0, 2)}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[10px] font-bold text-slate-400">Good morning,</div>
            <div className="text-xs font-black text-white truncate max-w-[130px]">{user.username}</div>
            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-navy-main border border-navy-main/20 mt-1 inline-block">
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
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* DESKTOP Top Header Ribbon (only on desktop) */}
        <header className="hidden md:flex no-print h-14 border-b border-slate-200 bg-white items-center justify-between px-6 z-20 shadow-2xs">
          <div>
            <h2 className="text-xs font-black tracking-wider text-slate-400 uppercase">
              Workspace &middot; {activeTab === 'kalkulator' ? 'Package Calculator' : activeTab === 'proposal' ? 'Proposals List' : activeTab === 'catalog' ? 'Price Catalog' : activeTab === 'users' ? 'Manage Accounts' : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-arabic font-bold text-amber-500 mr-2 select-none">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </span>
            <span className="text-2xs font-bold text-slate-400">
              Secure database connection &middot; PT Lancar Jaya
            </span>
          </div>
        </header>

        {/* Scrollable Wrapper for Mobile (Header + Content scroll together) */}
        <div className="flex-1 overflow-y-auto md:overflow-visible md:flex md:flex-col print:overflow-visible">
          
          {/* MOBILE LAYOUT: CURVED GRADIENT HEADER BANNER */}
          <div className="md:hidden mobile-header-banner p-6 pb-12 text-white no-print overflow-hidden relative">
            {/* Islamic Graphic Overlay Watermarks */}
            <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none select-none z-0 text-white">
              {/* Kaaba Silhouette */}
              <svg className="w-40 h-40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 100 100">
                <path d="M50 15 L20 30 L20 70 L50 55 Z" fill="currentColor" fillOpacity="0.3" />
                <path d="M50 15 L80 30 L80 70 L50 55 Z" fill="currentColor" fillOpacity="0.5" />
                <path d="M50 15 L20 30 L50 45 L80 30 Z" fill="currentColor" fillOpacity="0.1" />
                {/* Gold Belt */}
                <path d="M20 40 L50 30" stroke="#FBBF24" strokeWidth="2.5" />
                <path d="M50 30 L80 40" stroke="#FBBF24" strokeWidth="2.5" />
                {/* Kaaba Door */}
                <path d="M58 48 L58 64 L68 69 L68 53 Z" fill="#FBBF24" fillOpacity="0.5" stroke="#FBBF24" strokeWidth="0.5" />
              </svg>
            </div>
            
            <div className="absolute left-[20%] bottom-0 opacity-[0.05] pointer-events-none select-none z-0 text-white">
              {/* Mosque Minaret & Domes Silhouette */}
              <svg className="w-48 h-32" fill="currentColor" viewBox="0 0 200 120">
                <path d="M70 120 C70 85, 130 85, 130 120 Z" />
                <path d="M100 85 L100 70 M97 73 C97 70, 103 70, 103 73" stroke="currentColor" strokeWidth="2" />
                <path d="M45 120 L55 120 L55 60 C55 55, 45 55, 45 60 Z" />
                <path d="M45 60 L50 45 L55 60 Z" />
                <path d="M145 120 L155 120 L155 60 C155 55, 145 55, 145 60 Z" />
                <path d="M145 60 L150 45 L155 60 Z" />
              </svg>
            </div>

            <div className="flex justify-between items-start z-10 relative">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase text-blue-200">LA &amp; Handling Services</span>
                  <span className="text-[9px] font-arabic font-bold text-amber-300 ml-1.5 opacity-90 select-none">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
                </div>
                <h2 className="text-lg font-black tracking-tight text-white mt-0.5">Lancar Jaya Calculator</h2>
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
            
            <div className="mt-5 text-left leading-relaxed z-10 relative">
              <p className="text-[10px] font-bold text-blue-200">Welcome back 👋</p>
              <h3 className="text-sm font-black text-white uppercase">{user.username}</h3>
            </div>
          </div>

          {/* MOBILE Ringkasan Stats Cards overlaying mobile curves */}
          {activeTab === 'dashboard' && (
            <div className="md:hidden mobile-stats-row no-print">
              <div className="grid grid-cols-2 gap-3">
                <div className="mobile-stats-card p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-navy-main flex items-center justify-center shadow-2xs overflow-hidden">
                    <img src="/passport.png" alt="Proposals" className="w-5.5 h-5.5 object-contain" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-black text-slate-900 leading-tight">{totalCount}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Proposals</div>
                  </div>
                </div>

                <div className="mobile-stats-card p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-warn flex items-center justify-center shadow-2xs overflow-hidden">
                    <img src="/hajj.png" alt="Pending" className="w-5.5 h-5.5 object-contain" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-black text-slate-900 leading-tight">{pendingCount}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Main content pane */}
          <main className="flex-1 md:overflow-y-auto p-4 md:p-6 pb-36 md:pb-6 print:p-0 print:overflow-visible">
            {renderContent()}
          </main>
        </div>

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
