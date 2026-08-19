import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Calculator() {
  const { catalog, fetchCatalog, saveProposal, user, packages, fetchPackages, settings, fetchSettings } = useApp();

  // State parameters
  const [paket, setPaket] = useState('BESAR');
  const [pax, setPax] = useState(40);
  const [hari, setHari] = useState(7);
  const [hIn, setHIn] = useState(2);
  const [hOut, setHOut] = useState(2);
  const [kelas, setKelas] = useState('Reguler');
  const [tips, setTips] = useState('Standar');
  const [kurs, setKurs] = useState(4800);
  const [oh, setOh] = useState(10);
  const [margin, setMargin] = useState(20);

  // Core & Options lists
  const [coreItems, setCoreItems] = useState([]);
  const [optItems, setOptItems] = useState([]);

  // Dynamic service adder states
  const [selGroup, setSelGroup] = useState('HANDLING');
  const [customGroup, setCustomGroup] = useState('');
  const [selCatalogId, setSelCatalogId] = useState('');
  const [manualItemName, setManualItemName] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [addRate, setAddRate] = useState(0);
  const [addBasis, setAddBasis] = useState('FLAT');

  // Proposal modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch catalog & packages on mount
  useEffect(() => {
    fetchCatalog();
    fetchPackages();
    fetchSettings();
  }, []);

  // Split catalog into core and options, and assign initial override values
  useEffect(() => {
    if (catalog.length > 0) {
      const core = catalog
        .filter(item => item.scope !== 'OPTIONAL' && !item.is_custom)
        .map(item => ({ ...item, q_override: null, r_override: null, active_override: null }));
      
      const opt = catalog
        .filter(item => item.scope === 'OPTIONAL' && !item.is_custom)
        .map(item => ({ ...item, q_override: null, r_override: null }));

      setCoreItems(core);
      setOptItems(opt);
    }
  }, [catalog]);

  // Sync quantities to parameters when parameters change
  useEffect(() => {
    setCoreItems(prev => prev.map(item => {
      if (item.item_name.includes('Check-in Hotel') || item.item_name.includes('Tips Bellboy — Check-in')) {
        return { ...item, qty_default: hIn };
      }
      if (item.item_name.includes('Check-out Hotel') || item.item_name.includes('Tips Bellboy — Check-out')) {
        return { ...item, qty_default: hOut };
      }
      if (item.item_name.includes('Muthowif (per hari)')) {
        return { ...item, qty_default: hari };
      }
      return item;
    }));
  }, [hari, hIn, hOut]);

  // Reset core active overrides when package type changes
  useEffect(() => {
    setCoreItems(prev => prev.map(item => ({ ...item, active_override: null })));
  }, [paket]);

  // Fee level matrix calculation
  const getLevelInfo = () => {
    if (pax <= 20) return { name: 'L1', text: '−30%', mu: 0.70, bi: 50, bo: 60 };
    if (pax <= 30) return { name: 'L2', text: '−15%', mu: 0.85, bi: 60, bo: 70 };
    if (pax <= 45) return { name: 'L3', text: 'Normal', mu: 1.00, bi: 70, bo: 80 };
    return { name: 'L4', text: '+15%', mu: 1.15, bi: 70, bo: 80 };
  };

  const activePkg = packages.find(p => p.package_code === paket) || packages[0];
  const level = getLevelInfo();

  // Dynamic Rate Calculation
  const getRate = (item) => {
    if (item.r_override !== null && item.r_override !== undefined) {
      return parseFloat(item.r_override);
    }
    
    if (item.bellboy_type) {
      return item.bellboy_type === 'in' ? level.bi : level.bo;
    }

    let r = item.is_catering_tier
      ? (kelas === 'Premium' ? parseFloat(item.rate_premium) : parseFloat(item.rate_standard))
      : (tips === 'Maksimal' ? parseFloat(item.rate_maximal) : parseFloat(item.rate_standard));

    if (item.is_level_adjusted) {
      r *= level.mu;
    }
    return r;
  };

  const getQty = (item) => {
    if (item.q_override !== null && item.q_override !== undefined) {
      return parseFloat(item.q_override);
    }
    return parseFloat(item.qty_default);
  };

  // Active status checker for core services
  const isCoreActive = (item) => {
    if (!activePkg) return false;
    if (item.depends_on_item === 'zam') {
      const zam = optItems.find(o => o.item_name.includes('Air Zamzam'));
      return zam ? isOptActive(zam) : false;
    }
    return activePkg.catalog_ids.includes(item.id);
  };

  const isOptActive = (item) => {
    return item.is_active_by_default === 1;
  };

  // Subtotal calculator
  const getSubtotal = (item, isActive) => {
    if (!isActive) return 0;
    const q = getQty(item);
    const r = getRate(item);
    const multiplier = item.basis === 'PAX' ? pax : 1;
    return q * r * multiplier;
  };

  // Cost calculation summation
  const calculateCosts = () => {
    let direct = 0;
    
    // Core subtotals
    const cores = coreItems.map(item => {
      const active = item.active_override !== null ? item.active_override : isCoreActive(item);
      const sub = getSubtotal(item, active);
      direct += sub;
      return { ...item, active, rate: getRate(item), qty: getQty(item), subtotal: sub };
    });

    // Options subtotals
    const opts = optItems.map(item => {
      const active = isOptActive(item);
      const sub = getSubtotal(item, active);
      direct += sub;
      return { ...item, active, rate: getRate(item), qty: getQty(item), subtotal: sub };
    });

    const add = direct * (oh / 100);
    const full = direct + add;
    const fp = pax > 0 ? full / pax : 0;
    const mDec = margin / 100;
    const sellTotal = mDec < 1 ? full / (1 - mDec) : 0;
    const sp = pax > 0 ? sellTotal / pax : 0;
    const profit = sellTotal - full;

    return {
      direct,
      add,
      full,
      fp,
      sellTotal,
      sp,
      profit,
      cores,
      opts
    };
  };

  const cost = calculateCosts();

  // Inputs Handlers
  const handleToggleCore = (index) => {
    setCoreItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const currentActive = item.active_override !== null ? item.active_override : isCoreActive(item);
        return { ...item, active_override: !currentActive };
      }
      return item;
    }));
  };

  const handleToggleOption = (index) => {
    setOptItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, is_active_by_default: item.is_active_by_default === 1 ? 0 : 1 } : item
    ));
  };

  const handleQtyChange = (list, index, val) => {
    const numeric = parseFloat(val);
    const updater = prev => prev.map((item, idx) => 
      idx === index ? { ...item, q_override: isNaN(numeric) ? null : numeric } : item
    );
    if (list === 'C') setCoreItems(updater);
    else setOptItems(updater);
  };

  const handleRateChange = (list, index, val) => {
    const numeric = parseFloat(val);
    const updater = prev => prev.map((item, idx) => 
      idx === index ? { ...item, r_override: isNaN(numeric) ? null : numeric } : item
    );
    if (list === 'C') setCoreItems(updater);
    else setOptItems(updater);
  };

  const handleSelectCatalogItem = (id) => {
    setSelCatalogId(id);
    if (id) {
      const item = catalog.find(c => c.id === parseInt(id));
      if (item) {
        setManualItemName(item.item_name);
        setAddBasis(item.basis);
        // Pre-fill the rate based on class and level
        let r = item.is_catering_tier
          ? (kelas === 'Premium' ? parseFloat(item.rate_premium) : parseFloat(item.rate_standard))
          : (tips === 'Maksimal' ? parseFloat(item.rate_maximal) : parseFloat(item.rate_standard));
        if (item.is_level_adjusted) {
          r *= level.mu;
        }
        setAddRate(r);
        setAddQty(parseFloat(item.qty_default) || 1);
      }
    } else {
      setManualItemName('');
      setAddRate(0);
      setAddQty(1);
    }
  };

  const handleAddDynamicService = () => {
    const finalGroup = selGroup === 'NEW' ? customGroup.trim().toUpperCase() : selGroup;
    if (!finalGroup) {
      alert('Kategori wajib dipilih atau dibuat.');
      return;
    }

    let finalName = '';
    let finalBasis = addBasis;
    let finalRate = parseFloat(addRate) || 0;

    if (selCatalogId) {
      const catItem = catalog.find(c => c.id === parseInt(selCatalogId));
      if (!catItem) return;
      finalName = catItem.item_name;
      finalBasis = catItem.basis;
      if (isClient) {
        // Client uses standard rate from catalog
        finalRate = catItem.is_catering_tier
          ? (kelas === 'Premium' ? parseFloat(catItem.rate_premium) : parseFloat(catItem.rate_standard))
          : (tips === 'Maksimal' ? parseFloat(catItem.rate_maximal) : parseFloat(catItem.rate_standard));
        if (catItem.is_level_adjusted) {
          finalRate *= level.mu;
        }
      }
    } else {
      finalName = manualItemName.trim();
      if (!finalName) {
        alert('Nama layanan manual wajib diisi.');
        return;
      }
    }

    const existingIdx = optItems.findIndex(
      x => x.item_name.toLowerCase() === finalName.toLowerCase() && x.group_name.toUpperCase() === finalGroup.toUpperCase()
    );

    if (existingIdx !== -1) {
      setOptItems(prev => prev.map((item, idx) => {
        if (idx === existingIdx) {
          return {
            ...item,
            is_active_by_default: 1,
            q_override: addQty,
            r_override: finalRate,
            active: true
          };
        }
        return item;
      }));
    } else {
      const newItem = {
        id: 'custom-' + Date.now(),
        group_name: finalGroup,
        item_name: finalName,
        basis: finalBasis,
        qty_default: addQty,
        rate_standard: finalRate,
        rate_maximal: finalRate,
        rate_premium: finalRate,
        q_override: addQty,
        r_override: finalRate,
        is_custom: true,
        is_active_by_default: 1,
        active: true
      };
      setOptItems(prev => [...prev, newItem]);
    }

    // Reset states
    setManualItemName('');
    setCustomGroup('');
    setSelCatalogId('');
    setAddQty(1);
    setAddRate(0);
  };

  const handleDeleteCustom = (index) => {
    setOptItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleReset = () => {
    setPaket('BESAR');
    setPax(40);
    setHari(7);
    setHIn(2);
    setHOut(2);
    setKelas('Reguler');
    setTips('Standar');
    setKurs(4800);
    setOh(10);
    setMargin(20);
    fetchCatalog();
  };

  const handleSaveProposal = async () => {
    if (!clientName.trim()) {
      setSaveMessage('Nama klien wajib diisi.');
      return;
    }
    setSaveLoading(true);
    setSaveMessage('');

    const details = [...cost.cores, ...cost.opts]
      .filter(item => item.active)
      .map(item => ({
        g: item.group_name,
        n: item.item_name,
        q: item.qty,
        b: item.basis,
        r: item.rate,
        sb: item.subtotal
      }));

    const payload = {
      client_name: clientName,
      pax_count: pax,
      package_type: paket,
      duration_days: hari,
      hotel_in: hIn,
      hotel_out: hOut,
      catering_class: kelas,
      tips_scenario: tips,
      exchange_rate: kurs,
      overhead_percent: oh,
      margin_percent: margin,
      direct_cost: cost.direct,
      full_cost: cost.full,
      sell_price: cost.sellTotal,
      profit: cost.profit,
      details_json: details
    };

    try {
      const resData = await saveProposal(payload);
      setSaveMessage(resData.message || 'Proposal berhasil disimpan!');
      setClientName('');
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveMessage('');
      }, 2500);
    } catch (err) {
      setSaveMessage(err.message || 'Gagal menyimpan proposal.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatSAR = (v) => {
    return parseFloat(v).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' SAR';
  };

  const formatIDR = (v) => {
    return 'Rp ' + (v * kurs).toLocaleString('id-ID', { maximumFractionDigits: 0 });
  };

  const getMarginClass = () => {
    const targetMargin = settings?.min_margin !== undefined ? settings.min_margin : 20;
    const floorMargin = settings?.floor_margin !== undefined ? settings.floor_margin : 12.5;

    if (margin >= targetMargin) return 'ok';
    if (margin >= floorMargin) return 'wr';
    return 'bd';
  };

  const getMarginStatusText = () => {
    const targetMargin = settings?.min_margin !== undefined ? settings.min_margin : 20;
    const floorMargin = settings?.floor_margin !== undefined ? settings.floor_margin : 12.5;

    if (margin >= targetMargin) return 'TARGET — Profit Aman';
    if (margin >= floorMargin) return 'FLOOR — Perlu Persetujuan';
    return 'DI BAWAH FLOOR — Tidak Layak';
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

  const isClient = user?.role === 'user';
  const cGroups = groupItems(cost.cores);
  const oGroups = groupItems(cost.opts);

  // Cost composition details
  const costPercentage = {};
  const costSpread = {};
  [...cost.cores, ...cost.opts].forEach(item => {
    if (item.active) {
      const g = item.group_name;
      costSpread[g] = (costSpread[g] || 0) + item.subtotal;
    }
  });

  const totalDirectActive = Object.values(costSpread).reduce((a, b) => a + b, 0);
  Object.entries(costSpread).forEach(([g, val]) => {
    costPercentage[g] = totalDirectActive > 0 ? (val / totalDirectActive) * 100 : 0;
  });

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
    HANDLING: 'Handling',
    MUTHOWIF: 'Muthowif',
    KATERING: 'Katering',
    DRIVER: 'Tips Driver',
    PHOTO: 'Dokumentasi',
    MEDIS: 'Medis',
    TAMBAHAN: 'Tambahan'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      
      {/* Parameters Panel */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Tipe Paket */}
        <div className="card">
          <div className="ch">
            <span>Pilih Paket Perjalanan</span>
          </div>
          <div className="cb">
            <div className="pk">
              {packages.map(p => {
                const isSelected = paket === p.package_code || (packages[0] && paket === '' && p.package_code === packages[0].package_code);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaket(p.package_code)}
                    aria-pressed={isSelected}
                    className="focus:outline-none"
                  >
                    <div className="t">{p.package_name}</div>
                    <div className="d">{p.description}</div>
                  </button>
                );
              })}
            </div>

            {paket === 'BESAR' && pax < 16 && (
              <div className="warnbox show">
                Grup Besar dimulai dari 16 pax. Untuk 15 pax ke bawah, silakan gunakan paket Kecil.
              </div>
            )}
            {(paket === 'ESENSIAL' || paket === 'LENGKAP') && pax > 15 && (
              <div className="warnbox show">
                Paket Kecil dibatasi maksimal 15 pax. Untuk 16 pax ke atas, gunakan Paket Besar.
              </div>
            )}
          </div>
        </div>

        {/* Parameter Inputs */}
        <div className="card">
          <div className="ch">
            <span>Parameter Laju Perjalanan</span>
          </div>
          <div className="cb">
            <div className="pg">
              <div className="f">
                <label>Pax Jama'ah</label>
                <input
                  type="number"
                  value={pax}
                  onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 0))}
                />
              </div>
              <div className="f">
                <label>Hari Muthowif</label>
                <input
                  type="number"
                  value={hari}
                  onChange={(e) => setHari(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
              <div className="f">
                <label>Hotel In</label>
                <input
                  type="number"
                  value={hIn}
                  onChange={(e) => setHIn(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
              <div className="f">
                <label>Hotel Out</label>
                <input
                  type="number"
                  value={hOut}
                  onChange={(e) => setHOut(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
              
              <div className="f">
                <label>Katering</label>
                <div className="seg">
                  {['Reguler', 'Premium'].map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKelas(k)}
                      aria-pressed={kelas === k}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="f">
                <label>Tips Driver</label>
                <div className="seg">
                  {['Standar', 'Maksimal'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTips(t)}
                      aria-pressed={tips === t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="f">
                <label>Kurs SAR &rarr; IDR</label>
                <input
                  type="number"
                  value={kurs}
                  onChange={(e) => setKurs(Math.max(1, parseInt(e.target.value) || 0))}
                />
              </div>

              <div className="f">
                <label>Overhead (%)</label>
                <input
                  type="number"
                  value={oh}
                  onChange={(e) => setOh(Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={isClient}
                />
              </div>
            </div>

            {/* Level Badge Chips */}
            <div className="lvl">
              <div className="chip">
                <div className="k">Level Fee</div>
                <div className="v">{level.name} ({level.text})</div>
              </div>
              <div className="chip">
                <div className="k">Bellboy In</div>
                <div className="v">{level.bi} SAR</div>
              </div>
              <div className="chip">
                <div className="k">Bellboy Out</div>
                <div className="v">{level.bo} SAR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Layanan Inti Collapsible */}
        <div className="card">
          <details className="det" open>
            <summary>
              <span>Layanan Inti</span>
            </summary>
            
            <div className={`rh ${isClient ? 'is-client-grid' : ''}`}>
              <span>Pilih Komponen</span>
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
                <div className="grp">
                  <span>{group}</span>
                </div>
                
                {items.map(item => {
                  const idx = coreItems.findIndex(x => x.id === item.id);
                  return (
                    <div key={item.id} className={`ir ${item.active ? '' : 'off'} ${isClient ? 'is-client-grid' : ''}`}>
                      <div className="nm">
                        <label className="tg">
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={() => handleToggleCore(idx)}
                          />
                          <span className="tr"></span>
                          <span className="kn"></span>
                        </label>
                        <span className="tx" title={item.item_name}>{item.item_name}</span>
                        <span className={`bs ${item.basis === 'PAX' ? 'p' : ''}`}>{item.basis}</span>
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          className="n"
                          disabled={!item.active || isClient}
                          value={item.q_override !== null ? item.q_override : item.qty_default}
                          onChange={(e) => handleQtyChange('C', idx, e.target.value)}
                        />
                      </div>
                      
                      {!isClient && (
                        <>
                          <div>
                            <input
                              type="number"
                              className="n"
                              disabled={!item.active || item.bellboy_type || item.is_level_adjusted || isClient}
                              value={parseFloat(item.rate.toFixed(1))}
                              onChange={(e) => handleRateChange('C', idx, e.target.value)}
                            />
                          </div>
                          <div className="sb">{formatSAR(item.subtotal)}</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </details>
        </div>

        {/* Layanan Pilihan Collapsible */}
        <div className="card">
          <details className="det" open>
            <summary>
              <span>Layanan Pilihan (Opsional)</span>
            </summary>
            
            <div className={`rh ${isClient ? 'is-client-grid' : ''}`}>
              <span>Pilih Komponen</span>
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
                <div className="grp">
                  <span>{group}</span>
                </div>
                
                {items.map(item => {
                  const idx = optItems.findIndex(x => x.id === item.id);
                  return (
                    <div key={item.id} className={`ir ${item.active ? '' : 'off'} ${isClient ? 'is-client-grid' : ''}`}>
                      <div className="nm">
                        <label className="tg">
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={() => handleToggleOption(idx)}
                          />
                          <span className="tr"></span>
                          <span className="kn"></span>
                        </label>
                        <span className="tx" title={item.item_name}>{item.item_name}</span>
                        <span className={`bs ${item.basis === 'PAX' ? 'p' : ''}`}>{item.basis}</span>
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          className="n"
                          disabled={!item.active}
                          value={item.q_override !== null ? item.q_override : item.qty_default}
                          onChange={(e) => handleQtyChange('O', idx, e.target.value)}
                        />
                      </div>
                      
                      {!isClient && (
                        <>
                          <div>
                            <input
                              type="number"
                              className="n"
                              disabled={!item.active || isClient}
                              value={parseFloat(item.rate.toFixed(1))}
                              onChange={(e) => handleRateChange('O', idx, e.target.value)}
                            />
                          </div>
                          <div className="sb">
                            {formatSAR(item.subtotal)}
                            {item.is_custom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustom(idx)}
                                className="del ml-1.5"
                                title="Hapus"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Dynamic unified service adder (both Admin & Client) */}
            {(() => {
              const existingGroups = Array.from(new Set(catalog.map(item => item.group_name)));
              const groupLabels = {
                HANDLING: 'Handling',
                MUTHOWIF: 'Muthowif',
                KATERING: 'Katering',
                DRIVER: 'Tips Driver',
                PHOTO: 'Dokumentasi',
                MEDIS: 'Medis',
                TAMBAHAN: 'Tambahan'
              };
              const availableCatalogItems = catalog.filter(c => {
                const matchesGroup = selGroup === 'NEW' ? true : c.group_name === selGroup;
                const isActiveInCalculator = optItems.some(o => o.item_name.toLowerCase() === c.item_name.toLowerCase() && o.is_active_by_default === 1);
                return matchesGroup && !isActiveInCalculator;
              });

              return (
                <div className="add border-t border-slate-100 bg-[#FAFAFC] p-4 flex flex-col gap-3 text-xs font-semibold text-[#1E293B]">
                  <div className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider">
                    Tambah Layanan ke Kalkulator
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    
                    {/* Category Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Kategori / Grup</label>
                      <select
                        value={selGroup}
                        onChange={(e) => {
                          setSelGroup(e.target.value);
                          setSelCatalogId('');
                          setManualItemName('');
                        }}
                        className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] cursor-pointer font-semibold text-xs"
                      >
                        {existingGroups.map(g => (
                          <option key={g} value={g}>{groupLabels[g] || g}</option>
                        ))}
                        <option value="NEW">[ + Kategori Kustom Baru ]</option>
                      </select>
                    </div>

                    {/* Custom Group input (if selected NEW) */}
                    {selGroup === 'NEW' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Nama Kategori Baru</label>
                        <input
                          type="text"
                          value={customGroup}
                          onChange={(e) => setCustomGroup(e.target.value)}
                          placeholder="Misal: HOTEL / ASURANSI..."
                          className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] font-semibold text-xs"
                        />
                      </div>
                    )}

                    {/* Catalog Item Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Pilih Item Tersedia</label>
                      <select
                        value={selCatalogId}
                        onChange={(e) => handleSelectCatalogItem(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] cursor-pointer font-semibold text-xs"
                      >
                        <option value="">[ Tulis Layanan Manual ]</option>
                        {availableCatalogItems.map(item => (
                          <option key={item.id} value={item.id}>{item.item_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Manual Item Name Input (if no catalog item chosen) */}
                    {!selCatalogId && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Nama Layanan Manual</label>
                        <input
                          type="text"
                          value={manualItemName}
                          onChange={(e) => setManualItemName(e.target.value)}
                          placeholder="Misal: Sewa Mobil Golf"
                          className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] font-semibold text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                    
                    {/* Quantity */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Kuantitas (Qty)</label>
                      <input
                        type="number"
                        min="1"
                        value={addQty}
                        onChange={(e) => setAddQty(parseFloat(e.target.value) || 1)}
                        className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] font-semibold text-xs"
                      />
                    </div>

                    {/* Rate (Hidden/Disabled for Client if Official Catalog) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Tarif (SAR)</label>
                      <input
                        type="number"
                        disabled={isClient && selCatalogId} // Client locked to catalog rate
                        value={addRate}
                        onChange={(e) => setAddRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] font-semibold text-xs disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>

                    {/* Basis (Locked if catalog item chosen) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Basis</label>
                      <select
                        disabled={!!selCatalogId}
                        value={addBasis}
                        onChange={(e) => setAddBasis(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-350 bg-white rounded-lg focus:outline-none focus:border-[#1E293B] font-semibold text-xs cursor-pointer disabled:bg-slate-100"
                      >
                        <option value="FLAT">FLAT</option>
                        <option value="PAX">PAX</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleAddDynamicService}
                      className="py-2.5 px-4 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-lg transition"
                    >
                      Tambah Item
                    </button>
                  </div>
                </div>
              );
            })()}
          </details>
        </div>

      </div>

      {/* Right Column Summary (Sticky on Desktop) */}
      <div className="side space-y-4">
        <div className="card">
          
          {/* Cost Composition Chart (Only Admin) */}
          {!isClient && (
            <div className="cmp">
              <h4>Komposisi Biaya (Direct Cost)</h4>
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
              <div className="lgd">
                {Object.entries(costSpread).map(([group, val]) => {
                  if (val <= 0) return null;
                  return (
                    <div key={group} className="lg">
                      <i style={{ backgroundColor: costColors[group] }} />
                      <span>{costLabels[group]}: <b>{costPercentage[group].toFixed(0)}%</b></span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core breakdown summary list (Only Admin) */}
          {!isClient && (
            <div className="ln">
              <div className="l">
                <span className="k">Direct Cost</span>
                <span className="v">{formatSAR(cost.direct)}</span>
              </div>
              <div className="l">
                <span className="k">Overhead &amp; Buffer ({oh}%)</span>
                <span className="v">{formatSAR(cost.add)}</span>
              </div>
              <div className="l t">
                <span className="k">Full Cost</span>
                <span className="v">{formatSAR(cost.full)}</span>
              </div>
            </div>
          )}

          {/* Full Cost / Pax (Only Admin) */}
          {!isClient && (
            <div className="big">
              <div className="cap">Full Cost per Jama'ah</div>
              <div className="amt">
                {cost.fp.toFixed(1)} <small>SAR</small>
              </div>
              <div className="idr">{formatIDR(cost.fp)}</div>
            </div>
          )}

          {/* Margin Keuntungan slider */}
          <div className="mgn">
            <div className="tp">
              <span className="k">Margin Keuntungan</span>
              <span className="v">{margin}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="0.5"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
            />
            <div className="ticks">
              <span>5%</span>
              <span>12.5%</span>
              <span>20%</span>
              <span>30%</span>
              <span>40%</span>
            </div>
            <div className={`status ${getMarginClass()}`}>
              {getMarginStatusText()}
            </div>
          </div>

          {/* Final Sell Price */}
          <div className="sell">
            <div className="cap">Harga Jual per Jama'ah</div>
            <div className="amt">
              {cost.sp.toFixed(1)} <small>SAR</small>
            </div>
            <div className="idr">{formatIDR(cost.sp)}</div>
            
            {!isClient && (
              <div className="sp2">
                <div>
                  <div className="k">Harga Jual Grup</div>
                  <div className="v">{formatSAR(cost.sellTotal)}</div>
                </div>
                <div>
                  <div className="k">Profit Grup</div>
                  <div className="v" style={{ color: '#10B981' }}>{formatSAR(cost.profit)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Save/Reset Bottom actions */}
          <div className="note border-t border-[#grey] flex gap-3.5 bg-slate-50">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-3 border border-slate-350 hover:bg-slate-100 font-bold rounded-lg text-xs transition duration-150"
            >
              Reset
            </button>
            {user?.role !== 'inputer' && (
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="flex-1 py-2 px-3 bg-[#000066] hover:bg-[#23237A] text-white font-bold rounded-lg text-xs shadow-md transition duration-150"
              >
                Simpan Proposal
              </button>
            )}
          </div>

        </div>
      </div>

      {/* FIXED BOTTOM BAR ON MOBILE (Mobile-First Sticky Value) */}
      <div className="mbar no-print">
        <div className="flex-1">
          <div className="k">Harga Jual per Jama'ah</div>
          <div className="v">{cost.sp.toFixed(1)} SAR <span className="text-[10px] text-slate-300 font-normal">({formatIDR(cost.sp)})</span></div>
        </div>
        <div>
          {user?.role !== 'inputer' && (
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-[#C89D7C] hover:bg-[#b58866] text-[#000066] font-bold text-xs rounded-lg shadow transition"
            >
              Simpan
            </button>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#000066] text-white">
              <h3 className="font-bold text-xs uppercase tracking-wider">Simpan Proposal</h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-white hover:text-[#C89D7C] text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nama Klien / Instansi
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Misal: Travel Al-Haram"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#000066] font-bold text-[#000066]"
                />
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                  saveMessage.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {saveMessage}
                </div>
              )}

              <button
                type="button"
                disabled={saveLoading}
                onClick={handleSaveProposal}
                className="w-full bg-[#000066] hover:bg-[#23237A] text-white font-bold py-2.5 rounded-lg text-xs shadow transition duration-150"
              >
                {saveLoading ? 'Menyimpan...' : 'Konfirmasi Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
