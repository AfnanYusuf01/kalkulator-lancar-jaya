import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, error } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setLocalErr(err.message || 'Login gagal. Periksa koneksi database Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4 md:p-6 font-sans antialiased">
      
      {/* Login Card Container (Clean Rounded Card Mockup) */}
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-[0_24px_60px_rgba(0,0,0,0.05)] border border-slate-100/80 flex flex-col p-8 space-y-6 relative overflow-hidden">
        
        {/* Top Illustration: Passport & Kaaba */}
        <div className="flex justify-center pt-2">
          <div className="w-36 h-36 flex items-center justify-center">
            <img 
              src="/passport.png" 
              alt="Passport and Kaaba Illustration" 
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
            />
          </div>
        </div>

        {/* App Branding Info */}
        <div className="text-center -mt-3 space-y-0.5">
          <h1 className="text-base font-black text-[#2563EB] tracking-wider uppercase">Lancar Jaya</h1>
          <p className="text-[8px] font-extrabold text-slate-400 tracking-widest uppercase">LA &amp; Handling Services</p>
        </div>

        {/* Left-Aligned Login Header */}
        <div className="text-left space-y-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Login</h2>
          <p className="text-xs text-slate-400 font-semibold">Please Login to continue.</p>
        </div>

        {/* Inputs & Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input Field with User Icon */}
          <div className="relative text-left">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Username Anda"
              className="w-full pl-11 pr-5 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-full text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 focus:outline-none transition duration-150"
            />
          </div>

          {/* Password Input Field with Lock Icon & Visibility Toggle */}
          <div className="relative text-left">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Kata Sandi Anda"
              className="w-full pl-11 pr-11 py-3.5 bg-[#F8FAFC] border border-slate-100 rounded-full text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 focus:outline-none transition duration-150"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
            >
              {showPassword ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>


          {/* Forgot Password Link */}
          <div className="text-right pr-2">
            <a 
              href="#forgot" 
              onClick={(e) => { e.preventDefault(); alert("Silakan hubungi administrator IT untuk mereset kata sandi Anda."); }}
              className="text-[10px] text-slate-400 hover:text-[#3B82F6] font-bold"
            >
              Forgot Password?
            </a>
          </div>

          {/* Error Notification Alert */}
          {(localErr || error) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-2xs font-bold rounded-full text-center animate-pulse">
              {localErr || error}
            </div>
          )}

          {/* Log In Capsule Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold rounded-full text-xs shadow-md transition duration-150 active:scale-[0.98] cursor-pointer uppercase tracking-wider hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-150 w-full"></div>
          <span className="absolute bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">atau</span>
        </div>

        {/* Quick Demo Access Buttons Grid */}
        <div className="space-y-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Quick Demo Access</div>
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
                className="p-2.5 border border-slate-100 rounded-2xl hover:border-[#3B82F6] bg-[#F8FAFC] hover:bg-white text-left transition duration-150 active:scale-[0.97] cursor-pointer"
              >
                <div className="font-extrabold text-[#3B82F6] text-[9.5px] leading-tight">{d.r}</div>
                <div className="text-[8px] text-slate-400 mt-0.5 font-semibold">{d.u} / {d.p.slice(-3)}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
