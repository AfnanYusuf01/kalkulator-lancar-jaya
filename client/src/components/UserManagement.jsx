import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function UserManagement() {
  const { token } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formMsg, setFormMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setFormMsg('Username and password are required.');
      return;
    }
    setFormLoading(true);
    setFormMsg('');

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormMsg('New user registered successfully!');
      setUsername('');
      setPassword('');
      setRole('user');
      fetchUsers();
      setTimeout(() => setFormMsg(''), 1500);
    } catch (err) {
      setFormMsg(err.message || 'Failed to create user account.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account permanently?')) return;
    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user account.');
    }
  };

  // Modern role-based gradients for avatars
  const getRoleGradient = (r) => {
    if (r === 'superadmin') return 'from-purple-500 to-indigo-700';
    if (r === 'admin') return 'from-blue-500 to-sky-600';
    if (r === 'inputer') return 'from-amber-500 to-orange-600';
    return 'from-teal-400 to-emerald-600';
  };

  const getRoleBadgeColor = (r) => {
    if (r === 'superadmin') return 'bg-purple-50 text-purple-700 border border-purple-200/50';
    if (r === 'admin') return 'bg-blue-50 text-blue-700 border border-blue-200/50';
    if (r === 'inputer') return 'bg-amber-50 text-amber-700 border border-amber-200/50';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left font-sans pb-8">
      
      {/* Register User Card */}
      <div className="card bg-white shadow-[0_16px_40px_rgba(0,0,0,0.02)] border border-slate-100/80 rounded-[32px] overflow-hidden">
        <div className="ch border-b border-slate-100/50 bg-[#FAFAFC] px-6 py-4.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5" style={{ color: 'var(--navy)' }}>
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6 6 0 0110.95-3.585" />
            </svg>
          </div>
          <span>Register New Account</span>
        </div>
        <div className="cb p-6">
          <form onSubmit={handleCreateUser} className="space-y-5 text-xs font-semibold text-slate-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:border-navy-main focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:border-navy-main focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block">Access Control (Role)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-full bg-white text-xs font-semibold focus:outline-none focus:border-navy-main focus:ring-1 focus:ring-blue-500 cursor-pointer transition duration-150 shadow-2xs"
                >
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                  <option value="inputer">Inputer</option>
                  <option value="user">User (Client)</option>
                </select>
              </div>
            </div>

            {formMsg && (
              <div className={`p-3 rounded-xl text-2xs font-bold text-center ${
                formMsg.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {formMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full text-white font-extrabold uppercase tracking-wider py-3.5 rounded-full text-xs shadow-md bg-[#2563EB] hover:bg-[#1D4ED8] transition duration-150 active:scale-98 cursor-pointer hover:shadow-lg disabled:opacity-50 mt-3"
            >
              {formLoading ? 'Registering...' : 'Register Account'}
            </button>
          </form>
        </div>

      </div>

      {/* Users Directory List */}
      <div className="lg:col-span-2 card bg-white shadow-[0_16px_40px_rgba(0,0,0,0.02)] border border-slate-100/80 rounded-[32px] overflow-hidden">
        <div className="ch border-b border-slate-100/50 bg-[#FAFAFC] px-6 py-4.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--navy)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0112.75 21.5h-1.5a2.25 2.25 0 01-2.25-2.263V19.13m4.13-3.07c-.6.215-1.24.328-1.9.328-1.926 0-3.73-.553-5.25-1.508m7.15-4.19A4.5 4.5 0 111.5 9.75a4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <span>Registered User Directory</span>
          </div>
          {users.length > 0 && (
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase">
              {users.length} Accounts
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-7 h-7 border-4 border-navy-main border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-650 font-bold">{error}</div>
        ) : (
          /* Premium Account Card Directory - Unified for Mobile and Desktop */
          <div className="p-6 bg-slate-50/40 min-h-[350px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(u => {
                const isSuper = u.username === 'superadmin';
                return (
                  <div 
                    key={u.id} 
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] p-4 flex items-center justify-between gap-4 text-left hover:border-blue-200 hover:-translate-y-0.5 transition duration-150"
                  >
                    <div className="flex items-center gap-3">
                      {/* Vibrant role gradient avatar with active pulse indicator dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getRoleGradient(u.role)} text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-sm`}>
                          {u.username.substring(0, 2)}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-emerald-500 animate-pulse"></span>
                      </div>
                      
                      <div>
                        <div className="font-extrabold text-sm text-slate-800 leading-tight block">{u.username}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] font-black text-slate-400">ID: #{u.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider ${getRoleBadgeColor(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Action Buttons (Delete or Protected Lock) */}
                    <div>
                      {isSuper ? (
                        <div 
                          className="w-8.5 h-8.5 rounded-full bg-slate-50 text-slate-450 border border-slate-100 flex items-center justify-center shadow-3xs cursor-not-allowed"
                          title="System Protected Admin"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="w-8.5 h-8.5 rounded-full bg-red-50 hover:bg-red-100 text-red-650 border border-red-100/50 flex items-center justify-center shadow-3xs transition duration-150 active:scale-95 cursor-pointer"
                          title="Delete Account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

