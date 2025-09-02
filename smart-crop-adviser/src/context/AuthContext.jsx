'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- bootstrap auth state from localStorage (no refresh required)
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
      }
    } catch {}
    setLoading(false);
  }, []);

  // handy helper
  const saveAuth = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);                  // this is the key so the UI updates immediately
    window.dispatchEvent(new Event('auth:changed')); // notify any listeners if needed
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text || 'Unexpected server response');
      }

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Invalid credentials');
      }

      const token   = data.token || `auth_token_${Date.now()}`;
      const userDTO = data.data;

      saveAuth(token, userDTO);
      setLoading(false);
      return { ok: true, user: userDTO };
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
      setLoading(false);
      return { ok: false, error: e.message || 'Login failed' };
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text || 'Unexpected server response');
      }

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Registration failed');
      }

      const token   = data.token || `auth_token_${Date.now()}`;
      const userDTO = data.data;

      saveAuth(token, userDTO);
      setLoading(false);
      return { ok: true, user: userDTO };
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
      setLoading(false);
      return { ok: false, error: e.message || 'Registration failed' };
    }
  };

  const updateUser = async (userData) => {
    if (!user?.id) return false;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(userData)
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text || 'Unexpected server response');
      }

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Update failed');
      }

      const updated = { ...user, ...data.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setLoading(false);
      return true;
    } catch (e) {
      setError(e.message || 'Update failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Use this everywhere that wants user predictions; normalizes adviser fields.
  const getUserPredictions = async (userId) => {
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      // Use the user-specific endpoint to avoid extra filtering and to get richer data
      const res = await fetch(`${API_URL}/api/v1/predictions/user/${userId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text || 'Unexpected server response');
      }

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to fetch predictions');
      }

      const list = Array.isArray(data.data) ? data.data : [];
      // normalize adviser name (covers several backend shapes)
      return list.map((p) => ({
        ...p,
        adviser_name:
          p.adviser_name ||
          p.advisor_name ||
          p.agent_name ||
          p?.adviser?.name ||
          p?.advisor?.name ||
          p?.agent?.name ||
          null
      }));
    } catch (e) {
      setError(e.message || 'Failed to fetch predictions.');
      return [];
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    window.dispatchEvent(new Event('auth:changed'));
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    setError,
    login,
    register,
    updateUser,
    getUserPredictions,
    logout,
    isAuthenticated: () => !!user,
    getUserRole: () => user?.userlevel ?? null
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
