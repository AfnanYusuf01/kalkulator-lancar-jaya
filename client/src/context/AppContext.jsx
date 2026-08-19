import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [catalog, setCatalog] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ min_margin: 20, floor_margin: 12.5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set Auth headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Restore session
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  // Login
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);
    setCatalog([]);
    setProposals([]);
    setPackages([]);
    setSettings({ min_margin: 20, floor_margin: 12.5 });
    setUsers([]);
  };

  // Fetch Catalog
  const fetchCatalog = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/catalog`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setCatalog(data);
      }
    } catch (err) {
      console.error('Fetch catalog error:', err);
    }
  };

  // Update Catalog Item
  const updateCatalogItem = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/catalog/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Update local state
      setCatalog(prev => prev.map(item => item.id === parseInt(id) ? { ...item, ...updatedData } : item));
      return data;
    } catch (err) {
      console.error('Update catalog error:', err);
      throw err;
    }
  };

  // Create Catalog Item
  const createCatalogItem = async (itemData) => {
    try {
      const response = await fetch(`${API_BASE}/catalog`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      await fetchCatalog();
      return data;
    } catch (err) {
      console.error('Create catalog error:', err);
      throw err;
    }
  };

  // Delete Catalog Item
  const deleteCatalogItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/catalog/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setCatalog(prev => prev.filter(item => item.id !== parseInt(id)));
      return data;
    } catch (err) {
      console.error('Delete catalog error:', err);
      throw err;
    }
  };

  // Fetch Packages
  const fetchPackages = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/packages`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setPackages(data);
      }
    } catch (err) {
      console.error('Fetch packages error:', err);
    }
  };

  // Save Package (Create / Update)
  const savePackage = async (packageData) => {
    const isEdit = !!packageData.id;
    const url = isEdit ? `${API_BASE}/packages/${packageData.id}` : `${API_BASE}/packages`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(packageData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await fetchPackages();
      return data;
    } catch (err) {
      console.error('Save package error:', err);
      throw err;
    }
  };

  // Delete Package
  const deletePackage = async (packageId) => {
    try {
      const response = await fetch(`${API_BASE}/packages/${packageId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPackages(prev => prev.filter(p => p.id !== parseInt(packageId)));
      return data;
    } catch (err) {
      console.error('Delete package error:', err);
      throw err;
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  // Update Settings
  const updateSettings = async (settingsData) => {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingsData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await fetchSettings();
      return data;
    } catch (err) {
      console.error('Update settings error:', err);
      throw err;
    }
  };

  // Update Proposal Status (Approve/Reject)
  const updateProposalStatus = async (proposalId, status) => {
    try {
      const response = await fetch(`${API_BASE}/proposals/${proposalId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await fetchProposals();
      return data;
    } catch (err) {
      console.error('Update proposal status error:', err);
      throw err;
    }
  };

  // Fetch Proposals
  const fetchProposals = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/proposals`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setProposals(data);
      }
    } catch (err) {
      console.error('Fetch proposals error:', err);
    }
  };

  // Save Proposal
  const saveProposal = async (proposalData) => {
    try {
      const response = await fetch(`${API_BASE}/proposals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(proposalData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Refresh list
      fetchProposals();
      return data;
    } catch (err) {
      console.error('Save proposal error:', err);
      throw err;
    }
  };

  // Fetch Users (Superadmin only)
  const fetchUsers = async () => {
    if (!token || user?.role !== 'superadmin') return;
    try {
      const response = await fetch(`${API_BASE}/auth/users`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  // Create User
  const createUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      fetchUsers();
      return data;
    } catch (err) {
      console.error('Create user error:', err);
      throw err;
    }
  };

  // Update User
  const updateUser = async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      fetchUsers();
      return data;
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/auth/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      fetchUsers();
      return data;
    } catch (err) {
      console.error('Delete user error:', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      token,
      user,
      catalog,
      proposals,
      users,
      loading,
      error,
      login,
      logout,
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
      updateProposalStatus,
      fetchProposals,
      saveProposal,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
