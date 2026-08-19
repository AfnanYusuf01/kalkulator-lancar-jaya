import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Catalog() {
  const {
    catalog,
    fetchCatalog,
    updateCatalogItem,
    createCatalogItem,
    deleteCatalogItem,
    packages,
    fetchPackages,
    savePackage,
    deletePackage,
    settings,
    fetchSettings,
    updateSettings,
    user
  } = useApp();

  // Sub Tab State
  const [subTab, setSubTab] = useState('catalog');

  // Edit Parameter Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [rateStd, setRateStd] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [ratePrem, setRatePrem] = useState('');
  const [qtyDef, setQtyDef] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editBasis, setEditBasis] = useState('FLAT');
  const [editScope, setEditScope] = useState('OPTIONAL');
  const [editIsLevelAdjusted, setEditIsLevelAdjusted] = useState(false);
  const [editIsCateringTier, setEditIsCateringTier] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // New Parameter Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroupSelect, setNewGroupSelect] = useState('HANDLING');
  const [newGroupCustom, setNewGroupCustom] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newBasis, setNewBasis] = useState('FLAT');
  const [newQtyDef, setNewQtyDef] = useState(1);
  const [newRateStd, setNewRateStd] = useState(0);
  const [newRateMax, setNewRateMax] = useState(0);
  const [newRatePrem, setNewRatePrem] = useState(0);
  const [newScope, setNewScope] = useState('OPTIONAL');
  const [newIsLevelAdjusted, setNewIsLevelAdjusted] = useState(false);
  const [newIsCateringTier, setNewIsCateringTier] = useState(false);
  const [newIsActiveByDefault, setNewIsActiveByDefault] = useState(true);
  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Dynamic custom categories addition
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryMsg, setCategoryMsg] = useState('');

  // Package Management States
  const [showAddPkgForm, setShowAddPkgForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageCode, setPackageCode] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [selectedCatalogIds, setSelectedCatalogIds] = useState([]);
  const [pkgMessage, setPkgMessage] = useState('');
  const [pkgLoading, setPkgLoading] = useState(false);

  // Settings states
  const [targetMarginInput, setTargetMarginInput] = useState('');
  const [floorMarginInput, setFloorMarginInput] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
    fetchPackages();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setTargetMarginInput(settings.min_margin !== undefined ? settings.min_margin.toString() : '20');
      setFloorMarginInput(settings.floor_margin !== undefined ? settings.floor_margin.toString() : '12.5');
    }
  }, [settings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg('');
    try {
      await updateSettings({
        min_margin: parseFloat(targetMarginInput),
        floor_margin: parseFloat(floorMarginInput)
      });
      setSettingsMsg('Pengaturan margin berhasil disimpan!');
      setTimeout(() => setSettingsMsg(''), 2000);
    } catch (err) {
      setSettingsMsg(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Get unique categories from current catalog merged with custom added ones
  const allCategories = Array.from(new Set([
    ...catalog.map(item => item.group_name),
    ...customCategories
  ]));

  // Parameter Handlers
  const handleEditClick = (item) => {
    setEditingItem(item);
    setRateStd(item.rate_standard);
    setRateMax(item.rate_maximal);
    setRatePrem(item.rate_premium);
    setQtyDef(item.qty_default);
    setIsActive(item.is_active_by_default === 1);
    setEditBasis(item.basis || 'FLAT');
    setEditScope(item.scope || 'OPTIONAL');
    setEditIsLevelAdjusted(item.is_level_adjusted === 1);
    setEditIsCateringTier(item.is_catering_tier === 1);
    setMessage('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    setMessage('');

    const updatedData = {
      rate_standard: parseFloat(rateStd) || 0,
      rate_maximal: parseFloat(rateMax) || 0,
      rate_premium: parseFloat(ratePrem) || 0,
      qty_default: parseFloat(qtyDef) || 1,
      is_active_by_default: isActive ? 1 : 0,
      basis: editBasis,
      scope: editScope,
      is_level_adjusted: editIsLevelAdjusted ? 1 : 0,
      is_catering_tier: editIsCateringTier ? 1 : 0
    };

    try {
      await updateCatalogItem(editingItem.id, updatedData);
      setMessage('Item katalog berhasil diperbarui.');
      setTimeout(() => {
        setEditingItem(null);
        setMessage('');
      }, 1100);
    } catch (err) {
      setMessage(err.message || 'Gagal memperbarui item katalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParameter = async (e) => {
    e.preventDefault();
    const finalGroup = newGroupSelect;
    if (!finalGroup) {
      setAddMsg('Kategori wajib dipilih.');
      return;
    }
    if (!newItemName.trim()) {
      setAddMsg('Nama layanan wajib diisi.');
      return;
    }
    setAddLoading(true);
    setAddMsg('');

    const newItemData = {
      group_name: finalGroup,
      item_name: newItemName.trim(),
      basis: newBasis,
      qty_default: parseFloat(newQtyDef) || 1,
      rate_standard: parseFloat(newRateStd) || 0,
      rate_maximal: parseFloat(newRateMax) || 0,
      rate_premium: parseFloat(newRatePrem) || 0,
      scope: newScope,
      is_level_adjusted: newIsLevelAdjusted,
      is_catering_tier: newIsCateringTier,
      is_active_by_default: newIsActiveByDefault
    };

    try {
      await createCatalogItem(newItemData);
      setAddMsg('Item layanan berhasil ditambahkan ke katalog!');
      setNewItemName('');
      setNewQtyDef(1);
      setNewRateStd(0);
      setNewRateMax(0);
      setNewRatePrem(0);
      setNewIsLevelAdjusted(false);
      setNewIsCateringTier(false);
      setNewIsActiveByDefault(true);
      setTimeout(() => {
        setAddMsg('');
        setShowAddForm(false);
      }, 1500);
    } catch (err) {
      setAddMsg(err.message || 'Gagal menambahkan item.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    const name = newCategoryName.trim().toUpperCase();
    if (!name) {
      setCategoryMsg('Nama kategori wajib diisi.');
      return;
    }
    if (allCategories.includes(name)) {
      setCategoryMsg('Kategori tersebut sudah terdaftar.');
      return;
    }
    setCustomCategories(prev => [...prev, name]);
    setCategoryMsg(`Kategori "${name}" berhasil ditambahkan! Silakan gunakan kategori ini saat membuat item baru.`);
    setNewCategoryName('');
    setTimeout(() => {
      setCategoryMsg('');
      setShowAddCategoryForm(false);
      setNewGroupSelect(name);
      setShowAddForm(true);
    }, 1800);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus parameter ini secara permanen dari katalog?')) return;
    try {
      await deleteCatalogItem(itemId);
    } catch (err) {
      alert(err.message || 'Gagal menghapus parameter.');
    }
  };

  // Package Management Handlers
  const handleSavePackageSubmit = async (e) => {
    e.preventDefault();
    if (!packageName.trim() || (!editingPackage && !packageCode.trim())) {
      setPkgMessage('Kode paket dan nama paket wajib diisi.');
      return;
    }
    setPkgLoading(true);
    setPkgMessage('');

    const payload = {
      id: editingPackage ? editingPackage.id : undefined,
      package_code: editingPackage ? undefined : packageCode.trim().toUpperCase(),
      package_name: packageName.trim(),
      description: packageDesc.trim(),
      catalog_ids: selectedCatalogIds
    };

    try {
      await savePackage(payload);
      setPkgMessage(editingPackage ? 'Paket berhasil diperbarui!' : 'Paket baru berhasil dibuat!');
      setPackageCode('');
      setPackageName('');
      setPackageDesc('');
      setSelectedCatalogIds([]);
      setEditingPackage(null);
      setTimeout(() => {
        setPkgMessage('');
        setShowAddPkgForm(false);
      }, 1500);
    } catch (err) {
      setPkgMessage(err.message || 'Gagal menyimpan paket.');
    } finally {
      setPkgLoading(false);
    }
  };

  const handleEditPackageClick = (pkg) => {
    setEditingPackage(pkg);
    setPackageCode(pkg.package_code);
    setPackageName(pkg.package_name);
    setPackageDesc(pkg.description || '');
    setSelectedCatalogIds(pkg.catalog_ids || []);
    setShowAddPkgForm(true);
    setPkgMessage('');
  };

  const handleDeletePackageClick = async (pkgId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus paket ini secara permanen?')) return;
    try {
      await deletePackage(pkgId);
    } catch (err) {
      alert(err.message || 'Gagal menghapus paket.');
    }
  };

  const handleToggleCatalogId = (id) => {
    setSelectedCatalogIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const groupLabels = {
    HANDLING: 'Handling',
    MUTHOWIF: 'Muthowif',
    KATERING: 'Katering',
    DRIVER: 'Tips Driver',
    PHOTO: 'Dokumentasi',
    MEDIS: 'Medis',
    TAMBAHAN: 'Tambahan'
  };

  const groupBadgeColors = (group) => {
    if (group === 'HANDLING') return 'bg-blue-50/80 text-blue-700 border border-blue-200';
    if (group === 'MUTHOWIF') return 'bg-purple-50/80 text-purple-700 border border-purple-200';
    if (group === 'KATERING') return 'bg-amber-50/80 text-amber-750 border border-amber-200';
    if (group === 'DRIVER') return 'bg-emerald-50/80 text-emerald-700 border border-emerald-200';
    return 'bg-slate-100 text-slate-650 border border-slate-200';
  };

  // Group catalog items by category for package checklist
  const catalogByCategory = {};
  catalog.forEach(item => {
    if (!catalogByCategory[item.group_name]) {
      catalogByCategory[item.group_name] = [];
    }
    catalogByCategory[item.group_name].push(item);
  });

  const isEditor = ['superadmin', 'admin', 'inputer'].includes(user?.role);
  const isAdmin = ['superadmin', 'admin'].includes(user?.role);

  return (
    <div className="space-y-4">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#DBDBDB] pb-3 gap-2">
        <div>
          <h1 className="text-base font-black text-[#1E293B] tracking-tight uppercase">Pengaturan &amp; Katalog Item</h1>
          <p className="text-[10px] text-[#6E6E85] font-semibold tracking-wider mt-0.5 uppercase">Kelola daftar layanan, bundling paket, dan konfigurasi tarif dasar item</p>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2.5">
        <button
          onClick={() => setSubTab('catalog')}
          className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
            subTab === 'catalog'
              ? 'bg-[#1E293B] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Katalog Item
        </button>
        <button
          onClick={() => setSubTab('packages')}
          className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
            subTab === 'packages'
              ? 'bg-[#1E293B] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Kelola Paket Perjalanan
        </button>
        {isAdmin && (
          <button
            onClick={() => setSubTab('settings')}
            className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
              subTab === 'settings'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Konfigurasi Margin
          </button>
        )}
      </div>

      {/* TAB 1: CATALOG PARAMETERS */}
      {subTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            {isEditor && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryForm(!showAddCategoryForm);
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2 border border-slate-350 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition animate-fade-in"
                >
                  {showAddCategoryForm ? 'Tutup Form' : 'Tambah Kategori Baru'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setShowAddCategoryForm(false);
                  }}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-bold rounded-lg shadow-sm transition animate-fade-in"
                >
                  {showAddForm ? 'Tutup Form' : 'Tambah Item Baru'}
                </button>
              </>
            )}
          </div>

          {/* Add Category Form */}
          {showAddCategoryForm && (
            <div className="card border-[#CBD5E1] bg-white animate-slide-down">
              <div className="ch bg-[#1E293B]">
                <span>Tambah Kategori Layanan Baru</span>
              </div>
              <form onSubmit={handleCreateCategorySubmit} className="cb p-5 space-y-4 text-xs font-semibold text-[#1E293B]">
                <div className="space-y-1 max-w-sm">
                  <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Nama Kategori Baru</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Misal: HOTEL, VISA, ASURANSI..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B] font-bold uppercase"
                  />
                </div>

                {categoryMsg && (
                  <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                    categoryMsg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {categoryMsg}
                  </div>
                )}

                <div className="flex justify-start gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg shadow transition"
                  >
                    Simpan Kategori
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Parameter Form */}
          {showAddForm && (
            <div className="card border-[#CBD5E1] bg-white animate-slide-down">
              <div className="ch bg-[#1E293B]">
                <span>Tambah Item Layanan Baru</span>
              </div>
              <form onSubmit={handleCreateParameter} className="cb p-5 space-y-4 text-xs font-semibold text-[#1E293B]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Kategori (Grup)</label>
                    <select
                      value={newGroupSelect}
                      onChange={(e) => setNewGroupSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1E293B] cursor-pointer"
                    >
                      {allCategories.map(g => (
                        <option key={g} value={g}>{groupLabels[g] || g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Nama Layanan / Komponen</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Misal: Asuransi Perjalanan VIP"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Basis Kalkulasi</label>
                    <select
                      value={newBasis}
                      onChange={(e) => setNewBasis(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1E293B] cursor-pointer"
                    >
                      <option value="FLAT">FLAT (Per grup)</option>
                      <option value="PAX">PAX (Per jama'ah)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Kuantitas Default</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newQtyDef}
                      onChange={(e) => setNewQtyDef(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Cakupan Paket</label>
                    <select
                      value={newScope}
                      onChange={(e) => setNewScope(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1E293B] cursor-pointer"
                    >
                      <option value="OPTIONAL">Pilihan (Optional)</option>
                      <option value="ALL">Semua Paket (Wajib)</option>
                      <option value="FULL">Kecil-Lengkap &amp; Grup Besar</option>
                      <option value="ESN">Hanya Kecil-Esensial</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Tarif Standar (SAR)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRateStd}
                      onChange={(e) => setNewRateStd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Tarif Maksimal (SAR)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRateMax}
                      onChange={(e) => setNewRateMax(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Tarif Premium Catering (SAR)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRatePrem}
                      onChange={(e) => setNewRatePrem(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B]"
                    />
                  </div>

                  <div className="flex flex-col justify-center space-y-2 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsLevelAdjusted}
                        onChange={(e) => setNewIsLevelAdjusted(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1E293B]"
                      />
                      <span>Fee Terpengaruh Level Fee?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsCateringTier}
                        onChange={(e) => setNewIsCateringTier(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1E293B]"
                      />
                      <span>Termasuk Katering Tier?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsActiveByDefault}
                        onChange={(e) => setNewIsActiveByDefault(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1E293B]"
                      />
                      <span>Aktif Bawaan?</span>
                    </label>
                  </div>
                </div>

                {addMsg && (
                  <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                    addMsg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {addMsg}
                  </div>
                )}

                <div className="flex justify-end gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-5 py-2 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg shadow transition"
                  >
                    {addLoading ? 'Menyimpan...' : 'Simpan ke Katalog'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Catalog Parameters List */}
          <div className="card bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-[#6E6E85] font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Nama Layanan</th>
                    <th className="p-3.5 text-center">Basis</th>
                    <th className="p-3.5 text-center">Qty Bawaan</th>
                    <th className="p-3.5 text-right">Tarif Standar</th>
                    <th className="p-3.5 text-right">Tarif Maksimal/Premium</th>
                    <th className="p-3.5 text-center">Status Bawaan</th>
                    <th className="p-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[#14142B]">
                  {catalog.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/20 transition duration-150">
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${groupBadgeColors(item.group_name)}`}>
                          {groupLabels[item.group_name] || item.group_name}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#1E293B] font-black text-xs">{item.item_name}</td>
                      <td className="p-3.5 text-center text-[#6E6E85] font-bold">{item.basis}</td>
                      <td className="p-3.5 text-center font-bold">{parseFloat(item.qty_default)}</td>
                      <td className="p-3.5 text-right font-bold text-slate-700">
                        {parseFloat(item.rate_standard).toLocaleString('id-ID')} SAR
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-700">
                        {item.is_catering_tier 
                          ? parseFloat(item.rate_premium).toLocaleString('id-ID') + ' SAR (Prem)'
                          : parseFloat(item.rate_maximal).toLocaleString('id-ID') + ' SAR'
                        }
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.is_active_by_default === 1 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {item.is_active_by_default === 1 ? 'Aktif' : 'Mati'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1.5 py-4">
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="px-2.5 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white text-[10px] font-bold rounded-lg transition"
                          >
                            Ubah
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-2.5 py-1.5 border border-slate-250 text-slate-400 hover:text-red-650 hover:bg-red-50 hover:border-red-500/30 text-[10px] font-bold rounded-lg transition"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Parameter Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#DBDBDB] overflow-hidden">
                <div className="p-4 border-b border-[#grey] flex justify-between items-center bg-[#1E293B] text-white">
                  <h3 className="font-bold text-xs uppercase tracking-wider">Ubah Parameter</h3>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="text-white hover:text-[#F59E0B] text-2xl font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition"
                  >
                    &times;
                  </button>
                </div>
                
                <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-semibold text-[#1E293B]">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider">Nama Komponen</div>
                    <div className="font-black text-[#1E293B] text-sm leading-snug">{editingItem.item_name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Basis Kalkulasi</label>
                      <select
                        value={editBasis}
                        onChange={(e) => setEditBasis(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1E293B] cursor-pointer"
                      >
                        <option value="FLAT">FLAT (Per grup)</option>
                        <option value="PAX">PAX (Per jama'ah)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Cakupan Paket</label>
                      <select
                        value={editScope}
                        onChange={(e) => setEditScope(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1E293B] cursor-pointer"
                      >
                        <option value="OPTIONAL">Pilihan (Optional)</option>
                        <option value="ALL">Semua Paket (Wajib)</option>
                        <option value="FULL">Kecil-Lengkap &amp; Grup Besar</option>
                        <option value="ESN">Hanya Kecil-Esensial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Qty Default</label>
                      <input
                        type="number"
                        step="0.1"
                        value={qtyDef}
                        onChange={(e) => setQtyDef(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1E293B]"
                      />
                    </div>
                    
                    <div className="space-y-1 flex items-end justify-start pl-2 pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-[#1E293B] font-bold">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-4.5 h-4.5 text-[#1E293B] rounded border-[#DBDBDB]"
                        />
                        Aktif Bawaan
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Rate Standard (SAR)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={rateStd}
                        onChange={(e) => setRateStd(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1E293B]"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">
                        {editingItem.is_catering_tier ? 'Rate Premium (SAR)' : 'Rate Maksimal (SAR)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingItem.is_catering_tier ? ratePrem : rateMax}
                        onChange={(e) => editingItem.is_catering_tier ? setRatePrem(e.target.value) : setRateMax(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1E293B]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsLevelAdjusted}
                        onChange={(e) => setEditIsLevelAdjusted(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1E293B]"
                      />
                      <span>Fee Terpengaruh Level Fee?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsCateringTier}
                        onChange={(e) => setEditIsCateringTier(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1E293B]"
                      />
                      <span>Termasuk Katering Tier?</span>
                    </label>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                      message.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="pt-2 flex gap-3.5">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="flex-1 py-2 border border-slate-300 font-bold rounded-lg text-[#14142B] text-center hover:bg-slate-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-lg text-center transition"
                    >
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PACKAGE BUNDLING MANAGEMENT */}
      {subTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {isEditor && (
              <button
                type="button"
                onClick={() => {
                  setEditingPackage(null);
                  setPackageCode('');
                  setPackageName('');
                  setPackageDesc('');
                  setSelectedCatalogIds([]);
                  setShowAddPkgForm(!showAddPkgForm);
                  setPkgMessage('');
                }}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                {showAddPkgForm ? 'Tutup Form' : 'Buat Paket Baru'}
              </button>
            )}
          </div>

          {/* Add/Edit Package Form */}
          {showAddPkgForm && (
            <div className="card border-[#CBD5E1] bg-white animate-slide-down">
              <div className="ch bg-[#1E293B]">
                <span>{editingPackage ? `Ubah Paket Perjalanan: ${editingPackage.package_name}` : 'Buat Paket Perjalanan Baru'}</span>
              </div>
              <form onSubmit={handleSavePackageSubmit} className="cb p-5 space-y-4 text-xs font-semibold text-[#1E293B]">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Package Code (Only editable during creation) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Kode Paket (Kode Unik)</label>
                    <input
                      type="text"
                      disabled={!!editingPackage}
                      value={packageCode}
                      onChange={(e) => setPackageCode(e.target.value)}
                      placeholder="Misal: EXECUTIVE / BINTANG_3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B] disabled:bg-slate-50 disabled:text-slate-400 font-bold"
                    />
                  </div>

                  {/* Package Name */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Nama Paket</label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="Misal: Paket Kecil — Executive"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B] font-bold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Deskripsi Paket</label>
                  <textarea
                    value={packageDesc}
                    onChange={(e) => setPackageDesc(e.target.value)}
                    placeholder="Tuliskan cakupan pelayanan atau kriteria jumlah jama'ah paket ini..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B] font-semibold text-xs h-16 resize-none"
                  />
                </div>

                {/* Catalog Items Checklist Grouped by Category */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block border-b border-slate-100 pb-1">
                    Pilih Layanan Yang Dimasukkan Ke Dalam Paket
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {Object.entries(catalogByCategory).map(([group, items]) => (
                      <div key={group} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/20">
                        <div className="bg-[#1E293B]/10 px-3 py-1.5 border-b border-slate-200 text-[#1E293B] font-bold text-[9px] uppercase tracking-wider">
                          {groupLabels[group] || group}
                        </div>
                        <div className="p-3.5 space-y-2.5">
                          {items.map(item => {
                            const isChecked = selectedCatalogIds.includes(item.id);
                            return (
                              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer text-slate-700 hover:text-[#1E293B] transition select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCatalogId(item.id)}
                                  className="w-4 h-4 rounded border-slate-350 text-[#1E293B] mt-0.5 cursor-pointer"
                                />
                                <div className="leading-snug">
                                  <div className="font-bold text-xs">{item.item_name}</div>
                                  <div className="text-[9px] text-[#6E6E85] font-semibold">{item.basis} &middot; {parseFloat(item.rate_standard)} SAR</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {pkgMessage && (
                  <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                    pkgMessage.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {pkgMessage}
                  </div>
                )}

                <div className="flex justify-end gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPkgForm(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={pkgLoading}
                    className="px-5 py-2 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg shadow transition"
                  >
                    {pkgLoading ? 'Menyimpan...' : 'Simpan Paket'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Packages List Table */}
          <div className="card bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-[#6E6E85] font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                    <th className="p-3.5 w-24">Kode Paket</th>
                    <th className="p-3.5 w-52">Nama Paket</th>
                    <th className="p-3.5">Deskripsi</th>
                    <th className="p-3.5 text-center w-28">Layanan Tergabung</th>
                    <th className="p-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[#14142B]">
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-slate-50/20 transition duration-150">
                      <td className="p-3.5 font-bold text-[#1E293B] uppercase">{pkg.package_code}</td>
                      <td className="p-3.5 font-bold text-[#1E293B]">{pkg.package_name}</td>
                      <td className="p-3.5 text-slate-500 font-normal leading-relaxed">{pkg.description || 'Tidak ada deskripsi.'}</td>
                      <td className="p-3.5 text-center font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                          {pkg.catalog_ids ? pkg.catalog_ids.length : 0} Layanan
                        </span>
                      </td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1.5 py-4">
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() => handleEditPackageClick(pkg)}
                            className="px-2.5 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white text-[10px] font-bold rounded-lg transition"
                          >
                            Ubah
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeletePackageClick(pkg.id)}
                            className="px-2.5 py-1.5 border border-slate-250 text-slate-400 hover:text-red-650 hover:bg-red-50 hover:border-red-500/30 text-[10px] font-bold rounded-lg transition"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MARGIN SETTINGS */}
      {subTab === 'settings' && (
        <div className="space-y-4">
          <div className="card border-[#CBD5E1] bg-white max-w-md">
            <div className="ch bg-[#1E293B]">
              <span>Atur Batas Margin Keuntungan</span>
            </div>
            <form onSubmit={handleSaveSettings} className="cb p-5 space-y-4 text-xs font-semibold text-[#1E293B]">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Target Margin (%) - Kelayakan Otomatis</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={targetMarginInput}
                  onChange={(e) => setTargetMarginInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B] font-bold text-sm"
                />
                <p className="text-[9px] text-[#6E6E85] font-normal leading-normal mt-1">
                  Jika margin proposal di bawah nilai ini, proposal yang dibuat oleh Client akan dialihkan statusnya ke "Menunggu Persetujuan Admin" (Pending Approval).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Batas Bawah Floor Margin (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={floorMarginInput}
                  onChange={(e) => setFloorMarginInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1E293B] font-bold text-sm"
                />
                <p className="text-[9px] text-[#6E6E85] font-normal leading-normal mt-1">
                  Proposal di bawah nilai ini akan dianggap "Tidak Layak" dan diberi tanda bahaya.
                </p>
              </div>

              {settingsMsg && (
                <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                  settingsMsg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {settingsMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full py-2 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-lg text-center transition"
                >
                  {settingsLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
