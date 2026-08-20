import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Proposals() {
  const { proposals, fetchProposals, token, user, updateProposalStatus } = useApp();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [copyFlash, setCopyFlash] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleUpdateStatus = async (proposalId, status) => {
    if (!window.confirm(`Are you sure you want to ${status === 'APPROVED' ? 'approve' : 'reject'} this proposal?`)) return;
    try {
      await updateProposalStatus(proposalId, status);
      setSelectedProposal(prev => ({ ...prev, status }));
    } catch (err) {
      alert(err.message || 'Failed to update proposal status.');
    }
  };

  const handleRowClick = async (proposalId) => {
    setLoadingDetail(true);
    setDetailError('');
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSelectedProposal(data);
    } catch (err) {
      console.error(err);
      setDetailError('Failed to load proposal details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getDetailsList = () => {
    if (!selectedProposal || !selectedProposal.details_json) return [];
    try {
      return JSON.parse(selectedProposal.details_json);
    } catch (e) {
      return [];
    }
  };

  const formatSAR = (v) => {
    return parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' SAR';
  };

  const formatIDR = (v, rate) => {
    return 'Rp ' + (parseFloat(v) * rate).toLocaleString('id-ID', { maximumFractionDigits: 0 });
  };

  const getPkgIconPath = (code) => {
    if (code === 'BESAR') return '/flaticon/10741189_512.png';
    if (code === 'ESENSIAL') return '/flaticon/13609678_512.png';
    if (code === 'LENGKAP') return '/flaticon/10741221_512.png';
    return '/flaticon/10741201_512.png';
  };

  const getPkgBgClass = (idx) => {
    const colors = [
      'bg-[#FFC72C] text-[#1E3A8A]', // Vibrant Yellow with Deep Navy Text
      'bg-[#F97316] text-white',       // Vibrant Orange with White Text
      'bg-[#2563EB] text-white',       // Vibrant Royal Blue with White Text
      'bg-[#10B981] text-white'        // Vibrant Green with White Text
    ];
    return colors[idx % colors.length];
  };

  const handleCopySummary = () => {
    if (!selectedProposal) return;
    const p = selectedProposal;
    const details = getDetailsList();
    const isClient = user?.role === 'user';

    const pName = { BESAR: 'Large Group', ESENSIAL: 'Small Group — Essential', LENGKAP: 'Small Group — Complete' }[p.package_type];

    let text = `*HANDLING PROPOSAL — PT LANCAR JAYA*\n`;
    text += `${p.proposal_number} · ${p.client_name}\n`;
    text += `${pName}\n`;
    text += `${p.pax_count} pax · Muthowif ${p.duration_days} days · Hotel ${p.hotel_in} in / ${p.hotel_out} out\n`;
    text += `Catering: ${p.catering_class} · Tips: ${p.tips_scenario}\n`;
    text += `━━━━━━━━━━━━━━━\n`;

    if (!isClient) {
      text += `*COST BREAKDOWN*\n`;
      const categories = {};
      details.forEach(item => {
        const cat = item.g || 'ADDITIONAL';
        categories[cat] = (categories[cat] || 0) + parseFloat(item.sb || 0);
      });

      Object.entries(categories).forEach(([cat, val]) => {
        text += `- ${cat}: ${formatSAR(val)}\n`;
      });
      
      text += `\nDirect Cost: *${formatSAR(p.direct_cost)}*\n`;
      text += `Overhead & Buffer ${p.overhead_percent}%: ${formatSAR(p.full_cost - p.direct_cost)}\n`;
      text += `Full Cost: *${formatSAR(p.full_cost)}* (${formatSAR(p.full_cost / p.pax_count)}/pax)\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `*SELLING PRICE* (margin ${p.margin_percent}%)\n`;
    }

    const sellPerPax = p.sell_price / p.pax_count;
    text += `Per pax: *${formatSAR(sellPerPax)}* / ${formatIDR(sellPerPax, p.exchange_rate)}\n`;
    text += `Total group: *${formatSAR(p.sell_price)}* / ${formatIDR(p.sell_price, p.exchange_rate)}\n`;
    
    if (!isClient) {
      text += `Group profit: ${formatSAR(p.profit)}\n`;
    }
    
    text += `━━━━━━━━━━━━━━━\n`;
    text += `_Reference rate ${parseFloat(p.exchange_rate).toLocaleString('en-US')} IDR/SAR — re-check at transaction time._`;

    navigator.clipboard.writeText(text);
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isClient = user?.role === 'user';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="space-y-4 font-sans">
      
      {/* Title Header */}
      <div className="border-b border-[#DBDBDB] pb-4 mb-2 no-print text-left">
        <h1 className="text-base font-black tracking-tight uppercase" style={{ color: 'var(--navy)' }}>Proposals Registry</h1>
        <p className="text-[10px] text-[#6E6E85] font-semibold tracking-wider mt-0.5">Historical record of pricing proposals saved in the database</p>
      </div>

      {/* Proposals List Table (Desktop Only) */}
      <div className="card no-print hidden md:block bg-white text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                <th className="p-3.5">Proposal No.</th>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5 text-center">Package Type</th>
                <th className="p-3.5 text-center">Pax</th>
                {!isClient && (
                  <>
                    <th className="p-3.5 text-right">Profit</th>
                    <th className="p-3.5 text-center">Margin</th>
                  </>
                )}
                <th className="p-3.5 text-right">Group Selling Price</th>
                <th className="p-3.5 text-center">Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={isClient ? 6 : 8} className="p-10 text-center text-[#6E6E85] font-bold">
                    No saved proposals found.
                  </td>
                </tr>
              ) : (
                proposals.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/20 transition duration-150">
                    <td className="p-3.5 font-black" style={{ color: 'var(--navy)' }}>{p.proposal_number}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p.client_name}</td>
                    <td className="p-3.5 text-center font-bold text-slate-500">{p.package_type}</td>
                    <td className="p-3.5 text-center font-bold">{p.pax_count}</td>
                    {!isClient && (
                      <>
                        <td className="p-3.5 text-right text-emerald-600 font-bold">{formatSAR(p.profit)}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full inline-block ${
                            p.margin_percent >= 20 ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-amber-500 bg-amber-50 text-amber-600'
                          }`}>
                            {parseFloat(p.margin_percent)}%
                          </span>
                        </td>
                      </>
                    )}
                    <td className="p-3.5 text-right font-black" style={{ color: 'var(--navy)' }}>{formatSAR(p.sell_price)}</td>
                    <td className="p-3.5 text-center text-slate-400">
                      {new Date(p.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        p.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : p.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                      }`}>
                        {p.status === 'APPROVED' ? 'Approved' : p.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRowClick(p.id)}
                        className="px-3.5 py-1.5 text-white text-[10px] font-extrabold rounded-full transition shadow-3xs cursor-pointer active:scale-95"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposals List Cards (Mobile Only) */}
      <div className="md:hidden space-y-0 no-print pb-6">
        {proposals.length === 0 ? (
          <div className="card p-8 text-center text-[#6E6E85] font-bold bg-white rounded-3xl border border-slate-100">
            No saved proposals found.
          </div>
        ) : (
          proposals.map((p, idx) => {
            const isYellow = idx % 4 === 0;
            const textMutedClass = isYellow ? 'text-[#1E3A8A]/75' : 'text-blue-100/90';
            const numMutedClass = isYellow ? 'text-[#1E3A8A]/70' : 'text-blue-200/80';
            const badgeClass = isYellow ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]' : 'bg-white/20 text-white';
            const detailsBtnClass = isYellow 
              ? 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90' 
              : 'bg-white hover:bg-slate-50 text-slate-800';

            return (
              <div
                key={p.id}
                className={`rounded-[24px] pt-5 px-5 pb-7 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-slate-100/10 ${getPkgBgClass(idx)} flex flex-col justify-between transition duration-150 active:scale-[0.99] relative overflow-hidden`}
                style={{
                  marginTop: idx > 0 ? '-24px' : '0px',
                  zIndex: idx + 10,
                }}
              >
                {/* Top Row: Icon + Pax Count + Status */}
                <div className="flex justify-between items-center z-10">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-3xs flex-shrink-0">
                    <img src={getPkgIconPath(p.package_type)} alt={p.package_type} className="w-7 h-7 object-contain" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full backdrop-blur-2xs ${badgeClass}`}>
                      {p.pax_count} Pax
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      p.status === 'APPROVED' 
                        ? (isYellow ? 'bg-emerald-600/15 text-emerald-800' : 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/20')
                        : p.status === 'REJECTED'
                          ? (isYellow ? 'bg-red-600/15 text-red-800' : 'bg-red-500/20 text-red-100 border border-red-400/20')
                          : (isYellow ? 'bg-amber-600/15 text-amber-800' : 'bg-amber-500/20 text-amber-100 border border-amber-400/20 animate-pulse')
                    }`}>
                      {p.status === 'APPROVED' ? 'Approved' : p.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Middle Section: Proposal No & Client Name */}
                <div className="mt-3.5 text-left space-y-0.5 z-10">
                  <span className={`text-[8px] font-bold uppercase tracking-wider block ${numMutedClass}`}>
                    {p.proposal_number} &middot; Paket {p.package_type === 'BESAR' ? 'Grup Besar' : p.package_type === 'ESENSIAL' ? 'Kecil Esensial' : 'Kecil Lengkap'}
                  </span>
                  <h3 className="text-base font-black tracking-tight leading-tight">
                    {p.client_name}
                  </h3>
                  
                  {/* Condensed info line */}
                  {!isClient && (
                    <p className={`text-[9.5px] font-bold mt-1.5 ${textMutedClass}`}>
                      Margin: {parseFloat(p.margin_percent)}% &bull; Profit: {formatSAR(p.profit)}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Price + Details Circle Chevron Button (No line dividers) */}
                <div className="flex justify-between items-center mt-4 z-10">
                  <div className="text-left leading-tight">
                    <span className={`text-[8px] font-extrabold uppercase tracking-wider block ${isYellow ? 'text-[#1E3A8A]/60' : 'text-blue-200/70'}`}>Selling Price</span>
                    <span className="text-sm font-black">{formatSAR(p.sell_price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRowClick(p.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition duration-150 active:scale-95 cursor-pointer flex-shrink-0 ${detailsBtnClass}`}
                    title="Lihat Detail"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                {/* Subtle visual reflection overlay */}
                <div className="absolute right-[-10%] top-[-10%] w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
              </div>
            );
          })
        )}
      </div>







      {/* Selected Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs print:relative print:inset-auto print:bg-white print:p-0 print:backdrop-blur-none font-sans">
          <div className="bg-white rounded-[28px] shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col h-[85vh] print:h-auto print:shadow-none print:border-none print:w-full print:max-w-none print:overflow-visible relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center text-white no-print" style={{ backgroundColor: 'var(--navy)' }}>
              <div className="text-left">
                <span className="text-white/80 text-[9px] font-bold uppercase tracking-wider block">Proposal Offer Details</span>
                <h3 className="font-extrabold text-sm tracking-tight">{selectedProposal.proposal_number}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-white hover:text-amber-300 text-2xl font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition"
              >
                &times;
              </button>
            </div>

            {/* Print Header Ribbon (Print ONLY) */}
            <div className="hidden print:flex items-center justify-between border-b-2 pb-5 mb-6" style={{ borderBottomColor: 'var(--navy)' }}>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 text-white font-black text-2xl rounded-lg" style={{ backgroundColor: 'var(--navy)' }}>LJ</div>
                <div className="text-left">
                  <h1 className="text-lg font-black leading-none" style={{ color: 'var(--navy)' }}>PT LANCAR JAYA</h1>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1 block">LA &amp; HANDLING SERVICES</span>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-black" style={{ color: 'var(--navy)' }}>{selectedProposal.proposal_number}</h2>
                <span className="text-2xs text-slate-400 font-medium">
                  Date: {new Date(selectedProposal.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs print:overflow-visible print:p-0">
              
              {selectedProposal.status === 'PENDING_APPROVAL' && (
                <div className="p-3.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl font-bold flex items-center gap-2 no-print text-left">
                  <span>⚠️</span>
                  <span>This proposal is pending Admin approval as the margin rate falls below the minimum target.</span>
                </div>
              )}
              {selectedProposal.status === 'REJECTED' && (
                <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-2xl font-bold flex items-center gap-2 no-print text-left">
                  <span>❌</span>
                  <span>This proposal has been rejected by the Admin.</span>
                </div>
              )}
              
              {/* Client & Params Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#FAFAFC] rounded-2xl border border-slate-200 text-left print:bg-white print:border-slate-200">
                <div className="col-span-2">
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Client / Institution</div>
                  <div className="text-sm font-black mt-1" style={{ color: 'var(--navy)' }}>{selectedProposal.client_name}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Package Type</div>
                  <div className="text-sm font-bold mt-1" style={{ color: 'var(--navy)' }}>{selectedProposal.package_type}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Pax Count</div>
                  <div className="text-sm font-bold mt-1" style={{ color: 'var(--navy)' }}>{selectedProposal.pax_count} Pax</div>
                </div>
                
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Muthowif Days</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedProposal.duration_days} Days</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Hotel (In/Out)</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedProposal.hotel_in} in / {selectedProposal.hotel_out} out</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Catering</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedProposal.catering_class}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Tips Scenario</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedProposal.tips_scenario}</div>
                </div>
              </div>

              {/* Rincian Item Penawaran */}
              <div className="space-y-2.5 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 pb-2" style={{ color: 'var(--navy)' }}>
                  Travel Services Registry
                </h4>
                
                {/* Desktop View Table */}
                <div className="hidden md:block border border-[#DBDBDB] rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs bg-white">
                    <thead>
                      <tr className="bg-slate-50/60 text-[#6E6E85] font-semibold uppercase tracking-wider text-[9px] border-b border-[#DBDBDB]">
                        <th className="p-3">Service Component</th>
                        <th className="p-3 text-center w-16">Qty</th>
                        <th className="p-3 text-center w-20">Basis</th>
                        {!isClient && (
                          <>
                            <th className="p-3 text-right w-24">Rate</th>
                            <th className="p-3 text-right w-28">Subtotal</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {getDetailsList().map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 transition">
                          <td className="p-3 font-bold text-slate-800">{item.n}</td>
                          <td className="p-3 text-center font-bold">{item.q}</td>
                          <td className="p-3 text-center text-slate-450">{item.b}</td>
                          {!isClient && (
                            <>
                              <td className="p-3 text-right text-slate-500">{formatSAR(item.r)}</td>
                              <td className="p-3 text-right font-bold" style={{ color: 'var(--navy)' }}>{formatSAR(item.sb || item.subtotal || 0)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card Stack */}
                <div className="md:hidden space-y-3">
                  {getDetailsList().map((item, idx) => (
                    <div key={idx} className="bg-[#FAFAFC] rounded-2xl p-4 border border-slate-100 flex items-center justify-between text-left gap-3 shadow-4xs">
                      <div>
                        <div className="font-extrabold text-xs text-slate-800 leading-snug">{item.n}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                          {item.b} &middot; Qty: {item.q}
                        </div>
                      </div>
                      {!isClient && (
                        <div className="text-right flex flex-col items-end justify-center min-w-[90px]">
                          <div className="font-black text-xs text-slate-705" style={{ color: 'var(--navy)' }}>{formatSAR(item.sb || item.subtotal || 0)}</div>
                          <div className="text-[8px] text-slate-400 font-bold mt-0.5">Rate: {formatSAR(item.r)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-200 text-left">
                <div className="space-y-3 font-bold text-xs print:border-r print:border-[#DBDBDB] print:pr-4">
                  {!isClient ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100/60">
                        <span className="font-medium text-[#6E6E85]">Direct Cost</span>
                        <span className="text-[#14142B]">{formatSAR(selectedProposal.direct_cost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/60">
                        <span className="font-medium text-[#6E6E85]">Overhead &amp; Buffer ({selectedProposal.overhead_percent}%)</span>
                        <span className="text-[#14142B]">
                          {formatSAR(selectedProposal.full_cost - selectedProposal.direct_cost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/60 text-slate-800">
                        <span>Full Cost</span>
                        <span className="font-extrabold" style={{ color: 'var(--navy)' }}>{formatSAR(selectedProposal.full_cost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/60">
                        <span className="font-medium text-[#6E6E85]">Profit Margin</span>
                        <span style={{ color: 'var(--navy)' }}>{parseFloat(selectedProposal.margin_percent)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-3.5 bg-slate-50 rounded-2xl text-[#6E6E85] text-[9.5px] font-medium leading-relaxed border border-slate-200/50">
                      * Detailed breakdown of direct costs, overheads, and margin levels are confidential internal information and are hidden.
                    </div>
                  )}
                </div>

                {/* Final Quote Box */}
                <div className="text-white p-5 rounded-2xl flex flex-col justify-between shadow print:bg-white print:text-navy-main print:border-2 print:p-4" style={{ backgroundColor: 'var(--navy)' }}>
                  <div>
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-wider print:text-navy-main">
                      Final Selling Price per Pax
                    </span>
                    <div className="text-xl font-black mt-1 print:text-2xl text-white">
                      {formatSAR(selectedProposal.sell_price / selectedProposal.pax_count)}
                    </div>
                    <div className="text-xs text-white/70 font-semibold print:text-slate-500 mt-0.5">
                      {formatIDR(selectedProposal.sell_price / selectedProposal.pax_count, selectedProposal.exchange_rate)}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/15 flex justify-between text-[9px] font-bold uppercase tracking-wider print:border-navy-main/20">
                    <div>
                      <span className="text-white/60 print:text-slate-400 block text-[8px]">Total Quote</span>
                      <span className="text-xs font-black text-white">
                        {formatSAR(selectedProposal.sell_price)}
                      </span>
                    </div>
                    {!isClient && (
                      <div className="text-right">
                        <span className="text-white/60 block text-[8px]">Projected Profit</span>
                        <span className="text-xs font-black text-emerald-300 print:text-[#1F7A4D]">
                          {formatSAR(selectedProposal.profit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Print Footer Note (Print ONLY) */}
              <div className="hidden print:block text-[9px] text-slate-400 mt-12 border-t border-slate-200 pt-4 leading-relaxed font-semibold">
                <p>** Terms &amp; Conditions Note:</p>
                <ol className="list-decimal pl-4 mt-1 space-y-0.5 font-medium">
                  <li>Reference exchange rate: 1 SAR = {parseFloat(selectedProposal.exchange_rate).toLocaleString('en-US')} IDR. Final billing adjustment will follow the rate at transaction time.</li>
                  <li>Special &amp; incidental services (medical, death, emergency assignments) are not included in this quote and will be billed separately.</li>
                </ol>
              </div>

            </div>

            {/* Modal Footer Actions Grid */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3 no-print">
              {isAdmin && selectedProposal.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedProposal.id, 'APPROVED')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-full transition active:scale-95 text-center cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedProposal.id, 'REJECTED')}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-full transition active:scale-95 text-center cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={isClient && selectedProposal.status !== 'APPROVED'}
                onClick={handlePrint}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-full transition active:scale-95 cursor-pointer text-center ${
                  isClient && selectedProposal.status !== 'APPROVED'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-350/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                } ${(!isAdmin || selectedProposal.status !== 'PENDING_APPROVAL') ? 'col-span-2' : ''}`}
                title={isClient && selectedProposal.status !== 'APPROVED' ? 'Print locked because the proposal is waiting for Admin approval' : ''}
              >
                {isClient && selectedProposal.status !== 'APPROVED' ? '🔒 Print Locked' : 'Print / PDF'}
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className={`px-4 py-2.5 text-white text-xs font-black rounded-full transition shadow-3xs cursor-pointer active:scale-95 text-center ${
                  (!isAdmin || selectedProposal.status !== 'PENDING_APPROVAL') ? 'col-span-2' : ''
                }`}
                style={{ backgroundColor: 'var(--navy)' }}
              >
                {copyFlash ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
