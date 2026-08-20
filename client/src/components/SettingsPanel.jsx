import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function SettingsPanel() {
  const { settings, fetchSettings, updateSettings } = useApp();
  const [targetMarginInput, setTargetMarginInput] = useState('');
  const [floorMarginInput, setFloorMarginInput] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
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
      setSettingsMsg('Margin settings saved successfully!');
      setTimeout(() => setSettingsMsg(''), 2000);
    } catch (err) {
      setSettingsMsg(err.message || 'Failed to save settings.');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="card border-[#CBD5E1] bg-white max-w-md text-left font-sans">
      <div className="ch text-white" style={{ backgroundColor: 'var(--navy)' }}>
        <span>Configure Profit Margin Limits</span>
      </div>
      <form onSubmit={handleSaveSettings} className="cb p-5 space-y-4 text-xs font-semibold text-slate-800">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Target Margin (%) - Auto-Eligibility Threshold</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={targetMarginInput}
            onChange={(e) => setTargetMarginInput(e.target.value)}
            className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main font-bold text-sm"
          />
          <p className="text-[9px] text-[#6E6E85] font-normal leading-normal mt-1">
            Proposals with margins below this rate will require admin approval and status will be set to PENDING_APPROVAL.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-[#6E6E85] uppercase tracking-wider block">Floor Margin (%) - Minimum Floor Limit</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={floorMarginInput}
            onChange={(e) => setFloorMarginInput(e.target.value)}
            className="w-full px-4 py-2 border border-slate-350 rounded-full focus:outline-none focus:border-navy-main font-bold text-sm"
          />
          <p className="text-[9px] text-[#6E6E85] font-normal leading-normal mt-1">
            Proposals with margins below this rate are considered unviable and highlighted as critical errors.
          </p>
        </div>

        {settingsMsg && (
          <div className={`p-3 rounded-xl text-2xs font-bold text-center ${
            settingsMsg.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {settingsMsg}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={settingsLoading}
            className="w-full py-2.5 text-white font-bold rounded-full text-center transition active:scale-95 cursor-pointer shadow-3xs"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            {settingsLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
