import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import PackagesPanel from './PackagesPanel';
import SettingsPanel from './SettingsPanel';

export default function Catalog() {
  const {
    catalog,
    fetchCatalog,
    updateCatalogItem,
    createCatalogItem,
    deleteCatalogItem,
    user
  } = useApp();

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

  useEffect(() => {
    fetchCatalog();
  }, []);

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
      setMessage('Catalog item updated successfully.');
      setTimeout(() => {
        setEditingItem(null);
        setMessage('');
      }, 1100);
    } catch (err) {
      setMessage(err.message || 'Failed to update catalog item.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParameter = async (e) => {
    e.preventDefault();
    const finalGroup = newGroupSelect;
    if (!finalGroup) {
      setAddMsg('Category is required.');
      return;
    }
    if (!newItemName.trim()) {
      setAddMsg('Service name is required.');
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
      setAddMsg('New service added to catalog successfully!');
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
      setAddMsg(err.message || 'Failed to add item.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    const name = newCategoryName.trim().toUpperCase();
    if (!name) {
      setCategoryMsg('Category name is required.');
      return;
    }
    if (allCategories.includes(name)) {
      setCategoryMsg('Category is already registered.');
      return;
    }
    setCustomCategories(prev => [...prev, name]);
    setCategoryMsg(`Category "${name}" created! You can now select it for new items.`);
    setNewCategoryName('');
    setTimeout(() => {
      setCategoryMsg('');
      setShowAddCategoryForm(false);
      setNewGroupSelect(name);
      setShowAddForm(true);
    }, 1800);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this parameter permanently from the catalog?')) return;
    try {
      await deleteCatalogItem(itemId);
    } catch (err) {
      alert(err.message || 'Failed to delete parameter.');
    }
  };

  const groupLabels = { HANDLING: 'Handling', MUTHOWIF: 'Muthowif', KATERING: 'Catering', DRIVER: 'Driver Tips', PHOTO: 'Documentation', MEDIS: 'Medical', TAMBAHAN: 'Additional' };
  const groupBadgeColors = (g) => {
    if (g === 'HANDLING') return 'bg-blue-50/80 text-blue-700 border border-blue-200';
    if (g === 'MUTHOWIF') return 'bg-purple-50/80 text-purple-700 border border-purple-200';
    if (g === 'KATERING') return 'bg-amber-50/80 text-amber-750 border border-amber-200';
    if (g === 'DRIVER') return 'bg-emerald-50/80 text-emerald-700 border border-emerald-200';
    return 'bg-slate-100 text-slate-655 border border-slate-200';
  };
  const isEditor = ['superadmin', 'admin', 'inputer'].includes(user?.role);
  const isAdmin = ['superadmin', 'admin'].includes(user?.role);

  return (
    <div className="space-y-4 text-left font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#DBDBDB] pb-3 gap-2">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Price Parameters Catalog</h1>
          <p className="text-[10px] text-[#6E6E85] font-semibold tracking-wider mt-0.5 uppercase">Manage catalog items, travel packages, and default margin rules</p>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setSubTab('catalog')}
          className={`px-4 py-1.5 font-extrabold text-2xs rounded-full transition duration-150 ${
            subTab === 'catalog'
              ? 'bg-navy-main text-white shadow-sm'
              : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200/50'
          }`}
          style={subTab === 'catalog' ? { backgroundColor: 'var(--navy)' } : {}}
        >
          Catalog
        </button>
        <button
          onClick={() => setSubTab('packages')}
          className={`px-4 py-1.5 font-extrabold text-2xs rounded-full transition duration-150 ${
            subTab === 'packages'
              ? 'bg-navy-main text-white shadow-sm'
              : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200/50'
          }`}
          style={subTab === 'packages' ? { backgroundColor: 'var(--navy)' } : {}}
        >
          Packages
        </button>
        {isAdmin && (
          <button
            onClick={() => setSubTab('settings')}
            className={`px-4 py-1.5 font-extrabold text-2xs rounded-full transition duration-150 ${
              subTab === 'settings'
                ? 'bg-navy-main text-white shadow-sm'
                : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200/50'
          }`}
            style={subTab === 'settings' ? { backgroundColor: 'var(--navy)' } : {}}
          >
            Margins
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
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full shadow-3xs transition"
                >
                  {showAddCategoryForm ? 'Close Form' : 'Add New Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setShowAddCategoryForm(false);
                  }}
                  className="px-4 py-2 text-white text-xs font-bold rounded-full shadow-3xs transition"
                  style={{ backgroundColor: 'var(--navy)' }}
                >
                  {showAddForm ? 'Close Form' : 'Add New Item'}
                </button>
              </>
            )}
          </div>

          {/* Add Category Form */}
          {showAddCategoryForm && (
            <div className="card border-[#CBD5E1] bg-white animate-slide-down">
              <div className="ch text-white" style={{ backgroundColor: 'var(--navy)' }}>
                <span>Add New Service Category</span>
              </div>
              <form onSubmit={handleCreateCategorySubmit} className="cb p-5 space-y-4 text-xs font-semibold text-slate-800">
                <div className="space-y-1 max-w-sm">
                  <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., HOTEL, VISA, INSURANCE..."
                    className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main font-bold uppercase"
                  />
                </div>

                {categoryMsg && (
                  <div className={`p-3 rounded-xl text-2xs font-bold text-center ${
                    categoryMsg.includes('created') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {categoryMsg}
                  </div>
                )}

                <div className="flex justify-start gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-full transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white rounded-full shadow transition"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Parameter Form */}
          {showAddForm && (
            <div className="card border-[#CBD5E1] bg-white animate-slide-down">
              <div className="ch text-white" style={{ backgroundColor: 'var(--navy)' }}>
                <span>Add New Service Item</span>
              </div>
              <form onSubmit={handleCreateParameter} className="cb p-5 space-y-4 text-xs font-semibold text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Category (Group)</label>
                    <select
                      value={newGroupSelect}
                      onChange={(e) => setNewGroupSelect(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-350 rounded-full bg-white focus:outline-none focus:border-navy-main cursor-pointer"
                    >
                      {allCategories.map(g => (
                        <option key={g} value={g}>{groupLabels[g] || g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Service / Component Name</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., VIP Travel Insurance"
                      className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Calculation Basis</label>
                    <select
                      value={newBasis}
                      onChange={(e) => setNewBasis(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-355 rounded-full bg-white focus:outline-none focus:border-navy-main cursor-pointer"
                    >
                      <option value="FLAT">FLAT (Per group)</option>
                      <option value="PAX">PAX (Per pilgrim)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Default Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newQtyDef}
                      onChange={(e) => setNewQtyDef(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Package Inclusions Scope</label>
                    <select
                      value={newScope}
                      onChange={(e) => setNewScope(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-350 rounded-full bg-white focus:outline-none focus:border-navy-main cursor-pointer"
                    >
                      <option value="OPTIONAL">Optional Selection</option>
                      <option value="ALL">All Packages (Mandatory)</option>
                      <option value="FULL">Small-Complete &amp; Large Group</option>
                      <option value="ESN">Small-Essential Only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Standard Rate (SAR)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRateStd}
                      onChange={(e) => setNewRateStd(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Maximal Rate (SAR)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRateMax}
                      onChange={(e) => setNewRateMax(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Premium Catering Rate (SAR)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newRatePrem}
                      onChange={(e) => setNewRatePrem(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main"
                    />
                  </div>

                  <div className="flex flex-col justify-center space-y-2 pl-2 text-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsLevelAdjusted}
                        onChange={(e) => setNewIsLevelAdjusted(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-navy-main"
                      />
                      <span>Fee affected by Fee Level?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsCateringTier}
                        onChange={(e) => setNewIsCateringTier(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-navy-main"
                      />
                      <span>Include Catering Tier?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsActiveByDefault}
                        onChange={(e) => setNewIsActiveByDefault(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-navy-main"
                      />
                      <span>Active by Default?</span>
                    </label>
                  </div>
                </div>

                {addMsg && (
                  <div className={`p-3 rounded-xl text-2xs font-bold text-center ${
                    addMsg.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {addMsg}
                  </div>
                )}

                <div className="flex justify-end gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-full transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-5 py-2 text-white rounded-full shadow transition"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    {addLoading ? 'Saving...' : 'Save to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Catalog Parameters List (Desktop Table View) */}
          <div className="hidden md:block card bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-[#6E6E85] font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Service Component</th>
                    <th className="p-3.5 text-center">Basis</th>
                    <th className="p-3.5 text-center">Default Qty</th>
                    <th className="p-3.5 text-right">Standard Rate</th>
                    <th className="p-3.5 text-right">Maximal / Premium Rate</th>
                    <th className="p-3.5 text-center">Default Status</th>
                    <th className="p-3.5 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-750">
                  {catalog.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/20 transition duration-150">
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${groupBadgeColors(item.group_name)}`}>
                          {groupLabels[item.group_name] || item.group_name}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 font-black text-xs">{item.item_name}</td>
                      <td className="p-3.5 text-center text-slate-400 font-extrabold">{item.basis}</td>
                      <td className="p-3.5 text-center font-black">{parseFloat(item.qty_default)}</td>
                      <td className="p-3.5 text-right font-black text-slate-700">
                        {parseFloat(item.rate_standard).toLocaleString('en-US')} SAR
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-700">
                        {item.is_catering_tier 
                          ? parseFloat(item.rate_premium).toLocaleString('en-US') + ' SAR (Prem)'
                          : parseFloat(item.rate_maximal).toLocaleString('en-US') + ' SAR'
                        }
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                          item.is_active_by_default === 1 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {item.is_active_by_default === 1 ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1.5 py-4">
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="px-3 py-1.5 text-white text-[10px] font-extrabold rounded-full transition shadow-3xs cursor-pointer"
                            style={{ backgroundColor: 'var(--navy)' }}
                          >
                            Edit
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1.5 border border-slate-250 text-slate-400 hover:text-red-650 hover:bg-red-50 hover:border-red-500/30 text-[10px] font-extrabold rounded-full transition cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catalog Parameters List (Mobile Card View) */}
          <div className="md:hidden space-y-3.5">
            {catalog.map(item => (
              <div key={item.id} className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_30px_rgba(0,32,194,0.02)] p-5 flex items-center justify-between gap-4 relative text-left">
                <div className="flex items-center gap-4">
                  {/* Category Circle Icon */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs ${
                    item.group_name === 'HANDLING' ? 'bg-blue-50 text-blue-600' :
                    item.group_name === 'MUTHOWIF' ? 'bg-purple-50 text-purple-600' :
                    item.group_name === 'KATERING' ? 'bg-amber-50 text-amber-600' :
                    item.group_name === 'DRIVER' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {item.group_name.slice(0, 2)}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight">{item.item_name}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${groupBadgeColors(item.group_name)}`}>
                        {groupLabels[item.group_name] || item.group_name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {item.basis} &middot; Qty: {parseFloat(item.qty_default)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end justify-between h-full min-w-[120px]">
                  <div>
                    <div className="font-black text-sm text-navy-main leading-none" style={{ color: 'var(--navy)' }}>
                      {parseFloat(item.rate_standard).toLocaleString('en-US')} SAR
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                      Max: {item.is_catering_tier 
                        ? parseFloat(item.rate_premium).toLocaleString('en-US') + ' (Prem)'
                        : parseFloat(item.rate_maximal).toLocaleString('en-US')
                      } SAR
                    </div>
                  </div>
                  
                  {isEditor && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <button
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1 bg-slate-50 hover:bg-navy-main hover:text-white text-[9px] font-extrabold text-slate-600 rounded-full border border-slate-100 transition active:scale-95 cursor-pointer"
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-[9px] font-extrabold text-red-600 rounded-full border border-red-100 transition active:scale-95 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Parameter Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
              <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center text-white" style={{ backgroundColor: 'var(--navy)' }}>
                  <h3 className="font-bold text-xs uppercase tracking-wider">Edit Parameter</h3>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="text-white hover:text-amber-300 text-2xl font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition"
                  >
                    &times;
                  </button>
                </div>
                
                <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs font-semibold text-slate-800 text-left">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Service Component</div>
                    <div className="font-black text-slate-800 text-sm leading-snug">{editingItem.item_name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Calculation Basis</label>
                      <select
                        value={editBasis}
                        onChange={(e) => setEditBasis(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-350 rounded-full bg-white focus:outline-none focus:border-navy-main cursor-pointer"
                      >
                        <option value="FLAT">FLAT (Per group)</option>
                        <option value="PAX">PAX (Per pilgrim)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Package Scope</label>
                      <select
                        value={editScope}
                        onChange={(e) => setEditScope(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-350 rounded-full bg-white focus:outline-none focus:border-navy-main cursor-pointer"
                      >
                        <option value="OPTIONAL">Optional Selection</option>
                        <option value="ALL">All Packages (Mandatory)</option>
                        <option value="FULL">Small-Complete &amp; Large Group</option>
                        <option value="ESN">Small-Essential Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Default Qty</label>
                      <input
                        type="number"
                        step="0.1"
                        value={qtyDef}
                        onChange={(e) => setQtyDef(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-350 rounded-full text-xs font-semibold focus:outline-none focus:border-navy-main"
                      />
                    </div>
                    
                    <div className="space-y-1 flex items-end justify-start pl-2 pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-4.5 h-4.5 text-navy-main rounded border-slate-300"
                        />
                        Active by Default
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Standard Rate (SAR)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={rateStd}
                        onChange={(e) => setRateStd(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-350 rounded-full text-xs font-semibold focus:outline-none focus:border-navy-main"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        {editingItem.is_catering_tier ? 'Premium Rate (SAR)' : 'Maximal Rate (SAR)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingItem.is_catering_tier ? ratePrem : rateMax}
                        onChange={(e) => editingItem.is_catering_tier ? setRatePrem(e.target.value) : setRateMax(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-350 rounded-full text-xs font-semibold focus:outline-none focus:border-navy-main"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsLevelAdjusted}
                        onChange={(e) => setEditIsLevelAdjusted(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-navy-main"
                      />
                      <span>Fee affected by Fee Level?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsCateringTier}
                        onChange={(e) => setEditIsCateringTier(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-navy-main"
                      />
                      <span>Include Catering Tier?</span>
                    </label>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-xl text-2xs font-bold text-center ${
                      message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="pt-2 flex gap-3.5">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="flex-1 py-2.5 border border-slate-300 font-bold rounded-full text-slate-700 text-center hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 text-white font-bold rounded-full text-center transition active:scale-95 cursor-pointer"
                      style={{ backgroundColor: 'var(--navy)' }}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PACKAGES CONFIGURATION PANEL */}
      {subTab === 'packages' && <PackagesPanel />}

      {/* TAB 3: MARGIN SETTINGS PANEL */}
      {subTab === 'settings' && <SettingsPanel />}
      
    </div>
  );
}
