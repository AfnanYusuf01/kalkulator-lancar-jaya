import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, error } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setLocalErr('Username dan password wajib diisi.');
      return;
    }
    setLocalErr('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setLocalErr(err.message || 'Login gagal. Periksa koneksi database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-[#EBF3FF] to-[#F1F6FB] font-sans antialiased">
      
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,102,255,0.06)] border border-[#E2E8F0] p-7 space-y-6 relative overflow-hidden">
        
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0066FF] to-[#0044CC] text-white flex items-center justify-center font-black text-xl shadow-[0_8px_20px_rgba(0,102,255,0.25)]">
            LJ
          </div>
          <h2 className="text-sm font-black text-[#0F172A] tracking-wider uppercase mt-1">Lancar Jaya</h2>
          <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">LA &amp; Handling Services</p>
        </div>

        {/* Form Headline */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold text-[#0F172A]">Masuk ke Akun Anda</h3>
          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Silakan masukkan detail kredensial Anda</p>
        </div>

        {/* Inputs & Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 focus:outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 focus:outline-none transition"
            />
          </div>

          {(localErr || error) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-2xs font-bold rounded-xl text-center">
              {localErr || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0066FF] hover:bg-[#0044CC] text-white font-extrabold rounded-xl text-xs transition duration-150 active:scale-[0.98] shadow-[0_4px_12px_rgba(0,102,255,0.2)]"
          >
            {loading ? 'Masuk...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Accounts list */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-center">Uji Coba Cepat (Demo)</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { r: 'Superadmin', u: 'superadmin', p: 'superadmin123' },
              { r: 'Admin', u: 'admin', p: 'admin123' },
              { r: 'Inputer', u: 'inputer', p: 'inputer123' },
              { r: 'User (Client)', u: 'user', p: 'user123' }
            ].map(d => (
              <button
                key={d.r}
                type="button"
                onClick={() => handleDemoLogin(d.u, d.p)}
                className="p-2.5 border border-slate-100 rounded-xl hover:border-[#0066FF] bg-[#F8FAFC] hover:bg-white text-left transition duration-150 active:scale-[0.97]"
              >
                <div className="font-extrabold text-[#0066FF] text-[10px]">{d.r}</div>
                <div className="text-[8px] text-slate-400 mt-0.5 font-semibold">{d.u} / {d.p.slice(-3)}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
