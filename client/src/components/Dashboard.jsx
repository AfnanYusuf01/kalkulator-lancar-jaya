import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { token } = useApp();
  const [stats, setStats] = useState(null);
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
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data statistik dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatSAR = (v) => {
    return parseFloat(v).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' SAR';
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
    if (m >= 20) return 'TARGET — Profit Aman';
    if (m >= 12.5) return 'FLOOR — Perlu Persetujuan';
    return 'DI BAWAH FLOOR — Tidak Layak';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-[#000066] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-650 font-bold">
        {error || 'Terjadi kesalahan saat memuat data.'}
      </div>
    );
  }

  const { summary, costSpread, costPercentage } = stats;

  const costColors = {
    HANDLING: '#000066',
    MUTHOWIF: '#23237A',
    KATERING: '#40408F',
    DRIVER: '#5E5EA5',
    PHOTO: '#8080BC',
    MEDIS: '#A5A5D2',
    TAMBAHAN: '#C89D7C'
  };

  const costLabels = {
    HANDLING: 'Handling Layanan',
    MUTHOWIF: 'Muthowif & Guide',
    KATERING: 'Katering & Snack',
    DRIVER: 'Tips Driver Bus',
    PHOTO: 'Dokumentasi/Photo',
    MEDIS: 'Tenaga Medis',
    TAMBAHAN: 'Layanan Tambahan'
  };

  return (
    <div className="space-y-4">
      
      {/* Title Header */}
      <div className="border-b border-[#DBDBDB] pb-4 mb-2">
        <h1 className="text-base font-black text-[#000066] tracking-tight uppercase">Dashboard Analisis Keuntungan</h1>
        <p className="text-[10px] text-[#6E6E85] font-semibold tracking-wider mt-0.5">Statistik profitabilitas dan sebaran biaya proposal penawaran</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="ch">
            <span>Total Proposal</span>
          </div>
          <div className="cb flex flex-col justify-between h-24">
            <div className="text-3xl font-black text-[#000066]">{summary.total_proposals}</div>
            <div className="text-[10px] text-[#6E6E85] font-medium">Proposal penawaran terdaftar</div>
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <span>Proyeksi Akumulasi Profit</span>
          </div>
          <div className="cb flex flex-col justify-between h-24">
            <div className="text-2xl font-black text-[#1F7A4D]">{formatSAR(summary.total_profit)}</div>
            <div className="text-2xs text-[#6E6E85] font-bold">{formatIDR(summary.total_profit)}</div>
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <span>Rata-rata Margin Penjualan</span>
          </div>
          <div className="cb flex flex-col justify-between h-24">
            <div className="text-2xl font-black text-[#000066]">
              {parseFloat(summary.avg_margin).toFixed(1).replace('.', ',')}%
            </div>
            <div className={`status ${getMarginClass(summary.avg_margin)} text-[10px] py-1 mt-1`}>
              {getMarginStatusText(summary.avg_margin)}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Composition Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cost stack chart */}
        <div className="card lg:col-span-2">
          <div className="ch">
            <span>Sebaran Komposisi Pengeluaran (Direct Cost)</span>
          </div>
          
          {/* Stack bar */}
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
                      <div className="text-2xs font-bold text-[#000066]">{formatSAR(val)}</div>
                      <div className="text-[9px] font-bold text-[#6E6E85]">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Financial Metrics */}
        <div className="card flex flex-col justify-between">
          <div className="ch">
            <span>Rincian Keuangan Global</span>
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
              <span className="font-bold text-[#000066]">Total Full Cost</span>
              <span className="text-[#000066] font-black">{formatSAR(summary.total_full_cost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b-2 border-[#000066]/20 text-[#000066]">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Nilai Jual</span>
              <span className="font-black text-sm">{formatSAR(summary.total_sell_price)}</span>
            </div>
          </div>

          <div className="note border-t border-[#grey] bg-slate-50 p-4">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#6E6E85]">Konversi Rupiah Global</div>
            <div className="text-sm font-black mt-1 text-[#000066]">{formatIDR(summary.total_sell_price)}</div>
            <div className="text-[9px] text-[#6E6E85] font-light mt-0.5">Berdasarkan kurs acuan proposal terkait</div>
          </div>
        </div>

      </div>
    </div>
  );
}
