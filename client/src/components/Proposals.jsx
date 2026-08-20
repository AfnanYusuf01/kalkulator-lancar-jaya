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
    if (!window.confirm(`Apakah Anda yakin ingin ${status === 'APPROVED' ? 'menyetujui' : 'menolak'} proposal ini?`)) return;
    try {
      await updateProposalStatus(proposalId, status);
      setSelectedProposal(prev => ({ ...prev, status }));
    } catch (err) {
      alert(err.message || 'Gagal memperbarui status proposal.');
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
      setDetailError('Gagal memuat rincian proposal.');
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
    return parseFloat(v).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' SAR';
  };

  const formatIDR = (v, rate) => {
    return 'Rp ' + (parseFloat(v) * rate).toLocaleString('id-ID', { maximumFractionDigits: 0 });
  };

  const getMarginClass = (m) => {
    if (m >= 20) return 'ok';
    if (m >= 12.5) return 'wr';
    return 'bd';
  };

  const handleCopySummary = () => {
    if (!selectedProposal) return;
    const p = selectedProposal;
    const details = getDetailsList();
    const isClient = user?.role === 'user';

    const pName = { BESAR: 'Grup Besar', ESENSIAL: 'Grup Kecil — Esensial', LENGKAP: 'Grup Kecil — Lengkap' }[p.package_type];

    let text = `*PENAWARAN HANDLING — LANCAR JAYA*\n`;
    text += `${p.proposal_number} · ${p.client_name}\n`;
    text += `${pName}\n`;
    text += `${p.pax_count} pax · Muthowif ${p.duration_days} hari · Hotel ${p.hotel_in} in / ${p.hotel_out} out\n`;
    text += `Katering: ${p.catering_class} · Tips: ${p.tips_scenario}\n`;
    text += `━━━━━━━━━━━━━━━\n`;

    if (!isClient) {
      text += `*RINCIAN COST*\n`;
      const categories = {};
      details.forEach(item => {
        const cat = item.g || 'TAMBAHAN';
        categories[cat] = (categories[cat] || 0) + parseFloat(item.sb || 0);
      });

      Object.entries(categories).forEach(([cat, val]) => {
        text += `- ${cat}: ${formatSAR(val)}\n`;
      });
      
      text += `\nDirect Cost: *${formatSAR(p.direct_cost)}*\n`;
      text += `Overhead & Buffer ${p.overhead_percent}%: ${formatSAR(p.full_cost - p.direct_cost)}\n`;
      text += `Full Cost: *${formatSAR(p.full_cost)}* (${formatSAR(p.full_cost / p.pax_count)}/pax)\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `*HARGA JUAL* (margin ${p.margin_percent}%)\n`;
    }

    const sellPerPax = p.sell_price / p.pax_count;
    text += `Per pax: *${formatSAR(sellPerPax)}* / ${formatIDR(sellPerPax, p.exchange_rate)}\n`;
    text += `Total grup: *${formatSAR(p.sell_price)}* / ${formatIDR(p.sell_price, p.exchange_rate)}\n`;
    
    if (!isClient) {
      text += `Profit grup: ${formatSAR(p.profit)}\n`;
    }
    
    text += `━━━━━━━━━━━━━━━\n`;
    text += `_Kurs acuan ${parseFloat(p.exchange_rate).toLocaleString('id-ID')} IDR/SAR — cek ulang saat transaksi._`;

    navigator.clipboard.writeText(text);
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isClient = user?.role === 'user';

  return (
    <div className="space-y-4">
      
      {/* Title Header */}
      <div className="border-b border-[#DBDBDB] pb-4 mb-2 no-print">
        <h1 className="text-base font-black text-[#000066] tracking-tight uppercase">Daftar Proposal Penawaran</h1>
        <p className="text-[10px] text-[#6E6E85] font-semibold tracking-wider mt-0.5">Rekaman proposal penawaran harga yang tersimpan dalam database</p>
      </div>

      {/* Proposals List Table */}
      <div className="card no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                <th className="p-3.5">No. Proposal</th>
                <th className="p-3.5">Nama Klien</th>
                <th className="p-3.5 text-center">Tipe Paket</th>
                <th className="p-3.5 text-center">Pax</th>
                {!isClient && (
                  <>
                    <th className="p-3.5 text-right">Profit</th>
                    <th className="p-3.5 text-center">Margin</th>
                  </>
                )}
                <th className="p-3.5 text-right">Harga Jual Grup</th>
                <th className="p-3.5 text-center">Tanggal</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={isClient ? 6 : 8} className="p-10 text-center text-[#6E6E85] font-bold">
                    Belum ada proposal penawaran yang tersimpan.
                  </td>
                </tr>
              ) : (
                proposals.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/20 transition duration-150">
                    <td className="p-3.5 text-[#000066] font-black">{p.proposal_number}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p.client_name}</td>
                    <td className="p-3.5 text-center font-bold text-slate-500">{p.package_type}</td>
                    <td className="p-3.5 text-center font-bold">{p.pax_count}</td>
                    {!isClient && (
                      <>
                        <td className="p-3.5 text-right text-emerald-600 font-bold">{formatSAR(p.profit)}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold rounded ${
                            p.margin_percent >= 20 ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-amber-500 bg-amber-50 text-amber-600'
                          }`}>
                            {parseFloat(p.margin_percent)}%
                          </span>
                        </td>
                      </>
                    )}
                    <td className="p-3.5 text-right font-black text-[#000066]">{formatSAR(p.sell_price)}</td>
                    <td className="p-3.5 text-center text-slate-400">
                      {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        p.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : p.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-705 border border-amber-200 animate-pulse'
                      }`}>
                        {p.status === 'APPROVED' ? 'Disetujui' : p.status === 'REJECTED' ? 'Ditolak' : 'Menunggu Approval'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRowClick(p.id)}
                        className="px-3 py-1.5 bg-[#000066] hover:bg-[#23237A] text-white text-[10px] font-bold rounded-lg transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs print:relative print:inset-auto print:bg-white print:p-0 print:backdrop-blur-none">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-[#DBDBDB] overflow-hidden flex flex-col h-[85vh] print:h-auto print:shadow-none print:border-none print:w-full print:max-w-none print:overflow-visible relative">
            
            {/* Modal Header */}
            <div className="p-4.5 border-b border-[#grey] flex justify-between items-center bg-[#000066] text-white no-print">
              <div className="text-left">
                <span className="text-[#C89D7C] text-[9px] font-bold uppercase tracking-wider">Detail Proposal Penawaran</span>
                <h3 className="font-extrabold text-sm tracking-tight">{selectedProposal.proposal_number}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-white hover:text-[#C89D7C] text-2xl font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition"
              >
                &times;
              </button>
            </div>

            {/* Print Header Ribbon (Print ONLY) */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-[#000066] pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-[#000066] text-white font-black text-2xl rounded-lg">LJ</div>
                <div className="text-left">
                  <h1 className="text-lg font-black text-[#000066] leading-none">PT LANCAR JAYA</h1>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1 block">LA &amp; HANDLING SERVICES</span>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-black text-[#000066]">{selectedProposal.proposal_number}</h2>
                <span className="text-2xs text-slate-400 font-medium">
                  Tanggal: {new Date(selectedProposal.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs print:overflow-visible print:p-0">
              
              {selectedProposal.status === 'PENDING_APPROVAL' && (
                <div className="p-3.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold flex items-center gap-2 no-print">
                  <span>⚠️</span>
                  <span>Proposal ini sedang menunggu persetujuan Admin karena tingkat margin di bawah batas target minimal.</span>
                </div>
              )}
              {selectedProposal.status === 'REJECTED' && (
                <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-lg font-bold flex items-center gap-2 no-print">
                  <span>❌</span>
                  <span>Proposal ini ditolak oleh Admin.</span>
                </div>
              )}
              
              {/* Client & Params Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4.5 bg-[#FAFAFC] rounded-lg border border-[#DBDBDB] print:bg-white print:border-[#DBDBDB]">
                <div className="col-span-2">
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Klien / Instansi</div>
                  <div className="text-sm font-black text-[#000066] mt-1">{selectedProposal.client_name}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Tipe Paket</div>
                  <div className="text-sm font-bold text-[#000066] mt-1">{selectedProposal.package_type}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Jumlah Jama'ah</div>
                  <div className="text-sm font-bold text-[#000066] mt-1">{selectedProposal.pax_count} Pax</div>
                </div>
                
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Hari Muthowif</div>
                  <div className="font-bold text-[#14142B] mt-1">{selectedProposal.duration_days} Hari</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Hotel (In/Out)</div>
                  <div className="font-bold text-[#14142B] mt-1">{selectedProposal.hotel_in} in / {selectedProposal.hotel_out} out</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Katering</div>
                  <div className="font-bold text-[#14142B] mt-1">{selectedProposal.catering_class}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Skenario Tips</div>
                  <div className="font-bold text-[#14142B] mt-1">{selectedProposal.tips_scenario}</div>
                </div>
              </div>

              {/* Rincian Item Penawaran */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-[#000066] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Daftar Layanan Perjalanan
                </h4>
                <div className="border border-[#DBDBDB] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/60 text-[#6E6E85] font-semibold uppercase tracking-wider text-[9px] border-b border-[#DBDBDB]">
                        <th className="p-3">Komponen Layanan</th>
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
                          <td className="p-3 font-bold text-[#14142B]">{item.n}</td>
                          <td className="p-3 text-center font-bold">{item.q}</td>
                          <td className="p-3 text-center text-slate-450">{item.b}</td>
                          {!isClient && (
                            <>
                              <td className="p-3 text-right text-slate-500">{formatSAR(item.r)}</td>
                              <td className="p-3 text-right font-bold text-[#000066]">{formatSAR(item.sb || item.subtotal || 0)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-200">
                {/* Cost metrics (Admin only) */}
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
                        <span className="font-extrabold text-[#000066]">{formatSAR(selectedProposal.full_cost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/60">
                        <span className="font-medium text-[#6E6E85]">Margin Keuntungan</span>
                        <span className="text-[#000066]">{parseFloat(selectedProposal.margin_percent)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-3.5 bg-slate-50 rounded-lg text-[#6E6E85] text-[9.5px] font-medium leading-relaxed border border-slate-200/50">
                      * Rincian komponen biaya langsung (*Direct Cost*), biaya operasional (*Overhead*), dan tingkat margin keuntungan (*Margin*)
                      bersifat rahasia internal PT Lancar Jaya dan disembunyikan.
                    </div>
                  )}
                </div>

                {/* Final Quote Box */}
                <div className="bg-[#000066] text-white p-4.5 rounded-lg flex flex-col justify-between shadow print:bg-white print:text-[#000066] print:border-2 print:border-[#000066] print:p-4">
                  <div>
                    <span className="text-[9px] font-bold text-[#C89D7C] uppercase tracking-wider print:text-[#000066]">
                      Harga Jual Akhir per Jama'ah
                    </span>
                    <div className="text-xl font-black mt-1 print:text-2xl">
                      {formatSAR(selectedProposal.sell_price / selectedProposal.pax_count)}
                    </div>
                    <div className="text-xs text-slate-350 font-semibold print:text-slate-500 mt-0.5">
                      {formatIDR(selectedProposal.sell_price / selectedProposal.pax_count, selectedProposal.exchange_rate)}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/10 flex justify-between text-[9px] font-bold uppercase tracking-wider print:border-[#000066]/20">
                    <div>
                      <span className="text-slate-300 print:text-slate-400 block text-[8px]">Total Penawaran</span>
                      <span className="text-xs font-extrabold text-[#C89D7C] print:text-[#000066]">
                        {formatSAR(selectedProposal.sell_price)}
                      </span>
                    </div>
                    {!isClient && (
                      <div className="text-right">
                        <span className="text-slate-300 block text-[8px]">Proyeksi Keuntungan</span>
                        <span className="text-xs font-extrabold text-emerald-400 print:text-[#1F7A4D]">
                          {formatSAR(selectedProposal.profit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Print Footer Note (Print ONLY) */}
              <div className="hidden print:block text-[9px] text-slate-400 mt-12 border-t border-slate-200 pt-4 leading-relaxed font-semibold">
                <p>** Catatan Syarat &amp; Ketentuan:</p>
                <ol className="list-decimal pl-4 mt-1 space-y-0.5 font-medium">
                  <li>Kurs acuan yang digunakan: 1 SAR = {parseFloat(selectedProposal.exchange_rate).toLocaleString('id-ID')} IDR. Penyesuaian tagihan final akan mengikuti kurs yang berlaku saat transaksi.</li>
                  <li>Layanan Khusus &amp; Insidental (jama'ah sakit, wafat, job insidental) tidak termasuk dalam penawaran ini, dan akan ditagihkan secara terpisah.</li>
                </ol>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4.5 bg-slate-50 border-t border-[#DBDBDB] flex justify-end gap-3 no-print">
              {isAdmin && selectedProposal.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedProposal.id, 'APPROVED')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedProposal.id, 'REJECTED')}
                    className="px-3.5 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-lg transition"
                  >
                    Tolak
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={isClient && selectedProposal.status !== 'APPROVED'}
                onClick={handlePrint}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
                  isClient && selectedProposal.status !== 'APPROVED'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-350/20'
                    : 'bg-slate-250 hover:bg-slate-350 text-[#14142B]'
                }`}
                title={isClient && selectedProposal.status !== 'APPROVED' ? 'Cetak terkunci karena proposal menunggu persetujuan Admin' : ''}
              >
                {isClient && selectedProposal.status !== 'APPROVED' ? '🔒 Cetak Terkunci' : 'Cetak Proposal / PDF'}
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-2 bg-[#000066] hover:bg-[#23237A] text-white text-xs font-bold rounded-lg transition"
              >
                {copyFlash ? 'Tersalin!' : 'Salin Ringkasan'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
