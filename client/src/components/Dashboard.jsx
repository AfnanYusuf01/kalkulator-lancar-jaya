import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard({ onNavigate }) {
  const { token, user } = useApp();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setStats(data);

      if (user?.role === 'superadmin') {
        const uRes = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsersList(uData);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatSAR = (v) => {
    return parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' SAR';
  };

  const formatIDR = (sar, rate = 4800) => {
    return 'Rp ' + (parseFloat(sar) * rate).toLocaleString('id-ID', { maximumFractionDigits: 0 });
  };

  const getMarginClass = (m) => {
    if (m >= 20) return 'ok';
    if (m >= 12.5) return 'wr';
    return 'bd';
  };

  const getMarginStatusText = (m) => {
    if (m >= 20) return 'TARGET — Safe Profit';
    if (m >= 12.5) return 'FLOOR — Needs Approval';
    return 'BELOW FLOOR — Unviable';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-navy-main border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-655 font-bold bg-red-50 rounded-xl border border-red-100">
        {error || 'Statistical data is unavailable.'}
      </div>
    );
  }

  const { summary, costSpread, costPercentage } = stats;

  const costColors = {
    HANDLING: '#3B82F6',
    MUTHOWIF: '#60A5FA',
    KATERING: '#93C5FD',
    DRIVER: '#64748B',
    PHOTO: '#94A3B8',
    MEDIS: '#EFF6FF',
    TAMBAHAN: '#DBEAFE'
  };

  const costLabels = {
    HANDLING: 'Handling Services',
    MUTHOWIF: 'Muthowif & Guide',
    KATERING: 'Catering & Snacks',
    DRIVER: 'Bus Driver Tips',
    PHOTO: 'Photo & Documentation',
    MEDIS: 'Medical Team',
    TAMBAHAN: 'Additional Services'
  };

  const iconSearch = (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const iconSettingsFilter = (
    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );

  const iconBell = (
    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  return (
    <div>
      {/* ----------------- 1. DESKTOP VIEW ----------------- */}
      <div className="hidden md:block space-y-4">
        {/* Title Header Hero Card with Haram Grand Mosque */}
        <div className="relative overflow-hidden rounded-3xl p-6 text-white mb-6 shadow-md flex justify-between items-end min-h-[170px]" style={{ backgroundImage: 'linear-gradient(to right, rgba(30, 58, 138, 0.95), rgba(15, 23, 42, 0.75)), url("/Haram.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="relative z-10 text-left max-w-xl">
            <div className="text-[10px] font-arabic font-bold text-amber-300 select-none mb-1">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
            <h1 className="text-2xl font-black tracking-tight uppercase leading-none">Profit Analysis Dashboard</h1>
            <p className="text-xs text-blue-100 font-medium tracking-wide mt-1.5 leading-relaxed">
              Analisis tingkat profitabilitas, distribusi biaya langsung (direct cost), dan pengelolaan berkas penawaran kemitraan Muthowif PT Lancar Jaya.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('kalkulator')}
              className="mt-4 px-4 py-2 bg-white hover:bg-slate-50 text-navy-main text-[10px] font-black uppercase rounded-full shadow-md tracking-wider transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              Mulai Kalkulasi Proposal &rarr;
            </button>
          </div>
          {/* Subtle gold ribbon line at bottom */}
          <div className="absolute left-0 bottom-0 right-0 h-1.5 bg-amber-400"></div>
        </div>

        {/* High-Fidelity KPI Cards (Texts Left, PNG Icons Right - Using colorful Flaticons) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card flex justify-between items-center p-5 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Proposals</span>
              <div className="text-3xl font-black text-navy-main leading-none">{summary.total_proposals}</div>
              <div className="text-[9px] text-[#6E6E85] font-semibold">Proposal penawaran terdaftar</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <img src="/flaticon/2887404_512.png" alt="Proposals" className="w-9 h-9 object-contain" />
            </div>
          </div>

          <div className="card flex justify-between items-center p-5 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Projected Cumulative Profit</span>
              <div className="text-2xl font-black text-emerald-600 leading-none">{formatSAR(summary.total_profit)}</div>
              <div className="text-[9px] text-[#6E6E85] font-semibold">{formatIDR(summary.total_profit)}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <img src="/flaticon/1354420_512.png" alt="Profit" className="w-9 h-9 object-contain" />
            </div>
          </div>

          <div className="card flex justify-between items-center p-5 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="text-left space-y-1.5 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Sales Margin</span>
              <div className="text-3xl font-black text-navy-main leading-none">{parseFloat(summary.avg_margin).toFixed(1)}%</div>
              <div className={`status ${getMarginClass(summary.avg_margin)} text-[8.5px] font-extrabold uppercase py-0.5 px-2 rounded-full inline-block mt-1`}>
                {getMarginStatusText(summary.avg_margin).split('—')[0]}
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <img src="/flaticon/10741201_512.png" alt="Margin" className="w-9 h-9 object-contain" />
            </div>
          </div>
        </div>

        {/* Cost Composition & Admin Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cost stack chart */}
          <div className="card lg:col-span-2">
            <div className="ch">
              <span>Expense Composition Distribution (Direct Cost)</span>
            </div>
            <div className="cb space-y-5">
              <div className="bar">
                {Object.entries(costPercentage).map(([group, pct]) => {
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={group}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: costColors[group] || '#CBD5E1'
                      }}
                      className="bs2"
                      title={`${costLabels[group]}: ${pct.toFixed(1)}%`}
                    />
                  );
                })}
              </div>

              {/* Grid listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {Object.entries(costSpread).map(([group, val]) => {
                  const pct = costPercentage[group] || 0;
                  if (val <= 0) return null;
                  return (
                    <div key={group} className="flex items-center justify-between p-3 border border-[#DBDBDB] rounded-lg bg-[#FAFAFC] hover:bg-white transition duration-150">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: costColors[group] }}
                        />
                        <span className="text-2xs font-bold text-slate-700">{costLabels[group]}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xs font-bold text-navy-main">{formatSAR(val)}</div>
                        <div className="text-[9px] font-bold text-[#6E6E85]">{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right metrics sidebar */}
          <div className="space-y-4">
            {/* Superadmin Card (Hanya Desktop) */}
            {user?.role === 'superadmin' && (
              <div className="card">
                <div className="ch">
                  <span>Superadmin Quick Console</span>
                </div>
                <div className="cb space-y-3">
                  <div className="p-3 bg-amber-50 border border-[#FEF7E0] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{usersList.length} Accounts</div>
                      <div className="text-[9px] text-[#6E6E85] font-semibold mt-0.5">Lancar Jaya User Database</div>
                    </div>
                    <button type="button" onClick={() => onNavigate && onNavigate('users')} className="px-3 py-1 bg-white border border-slate-200 text-2xs font-bold rounded-lg text-navy-main transition hover:bg-slate-50">
                      Manage
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {usersList.slice(0, 3).map(u => (
                      <div key={u.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100/50">
                        <span className="font-semibold text-slate-700">{u.username}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Global Financial Metrics */}
            <div className="card flex flex-col justify-between">
              <div className="ch">
                <span>Global Financial Summary</span>
              </div>
              <div className="cb space-y-4 font-semibold text-xs flex-1">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                  <span className="text-[#6E6E85] font-medium">Total Direct Cost</span>
                  <span className="text-slate-800 font-bold">{formatSAR(summary.total_direct_cost)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                  <span className="text-[#6E6E85] font-medium">Overhead &amp; Buffer</span>
                  <span className="text-slate-800 font-bold">
                    {formatSAR(summary.total_full_cost - summary.total_direct_cost)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
                  <span className="font-bold text-navy-main">Total Full Cost</span>
                  <span className="text-navy-main font-black">{formatSAR(summary.total_full_cost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b-2 border-navy-main/20 text-navy-main">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Total Sell Price</span>
                  <span className="font-black text-sm">{formatSAR(summary.total_sell_price)}</span>
                </div>
              </div>
              <div className="note border-t border-[#grey] bg-slate-50 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#6E6E85]">Global IDR Conversion</div>
                <div className="text-sm font-black mt-1 text-navy-main">{formatIDR(summary.total_sell_price)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- 2. MOBILE VIEW (Direct KPI & Live Charts) ----------------- */}
      <div className="md:hidden bg-[#F4F6F9] rounded-t-[32px] pt-8 px-4 pb-12 relative z-10 space-y-5 text-left font-sans">
        
        {/* Dynamic Welcome Header */}
        <div className="px-1 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-800 leading-tight">Assalamu'alaikum 👋</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Workspace PT Lancar Jaya</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-3xs border border-slate-100 relative">
            {iconBell}
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500"></span>
          </div>
        </div>

        {/* Majestic Mobile Hero Banner Card (Haram Grand Mosque background) */}
        <div className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-md mx-0.5 flex flex-col justify-end min-h-[160px]" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.85)), url("/Haram.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute top-4 left-4">
            <span className="text-[8px] font-arabic font-bold text-amber-300 select-none bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-2xs">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
          </div>
          <div className="text-left space-y-1 z-10">
            <h3 className="text-sm font-black uppercase tracking-tight leading-snug">Kalkulator Proposal Umrah</h3>
            <p className="text-[9px] text-slate-200 font-medium leading-relaxed max-w-[85%]">Buat proposal penawaran kemitraan Muthowif dengan estimasi biaya presisi dalam hitungan menit.</p>
            <button
              onClick={() => onNavigate && onNavigate('kalkulator')}
              className="mt-2 px-3 py-1.5 bg-white text-navy-main text-[9px] font-black uppercase rounded-full shadow-xs tracking-wider transition active:scale-95 inline-flex items-center gap-1 cursor-pointer"
            >
              Mulai Kalkulasi &rarr;
            </button>
          </div>
        </div>

        {/* Search input field (Membulat penuh) */}
        <div className="px-1 relative">
          <span className="absolute left-4.5 top-3.5">{iconSearch}</span>
          <input
            type="text"
            placeholder="Search proposal offers..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 shadow-3xs focus:outline-none focus:border-navy-main"
          />
          <span className="absolute right-4.5 top-3.5">{iconSettingsFilter}</span>
        </div>

        {/* Active Notification Pill Alert Card (Claims in progress mockup) */}
        <div
          onClick={() => onNavigate && onNavigate('proposal')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1.5 flex items-center justify-between text-white cursor-pointer active:scale-99 transition duration-150 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">You have {summary.total_proposals} active proposals</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Horizontal Scrollable Tags/Pill Menu */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Services</div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 px-1">
            <button
              onClick={() => onNavigate && onNavigate('kalkulator')}
              className="flex-shrink-0 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-full px-5 py-2.5 flex items-center gap-2 text-xs font-black text-navy-main transition"
            >
              <span className="w-4 h-4 rounded-full bg-white text-navy-main flex items-center justify-center font-bold text-3xs border border-blue-100">&bull;</span>
              Calculator
            </button>
            <button
              onClick={() => onNavigate && onNavigate('proposal')}
              className="flex-shrink-0 bg-amber-50 border border-amber-100 hover:bg-amber-100 rounded-full px-5 py-2.5 flex items-center gap-2 text-xs font-black text-amber-700 transition"
            >
              <span className="w-4 h-4 rounded-full bg-white text-amber-600 flex items-center justify-center font-bold text-3xs border border-amber-100">&bull;</span>
              Proposals
            </button>
            <button
              onClick={() => onNavigate && onNavigate('catalog')}
              className="flex-shrink-0 bg-teal-50 border border-teal-100 hover:bg-teal-100 rounded-full px-5 py-2.5 flex items-center gap-2 text-xs font-black text-teal-700 transition"
            >
              <span className="w-4 h-4 rounded-full bg-white text-teal-600 flex items-center justify-center font-bold text-3xs border border-teal-100">&bull;</span>
              Price Catalog
            </button>
            {user?.role === 'superadmin' && (
              <button
                onClick={() => onNavigate && onNavigate('users')}
                className="flex-shrink-0 bg-pink-50 border border-pink-100 hover:bg-pink-100 rounded-full px-5 py-2.5 flex items-center gap-2 text-xs font-black text-pink-700 transition"
              >
                <span className="w-4 h-4 rounded-full bg-white text-pink-600 flex items-center justify-center font-bold text-3xs border border-pink-100">&bull;</span>
                Manage Accounts
              </button>
            )}
          </div>
        </div>

        {/* Primary Mobile Modular Card 1: Total Proposals */}
        <div className="card shadow-[0_12px_24px_rgba(0,32,194,0.03)] bg-white rounded-[24px] border border-slate-100 relative overflow-hidden p-5 flex justify-between items-center">
          <div className="space-y-1 flex-1 text-left z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Proposals</span>
            <div className="text-3xl font-black text-slate-800">{summary.total_proposals}</div>
            <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">Proposal penawaran terdaftar</span>
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden border border-blue-100/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/20"></div>
            <img src="/flaticon/2887404_512.png" alt="Proposals" className="w-10 h-10 object-contain relative z-10" />
          </div>
        </div>

        {/* Primary Mobile Modular Card 2: Rata-Rata Margin */}
        <div className="card shadow-[0_12px_24px_rgba(0,32,194,0.03)] bg-white rounded-[24px] border border-slate-100 relative overflow-hidden p-5 flex justify-between items-center">
          <div className="space-y-2 flex-1 text-left z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Sales Margin</span>
            <div className="text-3xl font-black text-slate-800">{parseFloat(summary.avg_margin).toFixed(1)}%</div>
            
            <button
              onClick={() => {
                const el = document.getElementById('composition-chart-mobile');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-2 px-4 py-2 bg-navy-main hover:bg-navy-hover text-white text-[9px] font-black uppercase rounded-full shadow-sm tracking-wide transition active:scale-95"
            >
              View Cost Details
            </button>
          </div>
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden border border-amber-100/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/20"></div>
            <img src="/flaticon/10741201_512.png" alt="Margin" className="w-10 h-10 object-contain relative z-10" />
          </div>
        </div>

        {/* Primary Mobile Modular Card 3: Proyeksi Profit */}
        <div className="card shadow-[0_12px_24px_rgba(0,32,194,0.03)] bg-white rounded-[24px] border border-slate-100 relative overflow-hidden p-5 flex justify-between items-center">
          <div className="space-y-1 flex-1 text-left z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Projected Cumulative Profit</span>
            <div className="text-2xl font-black text-emerald-600 leading-tight">{formatSAR(summary.total_profit)}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{formatIDR(summary.total_profit)}</div>
          </div>
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden border border-emerald-100/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/20"></div>
            <img src="/flaticon/1354420_512.png" alt="Profit" className="w-10 h-10 object-contain relative z-10" />
          </div>
        </div>

        {/* Superadmin Card (Hanya Mobile untuk Superadmin) */}
        {user?.role === 'superadmin' && (
          <div className="card shadow-[0_15px_35px_rgba(0,32,194,0.04)] bg-white rounded-[24px] border border-slate-100">
            <div className="ch">
              <span>Superadmin Admin Overview</span>
            </div>
            <div className="cb space-y-4 p-4">
              <div className="flex justify-between items-center bg-[#EFF6FF] p-4 rounded-[16px] border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-3xs">
                    <svg className="w-5 h-5 text-navy-main" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-sm font-black text-slate-800">{usersList.length} Accounts</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Registered in Database</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('users')}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold rounded-full shadow-3xs text-navy-main transition active:scale-95"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">Recent Accounts</div>
                {usersList.slice(0, 3).map(u => (
                  <div key={u.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-[16px] bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-navy-main/10 text-navy-main text-2xs font-extrabold flex items-center justify-center uppercase">
                        {u.username.substring(0, 2)}
                      </div>
                      <span className="text-xs font-black text-slate-800">{u.username}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-navy-light/10 text-navy-main">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sebaran Biaya Panel */}
        <div id="composition-chart-mobile" className="card shadow-[0_15px_35px_rgba(0,32,194,0.04)] bg-white rounded-[24px] border border-slate-100">
          <div className="ch">
            <span>Cost Composition Distribution</span>
          </div>
          <div className="cb space-y-4 p-4 text-left">
            <div className="bar rounded-full overflow-hidden h-4">
              {Object.entries(costPercentage).map(([group, pct]) => {
                if (pct <= 0) return null;
                return (
                  <div
                    key={group}
                    style={{ width: `${pct}%`, backgroundColor: costColors[group] || '#CBD5E1' }}
                    className="bs2"
                  />
                );
              })}
            </div>
            <div className="space-y-2">
              {Object.entries(costSpread).map(([group, val]) => {
                const pct = costPercentage[group] || 0;
                if (val <= 0) return null;
                return (
                  <div key={group} className="flex items-center justify-between p-3 border border-slate-100 rounded-[16px] bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: costColors[group] }} />
                      <span className="text-[10px] font-bold text-slate-700">{costLabels[group]}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-navy-main">{formatSAR(val)}</div>
                      <div className="text-[9px] font-semibold text-slate-400">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profit Global Panel */}
        <div className="card shadow-[0_15px_35px_rgba(0,32,194,0.04)] bg-white rounded-[24px] border border-slate-100">
          <div className="ch">
            <span>Global Financial Summary</span>
          </div>
          <div className="cb space-y-3.5 text-xs font-semibold p-4 text-left">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
              <span className="text-slate-500 font-medium">Total Proposals</span>
              <span className="text-slate-800 font-black">{summary.total_proposals} proposals</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
              <span className="text-slate-500 font-medium">Average Margin</span>
              <span className="text-slate-800 font-black">{parseFloat(summary.avg_margin).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
              <span className="text-slate-500 font-medium">Total Cumulative Profit</span>
              <span className="text-emerald-600 font-black">{formatSAR(summary.total_profit)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60">
              <span className="text-slate-500 font-medium">Total Full Cost</span>
              <span className="text-navy-main font-black">{formatSAR(summary.total_full_cost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b-2 border-navy-main/20 text-navy-main">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Sell Price</span>
              <span className="font-black text-sm">{formatSAR(summary.total_sell_price)}</span>
            </div>
          </div>
          <div className="note border-t border-[#grey] bg-slate-50 p-4 text-left">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Global IDR Conversion</div>
            <div className="text-sm font-black mt-1 text-navy-main">{formatIDR(summary.total_sell_price)}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
