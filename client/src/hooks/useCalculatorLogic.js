import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useCalculatorLogic() {
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

  const isOptActive = (item) => {
    return item.is_active_by_default === 1;
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
  const isClient = user?.role === 'user';

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
      alert('Category is required.');
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
        alert('Manual service name is required.');
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
      setSaveMessage('Client name is required.');
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
      setSaveMessage(resData.message || 'Proposal saved successfully!');
      setClientName('');
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveMessage('');
      }, 2500);
    } catch (err) {
      setSaveMessage(err.message || 'Failed to save proposal.');
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    catalog,
    packages,
    settings,
    paket,
    setPaket,
    pax,
    setPax,
    hari,
    setHari,
    hIn,
    setHIn,
    hOut,
    setHOut,
    kelas,
    setKelas,
    tips,
    setTips,
    kurs,
    setKurs,
    oh,
    setOh,
    margin,
    setMargin,
    coreItems,
    optItems,
    selGroup,
    setSelGroup,
    customGroup,
    setCustomGroup,
    selCatalogId,
    setSelCatalogId,
    manualItemName,
    setManualItemName,
    addQty,
    setAddQty,
    addRate,
    setAddRate,
    addBasis,
    setAddBasis,
    showSaveModal,
    setShowSaveModal,
    clientName,
    setClientName,
    saveLoading,
    saveMessage,
    user,
    level,
    cost,
    isClient,
    handleToggleCore,
    handleToggleOption,
    handleQtyChange,
    handleRateChange,
    handleSelectCatalogItem,
    handleAddDynamicService,
    handleDeleteCustom,
    handleReset,
    handleSaveProposal,
  };
}
