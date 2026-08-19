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
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar pengguna.');
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
      setFormMsg('Username dan password wajib diisi.');
      return;
    }
    setFormLoading(true);
    setFormMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormMsg('Pengguna baru berhasil ditambahkan!');
      setUsername('');
      setPassword('');
      setRole('user');
      fetchUsers();
      setTimeout(() => setFormMsg(''), 1500);
    } catch (err) {
      setFormMsg(err.message || 'Gagal menambahkan pengguna.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun ini secara permanen?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengguna.');
    }
  };

  const getRoleBadgeColor = (r) => {
    if (r === 'superadmin') return 'bg-purple-50 text-purple-655 border border-purple-200';
    if (r === 'admin') return 'bg-blue-55 text-blue-700 border border-blue-200';
    if (r === 'inputer') return 'bg-amber-50 text-amber-700 border border-amber-250';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      
      {/* Create User Form */}
      <div className="card">
        <div className="ch">
          <span>Tambah Pengguna</span>
        </div>
        <div className="cb">
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username baru..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#000066]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password baru..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#000066]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6E6E85] uppercase tracking-wider block">Hak Akses (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold focus:outline-none focus:border-[#000066] cursor-pointer"
              >
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="inputer">Inputer</option>
                <option value="user">User (Client)</option>
              </select>
            </div>

            {formMsg && (
              <div className={`p-3 rounded-lg text-2xs font-bold text-center ${
                formMsg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {formMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-[#000066] hover:bg-[#23237A] text-white font-bold py-2.5 rounded-lg text-xs shadow transition duration-150"
            >
              {formLoading ? 'Mendaftarkan...' : 'Daftarkan Akun'}
            </button>
          </form>
        </div>
      </div>

      {/* Users List Table */}
      <div className="lg:col-span-2 card">
        <div className="ch">
          <span>Daftar Akun Pengguna</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-4 border-[#000066] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-650 font-bold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-[#6E6E85] font-semibold uppercase tracking-wider text-[10px] border-b border-[#DBDBDB]">
                  <th className="p-3.5">ID Akun</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5 text-center">Hak Akses (Role)</th>
                  <th className="p-3.5 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/20 transition duration-150">
                    <td className="p-3.5 text-slate-400 font-bold">#{u.id}</td>
                    <td className="p-3.5 font-bold text-[#000066]">{u.username}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.username === 'superadmin'}
                        className="px-2 py-1 border border-slate-200 hover:border-red-500/50 hover:bg-red-55/40 hover:text-red-650 text-slate-400 text-[10px] font-bold rounded transition disabled:opacity-40"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
