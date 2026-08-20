import React, { useState } from 'react';
import { useCalculatorLogic } from '../hooks/useCalculatorLogic';
import './Calculator.css';

export default function Calculator() {
  const {
    catalog, packages, settings, paket, setPaket, pax, setPax, hari, setHari, hIn, setHIn, hOut, setHOut,
    kelas, setKelas, tips, setTips, kurs, setKurs, oh, setOh, margin, setMargin, coreItems, optItems,
    selGroup, setSelGroup, customGroup, setCustomGroup, selCatalogId, manualItemName, setManualItemName,
    addQty, setAddQty, addRate, setAddRate, addBasis, setAddBasis, showSaveModal, setShowSaveModal,
    clientName, setClientName, saveLoading, saveMessage, user, level, cost, isClient,
    handleToggleCore, handleToggleOption, handleQtyChange, handleRateChange, handleSelectCatalogItem,
    handleAddDynamicService, handleDeleteCustom, handleReset, handleSaveProposal,
  } = useCalculatorLogic();

  const [activeStep, setActiveStep] = useState('param');
  const [showMoreGroupsModal, setShowMoreGroupsModal] = useState(false);
  const [showMorePackagesModal, setShowMorePackagesModal] = useState(false);

  // Shared variables for service category selections (needed in both renderOptionalServices and showMoreGroupsModal)
  const existingGroups = Array.from(new Set(catalog.map(item => item.group_name)));
  const staticValues = ['HANDLING', 'MUTHOWIF', 'KATERING', 'DRIVER', 'PHOTO', 'MEDIS', 'TAMBAHAN', 'NEW'];
  
  const groupOptionsMap = {
    HANDLING: { value: 'HANDLING', label: 'Handling', bgClass: 'bg-blue-50 text-blue-600', iconPath: '/flaticon/14041561_512.png' },
    MUTHOWIF: { value: 'MUTHOWIF', label: 'Muthowif', bgClass: 'bg-purple-50 text-purple-600', iconPath: '/flaticon/10741189_512.png' },
    KATERING: { value: 'KATERING', label: 'Catering', bgClass: 'bg-amber-50 text-amber-600', iconPath: '/flaticon/15044717_512.png' },
    DRIVER: { value: 'DRIVER', label: 'Driver Tips', bgClass: 'bg-emerald-50 text-emerald-600', iconPath: '/flaticon/15719383_512.png' },
    PHOTO: { value: 'PHOTO', label: 'Photos', bgClass: 'bg-indigo-50 text-indigo-600', iconPath: '/flaticon/3693002_512.png' },
    MEDIS: { value: 'MEDIS', label: 'Medical', bgClass: 'bg-rose-50 text-rose-600', iconPath: '/flaticon/4330213_512.png' },
    TAMBAHAN: { value: 'TAMBAHAN', label: 'Additional', bgClass: 'bg-slate-50 text-slate-655', iconPath: '/flaticon/2075975_512.png' },
    NEW: { value: 'NEW', label: 'New Group', bgClass: 'bg-teal-50 text-teal-600', iconPath: '/flaticon/13609678_512.png' }
  };

  const allOptions = [...staticValues];
  existingGroups.forEach(g => {
    if (!allOptions.includes(g)) {
      allOptions.push(g);
    }
  });

  const getOptDetail = (val) => {
    if (groupOptionsMap[val]) return groupOptionsMap[val];
    return {
      value: val,
      label: val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
      bgClass: 'bg-sky-50 text-sky-655',
      iconPath: '/flaticon/13609678_512.png'
    };
  };

  const formatSAR = (v) => parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' SAR';

  const formatIDR = (v) => 'Rp ' + (v * kurs).toLocaleString('id-ID', { maximumFractionDigits: 0 });

  const getMarginClass = () => {
    const target = settings?.min_margin !== undefined ? settings.min_margin : 20;
    const floor = settings?.floor_margin !== undefined ? settings.floor_margin : 12.5;
    return margin >= target ? 'ok' : margin >= floor ? 'wr' : 'bd';
  };

  const getMarginStatusText = () => {
    const target = settings?.min_margin !== undefined ? settings.min_margin : 20;
    const floor = settings?.floor_margin !== undefined ? settings.floor_margin : 12.5;
    return margin >= target ? 'TARGET — Secure Profit' : margin >= floor ? 'FLOOR — Needs Approval' : 'BELOW FLOOR — Unviable';
  };

  const groupItems = (items) => {
    const groups = {};
    items.forEach(item => {
      const g = item.group_name;
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  };

  const cGroups = groupItems(cost.cores);
  const oGroups = groupItems(cost.opts);

  const costPercentage = {};
  const costSpread = {};
  [...cost.cores, ...cost.opts].forEach(item => {
    if (item.active) costSpread[item.group_name] = (costSpread[item.group_name] || 0) + item.subtotal;
  });

  const totalDirectActive = Object.values(costSpread).reduce((a, b) => a + b, 0);
  Object.entries(costSpread).forEach(([g, val]) => {
    costPercentage[g] = totalDirectActive > 0 ? (val / totalDirectActive) * 100 : 0;
  });

  const costColors = { HANDLING: '#3B82F6', MUTHOWIF: '#60A5FA', KATERING: '#93C5FD', DRIVER: '#64748B', PHOTO: '#94A3B8', MEDIS: '#EFF6FF', TAMBAHAN: '#DBEAFE' };
  const costLabels = { HANDLING: 'Handling', MUTHOWIF: 'Muthowif', KATERING: 'Catering', DRIVER: 'Driver Tips', PHOTO: 'Documentation', MEDIS: 'Medical', TAMBAHAN: 'Additional' };

  // Indonesian translation dictionary to prevent AI slop descriptions
  const getPkgDescription = (code, dbDesc) => {
    if (code === 'BESAR') {
      return 'Paket Grup Besar (minimal 16 pax). Penanganan operasional darat sepenuhnya diurus oleh Tim Handling di Arab Saudi.';
    }
    if (code === 'ESENSIAL') {
      return 'Paket Kecil Esensial (maksimal 15 pax). Layanan difokuskan pada check-in hotel. Operasional lapangan lainnya dipandu oleh Muthowif & Tour Leader.';
    }
    if (code === 'LENGKAP') {
      return 'Paket Kecil Lengkap (maksimal 15 pax). Layanan terpadu mencakup penanganan bagasi, transportasi, dan operasional penuh oleh Tim Handling.';
    }
    return dbDesc;
  };

  // 10 unique, highly colorful, non-grey pilgrimage Flaticon icons to ensure variety
  const colorfulIcons = [
    '/flaticon/10741201_512.png', // Gold/blue Kaaba star
    '/flaticon/13609678_512.png', // Quran/tasbih
    '/flaticon/10741221_512.png', // Mosque gold/green (Vibrant)
    '/flaticon/10741115_512.png', // Gold Dome of the Rock
    '/flaticon/9960059_512.png',  // Islamic lanterns
    '/flaticon/9937627_512.png',  // Muslim praying
    '/flaticon/10148916_512.png', // Crescent & mosque
    '/flaticon/10234127_512.png', // Zamzam bottle
    '/flaticon/7342930_512.png',  // Hajj tent Mina
    '/flaticon/15319741_512.png'  // Islamic prayer rug
  ];

  // High-fidelity PNG icons from flaticon list
  const getPkgIconPath = (code, index = 0) => {
    if (code === 'BESAR') return '/flaticon/10741189_512.png'; // Two pilgrims (white/orange)
    if (code === 'ESENSIAL') return '/flaticon/13609678_512.png'; // Quran/tasbih
    if (code === 'LENGKAP') return '/flaticon/10741221_512.png'; // Mosque gold/green (fully colored, no grey!)
    
    // Ensure every single custom package gets a different colorful icon
    return colorfulIcons[index % colorfulIcons.length];
  };

  const getPkgShortLabel = (code) => {
    if (code === 'BESAR') return 'Besar';
    if (code === 'ESENSIAL') return 'Esensial';
    return 'Lengkap';
  };

  const renderPackageSelector = () => {
    const mainPkgCodes = ['BESAR', 'ESENSIAL', 'LENGKAP'];
    const mainPkgs = packages.filter(p => mainPkgCodes.includes(p.package_code));
    
    mainPkgs.sort((a, b) => {
      const order = { BESAR: 0, ESENSIAL: 1, LENGKAP: 2 };
      return order[a.package_code] - order[b.package_code];
    });

    const selectedPkg = packages.find(p => p.package_code === paket) || packages[0];
    const displayDescription = selectedPkg ? getPkgDescription(selectedPkg.package_code, selectedPkg.description) : '';

    return (
      <div className="card shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white animate-fade-in">
        <div className="ch border-b border-slate-50 bg-[#FAFAFC] px-5 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
          Select Travel Package
        </div>
        <div className="cb p-5 text-left">
          {/* Aesthetic 4-column squircle grid matching reference */}
          <div className="grid grid-cols-4 gap-4 justify-items-center">
            {mainPkgs.map((p, idx) => {
              const isSelected = paket === p.package_code || (packages[0] && paket === '' && p.package_code === packages[0].package_code);
              
              return (
                <div key={p.id} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setPaket(p.package_code)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center border transition duration-150 active:scale-95 cursor-pointer shadow-xs focus:outline-none ${
                      isSelected 
                        ? 'border-transparent text-white shadow-md' 
                        : 'border-slate-150 bg-[#FAFAFC] text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    style={isSelected ? { backgroundColor: 'var(--navy)' } : {}}
                  >
                    <img
                      src={getPkgIconPath(p.package_code, idx)}
                      alt={p.package_name}
                      className="w-10 h-10 object-contain"
                    />
                  </button>
                  <span className={`text-[10px] font-black mt-2 leading-tight text-center ${
                    isSelected ? 'text-navy-main' : 'text-slate-500'
                  }`} style={isSelected ? { color: 'var(--navy)' } : {}}>
                    {getPkgShortLabel(p.package_code)}
                  </span>
                </div>
              );
            })}
            
            {/* 4th Card: More Packages with exactly 3 vertical boxes */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowMorePackagesModal(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center border border-slate-150 bg-[#FAFAFC] text-slate-500 hover:border-slate-350 hover:bg-slate-50 transition duration-150 active:scale-95 cursor-pointer shadow-xs"
              >
                <svg className="w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="5" y="5" width="5.5" height="5.5" rx="1.8" />
                  <rect x="13.5" y="5" width="5.5" height="5.5" rx="1.8" />
                  <rect x="5" y="13.5" width="5.5" height="5.5" rx="1.8" />
                  <rect x="13.5" y="13.5" width="5.5" height="5.5" rx="1.8" />
                </svg>

              </button>
              <span className="text-[10px] font-black mt-2 leading-tight text-center text-slate-500">
                More
              </span>
            </div>
          </div>

          {/* Active Package Description Ribbon Card (Clean Left Aligned with Info Icon) */}
          {selectedPkg && (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-semibold text-slate-650 text-center leading-relaxed animate-fade-in text-left">
              <div className="flex items-center gap-2 mb-1.5 text-navy-main font-black uppercase text-[9px] tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Rincian Layanan: {selectedPkg.package_name}
              </div>
              <div className="font-bold text-slate-800 leading-normal">{displayDescription}</div>
            </div>
          )}
          
          {paket === 'BESAR' && pax < 16 && (
            <div className="warnbox show rounded-xl mt-3 text-left">
              Grup Besar memerlukan minimal 16 pax. Jika jumlah pax kurang dari 16, silakan pilih Paket Kecil.
            </div>
          )}
          {(paket === 'ESENSIAL' || paket === 'LENGKAP') && pax > 15 && (
            <div className="warnbox show rounded-xl mt-3 text-left">
              Paket Kecil dibatasi maksimum 15 pax. Jika jumlah pax lebih dari 15, silakan pilih Paket Besar.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderParameters = () => (
    <div className="card shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
      <div className="ch border-b border-slate-50 bg-[#FAFAFC] px-5 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
        Travel Parameter Setup
      </div>
      <div className="cb p-5 text-left">
        <div className="pg">
          <div className="f"><label>Pax Count</label><input type="number" className="rounded-full" value={pax} onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 0))} /></div>
          <div className="f"><label>Muthowif Days</label><input type="number" className="rounded-full" value={hari} onChange={(e) => setHari(Math.max(0, parseInt(e.target.value) || 0))} /></div>
          <div className="f"><label>Hotel In</label><input type="number" className="rounded-full" value={hIn} onChange={(e) => setHIn(Math.max(0, parseInt(e.target.value) || 0))} /></div>
          <div className="f"><label>Hotel Out</label><input type="number" className="rounded-full" value={hOut} onChange={(e) => setHOut(Math.max(0, parseInt(e.target.value) || 0))} /></div>
          <div className="f">
            <label>Catering</label>
            <div className="seg">
              {['Reguler', 'Premium'].map(k => (
                <button key={k} type="button" onClick={() => setKelas(k)} aria-pressed={kelas === k}>{k}</button>
              ))}
            </div>
          </div>
          <div className="f">
            <label>Driver Tips</label>
            <div className="seg">
              {['Standar', 'Maksimal'].map(t => (
                <button key={t} type="button" onClick={() => setTips(t)} aria-pressed={tips === t}>{t}</button>
              ))}
            </div>
          </div>
          <div className="f"><label>SAR &rarr; IDR Rate</label><input type="number" className="rounded-full" value={kurs} onChange={(e) => setKurs(Math.max(1, parseInt(e.target.value) || 0))} /></div>
          <div className="f"><label>Overhead (%)</label><input type="number" className="rounded-full" value={oh} onChange={(e) => setOh(Math.max(0, parseFloat(e.target.value) || 0))} disabled={isClient} /></div>
        </div>
        <div className="lvl mt-4 pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
          <div className="chip rounded-xl px-3.5 py-2 bg-tan-light border-l-4 border-tan-gold"><div className="k text-2xs font-extrabold text-[#7C789B]">Fee Level</div><div className="v text-xs font-black" style={{ color: 'var(--navy)' }}>{level.name} ({level.text})</div></div>
          <div className="chip rounded-xl px-3.5 py-2 bg-tan-light border-l-4 border-tan-gold"><div className="k text-2xs font-extrabold text-[#7C789B]">Bellboy In</div><div className="v text-xs font-black" style={{ color: 'var(--navy)' }}>{level.bi} SAR</div></div>
          <div className="chip rounded-xl px-3.5 py-2 bg-tan-light border-l-4 border-tan-gold"><div className="k text-2xs font-extrabold text-[#7C789B]">Bellboy Out</div><div className="v text-xs font-black" style={{ color: 'var(--navy)' }}>{level.bo} SAR</div></div>
        </div>
      </div>
    </div>
  );

  const renderCoreServices = () => (
    <div className="card shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
      <details className="det" open>
        <summary className="cursor-pointer bg-[#FAFAFC] px-5 py-4 border-b border-slate-100 flex justify-between items-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
          <span>Core Services</span>
        </summary>
        <div className={`rh ${isClient ? 'is-client-grid' : ''} bg-slate-50/50 px-4 py-2 border-b border-slate-100`}>
          <span>Select Components</span>
          <span>Qty</span>
          {!isClient && (
            <>
              <span>Rate</span>
              <span>Subtotal</span>
            </>
          )}
        </div>
        {Object.entries(cGroups).map(([group, items]) => (
          <div key={group}>
            <div className="grp bg-slate-50 text-2xs font-bold uppercase px-4 py-1.5 border-b border-slate-100/50" style={{ color: 'var(--navy)' }}>{group}</div>
            {items.map(item => {
              const idx = coreItems.findIndex(x => x.id === item.id);
              return (
                <div key={item.id} className={`ir ${item.active ? '' : 'off'} ${isClient ? 'is-client-grid' : ''} px-4 py-2.5 border-b border-slate-100`}>
                  <div className="nm flex items-center gap-2">
                    <label className="tg">
                      <input type="checkbox" checked={item.active} onChange={() => handleToggleCore(idx)} />
                      <span className="tr"></span><span className="kn"></span>
                    </label>
                    <span className="tx font-bold text-slate-800 text-xs text-left" title={item.item_name}>{item.item_name}</span>
                    <span className={`bs rounded-full text-3xs px-2 py-0.5 font-bold ${item.basis === 'PAX' ? 'text-white' : 'bg-slate-150 text-slate-500'}`} style={item.basis === 'PAX' ? { backgroundColor: 'var(--navy)' } : {}}>{item.basis}</span>
                  </div>
                  <div>
                    <input type="number" className="n rounded-lg border-slate-200" disabled={!item.active || isClient} value={item.q_override !== null ? item.q_override : item.qty_default} onChange={(e) => handleQtyChange('C', idx, e.target.value)} />
                  </div>
                  {!isClient && (
                    <>
                      <div>
                        <input type="number" className="n rounded-lg border-slate-200" disabled={!item.active || item.bellboy_type || item.is_level_adjusted || isClient} value={parseFloat(item.rate.toFixed(1))} onChange={(e) => handleRateChange('C', idx, e.target.value)} />
                      </div>
                      <div className="sb font-bold text-right" style={{ color: 'var(--navy)' }}>{formatSAR(item.subtotal)}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </details>
    </div>
  );

  const renderOptionalServices = () => {
    const availableCatalogItems = catalog.filter(c => {
      const matchesGroup = selGroup === 'NEW' ? true : c.group_name === selGroup;
      const isActiveInCalculator = optItems.some(o => o.item_name.toLowerCase() === c.item_name.toLowerCase() && o.is_active_by_default === 1);
      return matchesGroup && !isActiveInCalculator;
    });

    const mainSlotValues = ['HANDLING', 'MUTHOWIF', 'KATERING', 'DRIVER', 'PHOTO'];

    const mainSlots = mainSlotValues.map(v => getOptDetail(v));

    let slot6 = null;
    const isSlot6HiddenActive = !mainSlotValues.includes(selGroup);

    if (isSlot6HiddenActive) {
      slot6 = getOptDetail(selGroup);
    } else {
      slot6 = {
        value: 'MORE',
        label: 'More',
        bgClass: 'bg-slate-50 text-slate-500',
        icon: (
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <rect x="5" y="5" width="5.5" height="5.5" rx="1.8" />
            <rect x="13.5" y="5" width="5.5" height="5.5" rx="1.8" />
            <rect x="5" y="13.5" width="5.5" height="5.5" rx="1.8" />
            <rect x="13.5" y="13.5" width="5.5" height="5.5" rx="1.8" />
          </svg>
        )
      };
    }

    const mainCategoryGrid = [...mainSlots, slot6];

    return (
      <div className="card shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
        <details className="det" open>
          <summary className="cursor-pointer bg-[#FAFAFC] px-5 py-4 border-b border-slate-100 flex justify-between items-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>
            <span>Optional Services</span>
          </summary>
          <div className={`rh ${isClient ? 'is-client-grid' : ''} bg-slate-50/50 px-4 py-2 border-b border-slate-100`}>
            <span>Select Components</span>
            <span>Qty</span>
            {!isClient && (
              <>
                <span>Rate</span>
                <span>Subtotal</span>
              </>
            )}
          </div>
          {Object.entries(oGroups).map(([group, items]) => (
            <div key={group}>
              <div className="grp bg-slate-50 text-2xs font-bold uppercase px-4 py-1.5 border-b border-slate-100/50" style={{ color: 'var(--navy)' }}>{group}</div>
              {items.map(item => {
                const idx = optItems.findIndex(x => x.id === item.id);
                return (
                  <div key={item.id} className={`ir ${item.active ? '' : 'off'} ${isClient ? 'is-client-grid' : ''} px-4 py-2.5 border-b border-slate-100`}>
                    <div className="nm flex items-center gap-2">
                      <label className="tg">
                        <input type="checkbox" checked={item.active} onChange={() => handleToggleOption(idx)} />
                        <span className="tr"></span><span className="kn"></span>
                      </label>
                      <span className="tx font-bold text-slate-800 text-xs text-left" title={item.item_name}>{item.item_name}</span>
                      <span className={`bs rounded-full text-3xs px-2 py-0.5 font-bold ${item.basis === 'PAX' ? 'text-white' : 'bg-slate-150 text-slate-500'}`} style={item.basis === 'PAX' ? { backgroundColor: 'var(--navy)' } : {}}>{item.basis}</span>
                    </div>
                    <div>
                      <input type="number" className="n rounded-lg border-slate-200" disabled={!item.active} value={item.q_override !== null ? item.q_override : item.qty_default} onChange={(e) => handleQtyChange('O', idx, e.target.value)} />
                    </div>
                    {!isClient && (
                      <>
                        <div>
                          <input type="number" className="n rounded-lg border-slate-200" disabled={!item.active || isClient} value={parseFloat(item.rate.toFixed(1))} onChange={(e) => handleRateChange('O', idx, e.target.value)} />
                        </div>
                        <div className="sb font-bold text-right" style={{ color: 'var(--navy)' }}>
                          {formatSAR(item.subtotal)}
                          {item.is_custom && <button type="button" onClick={() => handleDeleteCustom(idx)} className="del ml-2 text-red-500 hover:text-red-700 font-extrabold text-sm">&times;</button>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="add-service-panel border-t border-slate-100 bg-[#FAFAFC] p-5 flex flex-col gap-4 text-xs font-semibold text-slate-800 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--navy)' }}>Add Service to Calculator</div>
            
            {/* Exactly 6 Compact Grid Selector Slots (Illustrative flat PNG icons) */}
            <div className="space-y-2">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Service Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {mainCategoryGrid.map((opt, idx) => {
                  const isSelected = selGroup === opt.value;
                  const isMoreButton = opt.value === 'MORE';
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isMoreButton || isSlot6HiddenActive && opt.value === selGroup && idx === 5) {
                          setShowMoreGroupsModal(true);
                        } else {
                          setSelGroup(opt.value);
                          handleSelectCatalogItem('');
                        }
                      }}
                      className={`w-full min-h-[98px] flex flex-col items-center justify-center p-2.5 rounded-2xl border transition duration-150 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.01)] ${
                        isSelected 
                          ? 'border-transparent text-white shadow-md' 
                          : 'border-slate-150 bg-white text-slate-655 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      style={isSelected ? { backgroundColor: 'var(--navy)' } : {}}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-white/20' 
                          : opt.bgClass
                      }`}>
                        {opt.iconPath ? (
                          <img src={opt.iconPath} alt={opt.label} className="w-8 h-8 object-contain" />
                        ) : (
                          opt.icon
                        )}
                      </div>
                      <span className="text-[10px] font-black mt-2 leading-tight text-center whitespace-nowrap overflow-ellipsis overflow-hidden w-full">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selGroup === 'NEW' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#7C789B] uppercase tracking-wider block">New Category Name</label>
                  <input type="text" value={customGroup} onChange={(e) => setCustomGroup(e.target.value)} placeholder="e.g., HOTEL..." className="w-full px-4 py-2 border border-slate-200 bg-white rounded-full focus:outline-none focus:border-navy-main font-semibold text-xs" />
                </div>
              )}
              <div className={`space-y-1 ${selGroup === 'NEW' ? '' : 'md:col-span-2'}`}>
                <label className="text-[9px] font-bold text-[#7C789B] uppercase tracking-wider block">Select Available Item</label>
                <select value={selCatalogId} onChange={(e) => handleSelectCatalogItem(e.target.value)} className="w-full px-4 py-2 border border-slate-200 bg-white rounded-full focus:outline-none focus:border-navy-main cursor-pointer font-semibold text-xs">
                  <option value="">[ Custom Manual Service ]</option>
                  {availableCatalogItems.map(item => (<option key={item.id} value={item.id}>{item.item_name}</option>))}
                </select>
              </div>
              {!selCatalogId && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-bold text-[#7C789B] uppercase tracking-wider block">Manual Service Name</label>
                  <input type="text" value={manualItemName} onChange={(e) => setManualItemName(e.target.value)} placeholder="e.g., Golf Cart Rental" className="w-full px-4 py-2 border border-slate-200 bg-white rounded-full focus:outline-none focus:border-navy-main font-semibold text-xs" />
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-100/70 pt-4 mt-2 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-[#7C789B] uppercase tracking-wider block text-center sm:text-left">Quantity (Qty)</label>
                  <input type="number" min="1" value={addQty} onChange={(e) => setAddQty(parseFloat(e.target.value) || 1)} className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-full focus:outline-none focus:border-navy-main font-semibold text-xs text-center" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-[#7C789B] uppercase tracking-wider block text-center sm:text-left">Rate (SAR)</label>
                  <input type="number" disabled={isClient && selCatalogId} value={addRate} onChange={(e) => setAddRate(parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-full focus:outline-none focus:border-navy-main font-semibold text-xs text-center disabled:bg-slate-100 disabled:text-slate-500" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-[#7C789B] uppercase tracking-wider block text-center sm:text-left">Basis</label>
                  <select disabled={!!selCatalogId} value={addBasis} onChange={(e) => setAddBasis(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-full focus:outline-none focus:border-navy-main font-semibold text-xs cursor-pointer disabled:bg-slate-100 text-center">
                    <option value="FLAT">FLAT</option><option value="PAX">PAX</option>
                  </select>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleAddDynamicService} 
                className="w-full py-3 px-4 text-white font-extrabold rounded-full transition shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider" 
                style={{ backgroundColor: 'var(--navy)' }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add Service Item</span>
              </button>
            </div>
          </div>
        </details>
      </div>
    );
  };

  const renderSummaryPanel = () => (
    <div className="card shadow-md border-slate-100 rounded-3xl overflow-hidden bg-white">
      <div className="cmp p-5 text-left">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#7C789B] mb-3">Direct Cost Composition</h4>
        <div className="bar rounded-full overflow-hidden h-4">
          {Object.entries(costPercentage).map(([group, pct]) => {
            if (pct <= 0) return null;
            return <div key={group} style={{ width: `${pct}%`, backgroundColor: costColors[group] || '#CBD5E1' }} className="bs2" title={`${costLabels[group]}: ${pct.toFixed(1)}%`} />;
          })}
        </div>
        <div className="lgd mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(costSpread).map(([group, val]) => {
            if (val <= 0) return null;
            return (
              <div key={group} className="lg flex items-center gap-1.5 text-2xs text-[#7C789B]">
                <i style={{ backgroundColor: costColors[group] }} className="w-2.5 h-2.5 rounded-full" />
                <span>{costLabels[group]}: <b className="text-slate-700">{costPercentage[group].toFixed(0)}%</b></span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="ln px-5 py-4 space-y-2 border-b border-slate-100 bg-[#FAFAFC] text-left">
        <div className="l flex justify-between text-xs font-semibold text-slate-500"><span>Direct Cost</span><span className="text-slate-800">{formatSAR(cost.direct)}</span></div>
        <div className="l flex justify-between text-xs font-semibold text-slate-500"><span>Overhead &amp; Buffer ({oh}%)</span><span className="text-slate-800">{formatSAR(cost.add)}</span></div>
        <div className="l t flex justify-between text-xs font-black pt-2 border-t border-slate-200/60">
          <span style={{ color: 'var(--navy)' }}>Full Cost</span><span style={{ color: 'var(--navy)' }}>{formatSAR(cost.full)}</span>
        </div>
      </div>
      <div className="big p-5 border-b border-slate-100 bg-white text-left">
        <div className="cap text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Cost per Pax</div>
        <div className="amt text-2xl font-black mt-0.5" style={{ color: 'var(--navy)' }}>{cost.fp.toFixed(1)} <small className="text-xs font-normal">SAR</small></div>
        <div className="idr text-2xs text-[#7C789B] font-semibold mt-0.5">{formatIDR(cost.fp)}</div>
      </div>
      <div className="mgn p-5 border-b border-slate-100 text-left">
        <div className="tp flex justify-between items-baseline mb-2">
          <span className="k text-[10px] font-bold text-[#7C789B] uppercase tracking-wider">Profit Margin</span>
          <span className="v text-lg font-black" style={{ color: 'var(--navy)' }}>{margin}%</span>
        </div>
        <input type="range" min="5" max="40" step="0.5" value={margin} onChange={(e) => setMargin(parseFloat(e.target.value))} className="w-full accent-navy-main cursor-pointer" style={{ accentColor: 'var(--navy)' }} />
        <div className="ticks flex justify-between text-[9px] text-[#7C789B] font-semibold mt-1.5"><span>5%</span><span>12.5%</span><span>20%</span><span>30%</span><span>40%</span></div>
        <div className={`status rounded-xl mt-3 ${getMarginClass()}`}>{getMarginStatusText()}</div>
      </div>
      <div className="sell p-6 text-white text-center" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="cap text-2xs font-extrabold uppercase tracking-wider text-blue-100">Selling Price per Pax</div>
        <div className="amt text-3xl font-black tracking-tight mt-1">{cost.sp.toFixed(1)} <small className="text-sm font-semibold">SAR</small></div>
        <div className="idr text-xs mt-1 text-blue-100">{formatIDR(cost.sp)}</div>
        <div className="sp2 mt-4 pt-4 border-t border-white/20 flex gap-4 text-left">
          <div className="flex-1"><div className="k text-3xs uppercase tracking-wider text-blue-100">Group Sales</div><div className="v text-sm font-bold text-white mt-0.5">{formatSAR(cost.sellTotal)}</div></div>
          <div className="flex-1"><div className="k text-3xs uppercase tracking-wider text-blue-100">Group Profit</div><div className="v text-sm font-bold text-emerald-300 mt-0.5">{formatSAR(cost.profit)}</div></div>
        </div>
      </div>
      <div className="note bg-slate-50/50 p-5 flex gap-4 border-t border-slate-100">
        <button type="button" onClick={handleReset} className="flex-1 py-2.5 px-3 border border-slate-200 hover:bg-slate-100/50 font-bold rounded-full text-xs text-slate-655 transition cursor-pointer">Reset</button>
        {user?.role !== 'inputer' && (
          <button type="button" onClick={() => setShowSaveModal(true)} className="flex-1 py-2.5 px-3 text-white font-bold rounded-full text-xs shadow-md transition duration-150 cursor-pointer active:scale-95" style={{ backgroundColor: 'var(--navy)' }}>Save Proposal</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative font-sans">
      <div className="md:hidden flex justify-between bg-white border border-slate-200 rounded-full p-1 mb-4 no-print shadow-sm">
        <button
          type="button"
          onClick={() => setActiveStep('param')}
          className="flex-1 py-2 text-center text-2xs font-bold rounded-full transition active:scale-98 cursor-pointer"
          style={activeStep === 'param' ? { backgroundColor: 'var(--navy)', color: 'white' } : { color: '#64748B' }}
        >
          1. Params
        </button>
        <button
          type="button"
          onClick={() => setActiveStep('layanan')}
          className="flex-1 py-2 text-center text-2xs font-bold rounded-full transition active:scale-98 cursor-pointer"
          style={activeStep === 'layanan' ? { backgroundColor: 'var(--navy)', color: 'white' } : { color: '#64748B' }}
        >
          2. Services
        </button>
        <button
          type="button"
          onClick={() => setActiveStep('ringkasan')}
          className="flex-1 py-2 text-center text-2xs font-bold rounded-full transition active:scale-98 cursor-pointer"
          style={activeStep === 'ringkasan' ? { backgroundColor: 'var(--navy)', color: 'white' } : { color: '#64748B' }}
        >
          3. Summary
        </button>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          {renderPackageSelector()}
          {renderParameters()}
          {renderCoreServices()}
          {renderOptionalServices()}
        </div>
        <div className="side">{renderSummaryPanel()}</div>
      </div>

      <div className="md:hidden space-y-4">
        {activeStep === 'param' && <>{renderPackageSelector()}{renderParameters()}</>}
        {activeStep === 'layanan' && <>{renderCoreServices()}{renderOptionalServices()}</>}
        {activeStep === 'ringkasan' && renderSummaryPanel()}
      </div>

      <div onClick={() => setActiveStep('ringkasan')} className="mbar no-print cursor-pointer hover:bg-opacity-95 active:scale-[0.99] transition">
        <div className="flex-1 text-left">
          <div className="k">Selling Price per Pax</div>
          <div className="v">
            {cost.sp.toFixed(1)} SAR 
            <span className="text-[10px] text-white/75 font-bold ml-2">({formatIDR(cost.sp)})</span>
          </div>
        </div>
        <div>
          {user?.role !== 'inputer' && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setShowSaveModal(true); }} 
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-600 font-black text-[11px] uppercase tracking-wider rounded-full shadow-md transition duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              <span>Save</span>
            </button>
          )}
        </div>
      </div>


      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-5 text-white flex justify-between items-center" style={{ backgroundColor: 'var(--navy)' }}>
              <h3 className="font-extrabold text-2xs uppercase tracking-wider">Save Proposal</h3>
              <button type="button" onClick={() => setShowSaveModal(false)} className="text-white hover:text-amber-300 text-2xl font-bold">&times;</button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client / Institution Name</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g., Al-Haram Travel" className="w-full px-4 py-2.5 border border-slate-350 rounded-full text-xs focus:outline-none focus:border-navy-main font-bold" style={{ color: 'var(--navy)' }} />
              </div>
              {saveMessage && <div className={`p-3 rounded-xl text-2xs font-bold text-center ${saveMessage.includes('success') || saveMessage.includes('saved') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{saveMessage}</div>}
              <button type="button" disabled={saveLoading} onClick={handleSaveProposal} className="w-full text-white font-bold py-2.5 rounded-full text-xs shadow transition duration-150 active:scale-98 cursor-pointer" style={{ backgroundColor: 'var(--navy)' }}>
                {saveLoading ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Pop-up Modal for selecting other categories (More Option) */}
      {showMoreGroupsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in text-left">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col h-[75vh]">
            <div className="p-5 text-white flex justify-between items-center" style={{ backgroundColor: 'var(--navy)' }}>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-100 block">All Available Categories</span>
                <h3 className="font-extrabold text-sm tracking-tight">Select Service Group</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreGroupsModal(false)}
                className="text-white hover:text-amber-300 text-2xl font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <p className="text-2xs text-[#7C789B] font-extrabold uppercase tracking-wide">Click to select category:</p>
              <div className="grid grid-cols-3 gap-3">
                {allOptions.map(val => {
                  const opt = getOptDetail(val);
                  const isSelected = selGroup === opt.value;
                  if (opt.value === 'MORE') return null;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelGroup(opt.value);
                        handleSelectCatalogItem('');
                        setShowMoreGroupsModal(false);
                      }}
                      className={`w-full min-h-[98px] flex flex-col items-center justify-center p-2.5 rounded-2xl border transition duration-150 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.01)] ${
                        isSelected 
                          ? 'border-transparent text-white shadow-md' 
                          : 'border-slate-150 bg-white text-slate-655 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      style={isSelected ? { backgroundColor: 'var(--navy)' } : {}}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-white/20' 
                          : opt.bgClass
                      }`}>
                        {opt.iconPath ? (
                          <img src={opt.iconPath} alt={opt.label} className="w-8 h-8 object-contain" />
                        ) : (
                          opt.icon
                        )}
                      </div>
                      <span className="text-[10px] font-black mt-2 leading-tight text-center whitespace-nowrap overflow-ellipsis overflow-hidden w-full">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aesthetic List-based Pop-up Modal for selecting packages (More Option) */}
      {showMorePackagesModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in text-left">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            {/* Elegant Header */}
            <div className="p-5 text-white flex justify-between items-center" style={{ backgroundColor: 'var(--navy)' }}>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-100 block">Pilihan Paket Perjalanan</span>
                <h3 className="font-extrabold text-sm tracking-tight">Daftar Paket Terdaftar</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMorePackagesModal(false)}
                className="text-white hover:text-amber-300 text-2xl font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition"
              >
                &times;
              </button>
            </div>
            
            {/* Scrollable list items - No text clipping, clean design */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-[#F8FAFC]">
              <p className="text-[10px] text-[#7C789B] font-extrabold uppercase tracking-wide">Pilih salah satu paket di bawah ini:</p>
              
              <div className="space-y-2.5">
                {packages.map((p, idx) => {
                  const isSelected = paket === p.package_code || (packages[0] && paket === '' && p.package_code === packages[0].package_code);
                  const displayDesc = getPkgDescription(p.package_code, p.description);
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setPaket(p.package_code);
                        setShowMorePackagesModal(false);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs' 
                          : 'border-slate-150 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                      }`}
                    >
                      {/* Image Thumbnail inside squircle container */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden">
                        <img
                          src={getPkgIconPath(p.package_code, idx)}
                          alt={p.package_name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-800">{p.package_name}</span>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            p.package_code === 'BESAR' ? 'bg-blue-100 text-blue-700' : p.package_code === 'ESENSIAL' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.package_code === 'BESAR' ? '16+ Pax' : 'Max 15 Pax'}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 mt-1.5 leading-normal">
                          {displayDesc}
                        </div>
                      </div>

                      {/* Circular active radio indicator */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-blue-500 text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
