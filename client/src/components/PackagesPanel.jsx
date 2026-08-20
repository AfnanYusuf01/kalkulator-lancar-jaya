import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function PackagesPanel() {
  const {
    catalog,
    fetchCatalog,
    packages,
    fetchPackages,
    savePackage,
    deletePackage,
    user
  } = useApp();

  const [showAddPkgForm, setShowAddPkgForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageCode, setPackageCode] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [selectedCatalogIds, setSelectedCatalogIds] = useState([]);
  const [pkgMessage, setPkgMessage] = useState('');
  const [pkgLoading, setPkgLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
    fetchPackages();
  }, []);

  const handleSavePackageSubmit = async (e) => {
    e.preventDefault();
    if (!packageName.trim() || (!editingPackage && !packageCode.trim())) {
      setPkgMessage('Package code and name are required.');
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
      setPkgMessage(editingPackage ? 'Package updated successfully!' : 'New package created successfully!');
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
      setPkgMessage(err.message || 'Failed to save package.');
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
    if (!window.confirm('Are you sure you want to delete this package permanently?')) return;
    try {
      await deletePackage(pkgId);
    } catch (err) {
      alert(err.message || 'Failed to delete package.');
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
    KATERING: 'Catering',
    DRIVER: 'Driver Tips',
    PHOTO: 'Documentation',
    MEDIS: 'Medical',
    TAMBAHAN: 'Additional'
  };

  const groupBadgeColors = (group) => {
    if (group === 'HANDLING') return 'bg-blue-50/80 text-blue-700 border border-blue-200';
    if (group === 'MUTHOWIF') return 'bg-purple-50/80 text-purple-700 border border-purple-200';
    if (group === 'KATERING') return 'bg-amber-50/80 text-amber-750 border border-amber-200';
    if (group === 'DRIVER') return 'bg-emerald-50/80 text-emerald-700 border border-emerald-200';
    return 'bg-slate-100 text-slate-655 border border-slate-200';
  };

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
    <div className="space-y-4 text-left font-sans">
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
            className="px-4 py-2 text-white text-xs font-bold rounded-full shadow-3xs transition cursor-pointer"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            {showAddPkgForm ? 'Close Form' : 'Create New Package'}
          </button>
        )}
      </div>

      {showAddPkgForm && (
        <div className="card border-[#CBD5E1] bg-white animate-slide-down">
          <div className="ch text-white font-bold" style={{ backgroundColor: 'var(--navy)' }}>
            <span>{editingPackage ? `Edit Travel Package: ${editingPackage.package_name}` : 'Create New Travel Package'}</span>
          </div>
          <form onSubmit={handleSavePackageSubmit} className="cb p-5 space-y-4 text-xs font-semibold text-slate-800">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Package Code (Unique ID)</label>
                <input
                  type="text"
                  disabled={!!editingPackage}
                  value={packageCode}
                  onChange={(e) => setPackageCode(e.target.value)}
                  placeholder="e.g., EXECUTIVE / STAR_3"
                  className="w-full px-4 py-2 border border-slate-355 rounded-full focus:outline-none focus:border-navy-main disabled:bg-slate-50 disabled:text-slate-450 font-black uppercase"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Package Name</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., Small Group — Executive"
                  className="w-full px-4 py-2 border border-slate-355 rounded-full focus:outline-none focus:border-navy-main font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Package Description</label>
              <textarea
                value={packageDesc}
                onChange={(e) => setPackageDesc(e.target.value)}
                placeholder="Write service inclusions or group size criteria for this package..."
                className="w-full px-4 py-3 border border-slate-355 rounded-2xl focus:outline-none focus:border-navy-main font-semibold text-xs h-16 resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block border-b border-slate-100 pb-1">
                Select Included Services for the Package
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(catalogByCategory).map(([group, items]) => (
                  <div key={group} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/20">
                    <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 text-slate-800 font-bold text-[9px] uppercase tracking-wider">
                      {groupLabels[group] || group}
                    </div>
                    <div className="p-3.5 space-y-2.5">
                      {items.map(item => {
                        const isChecked = selectedCatalogIds.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-start gap-2.5 cursor-pointer text-slate-700 hover:text-navy-main transition select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCatalogId(item.id)}
                              className="w-4 h-4 rounded border-slate-350 text-navy-main mt-0.5 cursor-pointer"
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
              <div className={`p-3 rounded-xl text-2xs font-bold text-center ${
                pkgMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {pkgMessage}
              </div>
            )}

            <div className="flex justify-end gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPkgForm(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pkgLoading}
                className="px-5 py-2 text-white rounded-full shadow transition"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                {pkgLoading ? 'Saving...' : 'Save Package'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block card bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-[#6E6E85] font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                <th className="p-3.5 w-24">Package Code</th>
                <th className="p-3.5 w-52">Package Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-center w-28">Included Services</th>
                <th className="p-3.5 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-slate-50/20 transition duration-150">
                  <td className="p-3.5 font-black text-navy-main uppercase" style={{ color: 'var(--navy)' }}>{pkg.package_code}</td>
                  <td className="p-3.5 font-bold text-slate-800">{pkg.package_name}</td>
                  <td className="p-3.5 text-slate-500 font-normal leading-relaxed">{pkg.description || 'No description.'}</td>
                  <td className="p-3.5 text-center font-bold">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-655 border border-slate-200">
                      {pkg.catalog_ids ? pkg.catalog_ids.length : 0} Services
                    </span>
                  </td>
                  <td className="p-3.5 text-center flex items-center justify-center gap-1.5 py-4">
                    {isEditor && (
                      <button
                        type="button"
                        onClick={() => handleEditPackageClick(pkg)}
                        className="px-3 py-1.5 text-white text-[10px] font-extrabold rounded-full transition shadow-3xs cursor-pointer"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeletePackageClick(pkg.id)}
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

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3.5">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_30px_rgba(0,32,194,0.02)] p-5 space-y-4 text-left">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: 'var(--navy)' }}>
                  {pkg.package_code}
                </span>
                <h4 className="font-extrabold text-sm text-slate-800 mt-0.5">{pkg.package_name}</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                {pkg.catalog_ids ? pkg.catalog_ids.length : 0} Services
              </span>
            </div>
            
            <p className="text-2xs text-slate-500 font-medium leading-relaxed">
              {pkg.description || 'No description provided.'}
            </p>
            
            {isEditor && (
              <div className="flex items-center gap-1.5 border-t border-slate-100/60 pt-3">
                <button
                  type="button"
                  onClick={() => handleEditPackageClick(pkg)}
                  className="px-3.5 py-1.5 text-white text-[10px] font-extrabold rounded-full transition shadow-3xs cursor-pointer active:scale-95"
                  style={{ backgroundColor: 'var(--navy)' }}
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeletePackageClick(pkg.id)}
                    className="px-3.5 py-1.5 border border-slate-250 text-slate-400 hover:text-red-650 hover:bg-red-55/40 text-[10px] font-extrabold rounded-full transition active:scale-95 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
