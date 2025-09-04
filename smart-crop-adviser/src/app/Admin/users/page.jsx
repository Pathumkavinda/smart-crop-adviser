'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Plus, Edit, Trash2, X, Check, AlertTriangle,
  ChevronLeft, ChevronRight, RefreshCw, Loader2, Eye, ArrowUpDown, UserCircle
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ------- Component Structure -------
export default function AdminUsers() {
  const router = useRouter();
  
  // Core state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const { theme } = useTheme();

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    userLevel: '',
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  
  // UI state
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [modal, setModal] = useState({ type: null, data: null, isOpen: false });
  const [formState, setFormState] = useState({
    data: initialFormData(),
    errors: {},
    isSubmitting: false
  });

  // Refs
  const didInitRef = useRef(false);
  const searchTimerRef = useRef(null);

  // ------- Data Fetching -------
  const fetchUsers = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    try {
      if (!silent) setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const effectiveLimit = 1000; // Get all users for client-side search and filtering

      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', String(effectiveLimit));
      params.set('sort', `${sortField}:${sortDirection}`);

      const res = await fetch(`${API_URL}/api/v1/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || `Failed to fetch users (${res.status})`);
      }

      const json = await res.json();
      const serverRows = Array.isArray(json?.data) ? json.data : [];
      
      // Apply client-side filtering for search and userLevel
      let filtered = [...serverRows];
      
      if (filters.search) {
        const searchTerm = filters.search.trim().toLowerCase();
        filtered = filtered.filter(user => 
          (user.username || '').toLowerCase().includes(searchTerm) || 
          (user.email || '').toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.userLevel) {
        filtered = filtered.filter(user => 
          (user.userlevel || '').toLowerCase() === filters.userLevel.toLowerCase()
        );
      }

      // Sort
      filtered.sort((a, b) => {
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (typeof aValue === 'string' || typeof bValue === 'string') {
          return String(aValue).localeCompare(String(bValue)) * direction;
        }
        return (aValue - bValue) * direction;
      });

      const total = filtered.length;
      
      // Pagination
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit;
      const pageRows = filtered.slice(start, end);

      setUsers(pageRows);
      setTotal(total);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load users');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, sortField, sortDirection, router]);

  // Initial and dependency-driven fetch
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      fetchUsers();
      return;
    }
    
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchUsers({ silent: false });
    }, 300);
    
    return () => clearTimeout(searchTimerRef.current);
  }, [filters, sortField, sortDirection, fetchUsers]);

  // Clear notifications automatically
  useEffect(() => {
    if (!notification.message) return;
    const timer = setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  // ------- Event Handlers -------
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key !== 'page') newFilters.page = 1;
      return newFilters;
    });
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map(user => user.id));
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      userLevel: '',
      page: 1,
      limit: filters.limit,
    });
  };

  const openModal = (type, data = null) => {
    if (type === 'add') {
      setFormState({
        data: initialFormData(),
        errors: {},
        isSubmitting: false
      });
    } else if (type === 'edit' && data) {
      setFormState({
        data: {
          username: data.username || '',
          email: data.email || '',
          userlevel: data.userlevel || '',
          password: '',
          address: data.address || '',
          landsize: data.landsize ?? ''
        },
        errors: {},
        isSubmitting: false
      });
    }
    setModal({ type, data, isOpen: true });
  };

  const closeModal = () => {
    setModal({ type: null, data: null, isOpen: false });
  };

  // ------- Form Handling -------
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value },
      errors: { ...prev.errors, [name]: '' }
    }));
  };

  const validateForm = () => {
    const errors = {};
    const { data } = formState;
    
    if (!data.username.trim()) errors.username = 'Username is required';
    if (!data.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email is invalid';


    if (modal.type === 'add' && !data.password.trim()) {
      errors.password = 'Password is required for new users';
    } else if (data.password && data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!data.userlevel) errors.userlevel = 'User level is required';

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

const handleSubmitUser = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  if (!validateForm()) return;

    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      const token = localStorage.getItem('token');
      const isEdit = modal.type === 'edit';
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit
        ? `${API_URL}/api/v1/users/${modal.data.id}`
        : `${API_URL}/api/v1/users`;

      const payload = { ...formState.data };
      
      if (typeof payload.username === 'string') payload.username = payload.username.trim();
      if (typeof payload.email === 'string') payload.email = payload.email.trim();
      if (typeof payload.address === 'string') payload.address = payload.address.trim();
      if (!payload.password) delete payload.password;
      
      if (payload.landsize === '' || payload.landsize === undefined) {
        delete payload.landsize;
      } else {
        const parsed = parseFloat(payload.landsize);
        if (Number.isFinite(parsed)) payload.landsize = parsed; 
        else delete payload.landsize;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }

      setNotification({ 
        type: 'success', 
        message: `User ${isEdit ? 'updated' : 'created'} successfully` 
      });
      closeModal();
      
      if (!isEdit) handleFilterChange('page', 1);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: err.message });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteUser = async () => {
    if (!modal.data) return;
    
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/users/${modal.data.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || `Failed to delete user`);
      }

      setNotification({ 
        type: 'success', 
        message: `User "${modal.data.username}" deleted successfully` 
      });
      
      closeModal();
      
      const remainingOnPage = users.length - 1;
      if (remainingOnPage <= 0 && filters.page > 1) {
        handleFilterChange('page', filters.page - 1);
      } else {
        fetchUsers();
      }
      
      if (selectedRows.includes(modal.data.id)) {
        setSelectedRows(prev => prev.filter(id => id !== modal.data.id));
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: err.message });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // ------- UI Helper Functions -------
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / filters.limit)), [total, filters.limit]);
  const canGoPrev = filters.page > 1;
  const canGoNext = filters.page < pageCount;
  
  return (
    <AdminLayout>
      <div className="min-h-screen" 
           style={{ 
             backgroundColor: theme.colors.background,
             color: theme.colors.text
           }}>
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
          <Header 
            onAddUser={() => openModal('add')}
            loading={loading}
            selectedCount={selectedRows.length}
          />
          
          {notification.message && (
            <Notification 
              type={notification.type} 
              message={notification.message} 
              onClose={() => setNotification({ type: '', message: '' })}
            />
          )}
          
          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
          
          {loading && users.length === 0 ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={() => fetchUsers()} />
          ) : users.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/20 shadow-2xl overflow-hidden">
                <UsersTable 
                  users={users}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  selectedRows={selectedRows}
                  onSelectRow={handleSelectRow}
                  onSelectAll={handleSelectAll}
                  onSort={handleSort}
                  onEdit={(user) => openModal('edit', user)}
                  onDelete={(user) => setModal({ type: 'delete', data: user, isOpen: true })}
                  onViewDetails={(user) => openModal('view', user)}
                />
                
                {pageCount > 1 && (
                  <Pagination 
                    page={filters.page}
                    pageCount={pageCount}
                    total={total}
                    limit={filters.limit}
                    onPageChange={(page) => handleFilterChange('page', page)}
                    onLimitChange={(limit) => handleFilterChange('limit', limit)}
                    canGoPrev={canGoPrev}
                    canGoNext={canGoNext}
                  />
                )}
              </div>
            </>
          )}
          
          {modal.isOpen && (
            modal.type === 'delete' ? (
              <DeleteModal 
                user={modal.data}
                onClose={closeModal}
                onConfirm={handleDeleteUser}
                isDeleting={formState.isSubmitting}
              />
            ) : modal.type === 'view' ? (
              <ViewUserModal
                user={modal.data}
                onClose={closeModal}
              />
            ) : (
              <UserFormModal
                type={modal.type}
                user={modal.data}
                formData={formState.data}
                errors={formState.errors}
                isSubmitting={formState.isSubmitting}
                onChange={handleFormChange}
                onSubmit={handleSubmitUser}
                onClose={closeModal}
              />
            )
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ------- Helper Components -------

function Header({ onAddUser, loading, selectedCount }) {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
          User Management
        </h1>
        <p style={{ color: theme.colors.text }}>View and manage all system users</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {selectedCount > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: theme.colors.primary + '22', 
                  color: theme.colors.primary 
                }}>
            {selectedCount} selected
          </span>
        )}
        
        <button
          onClick={onAddUser}
          disabled={loading}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all duration-200 shadow-lg"
          style={{ 
            backgroundColor: loading ? theme.colors.primary + '88' : theme.colors.primary,
            boxShadow: '0 6px 20px rgba(34,197,94,0.35)',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <Plus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>
    </div>
  );
}

function Notification({ type, message, onClose }) {
  const bgColor = type === 'success' 
    ? 'bg-green-50/90 border-green-200 dark:bg-green-900/30 dark:border-green-700/30' 
    : 'bg-red-50/90 border-red-200 dark:bg-red-900/30 dark:border-red-700/30';
  
  const textColor = type === 'success' 
    ? 'text-green-800 dark:text-green-200' 
    : 'text-red-800 dark:text-red-200';
  
  const icon = type === 'success' 
    ? <Check className="w-5 h-5" /> 
    : <AlertTriangle className="w-5 h-5" />;
  
  return (
    <div
      role="alert"
      className={`mb-6 p-4 rounded-xl backdrop-blur-sm flex items-center justify-between ${bgColor} shadow-xl border`}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${textColor}`}>{icon}</span>
        <p className={textColor}>{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function FilterBar({ filters, onFilterChange, onResetFilters }) {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-slate-700/20 shadow-2xl mb-6 overflow-hidden">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label htmlFor="search" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by username or email"
                className="pl-10 pr-4 py-2 border rounded-lg w-full
                           bg-white text-gray-900 placeholder-gray-400
                           border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500
                           shadow-inner"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="userLevel" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">User Level</label>
            <select
              id="userLevel"
              className="border rounded-lg w-full p-2
                         bg-white text-gray-900
                         border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500
                         shadow-inner"
              value={filters.userLevel}
              onChange={(e) => onFilterChange('userLevel', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="admin">Admin</option>
              <option value="advisor">Advisor</option>
              <option value="researcher">Researcher</option>
              <option value="farmer">Farmer</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div className="md:col-span-4 flex items-end space-x-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTable({ 
  users, 
  sortField, 
  sortDirection, 
  selectedRows, 
  onSelectRow, 
  onSelectAll, 
  onSort,
  onEdit,
  onDelete,
  onViewDetails
}) {
  const getSortIcon = (field) => {
    if (field !== sortField) return <ArrowUpDown size={16} className="ml-2 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown size={16} className="ml-2 text-green-600" /> 
      : <ArrowUpDown size={16} className="ml-2 text-green-600 transform rotate-180" />;
  };
  
  const renderSortableHeader = (field, label) => (
    <button 
      className="flex items-center font-medium text-left focus:outline-none"
      onClick={() => onSort(field)}
    >
      {label}
      {getSortIcon(field)}
    </button>
  );
  
  return (
    <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50/90 dark:bg-slate-700/70 backdrop-blur-sm sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 w-12">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={users.length > 0 && selectedRows.length === users.length}
                  onChange={onSelectAll}
                />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {renderSortableHeader('id', 'ID')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {renderSortableHeader('username', 'User')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {renderSortableHeader('email', 'Email')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {renderSortableHeader('userlevel', 'Role')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {renderSortableHeader('created_at', 'Created')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr 
              key={user.id} 
              className={`hover:bg-green-50/70 dark:hover:bg-slate-700/70 transition-colors ${
                selectedRows.includes(user.id) 
                ? 'bg-green-50/70 dark:bg-green-900/30' 
                : ''
              }`}
            >
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => onSelectRow(user.id)}
                />
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                #{user.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow"
                       style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                    {user.username?.charAt(0)?.toUpperCase() || <UserCircle size={18} />}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                    {user.landsize != null && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Land: {user.landsize} ha</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserLevelStyle(user.userlevel)}`}>
                  {user.userlevel || 'unknown'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap">
                {formatDate(user.created_at || user.createdAt)}
              </td>
              <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                    title="View details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ 
  page, 
  pageCount, 
  total, 
  limit, 
  onPageChange, 
  onLimitChange, 
  canGoPrev, 
  canGoNext 
}) {
  return (
    <div className="bg-gray-50/90 dark:bg-slate-700/70 backdrop-blur-sm px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200/50 dark:border-gray-700/50 gap-4">
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        <span className="hidden sm:inline">Showing </span>
        <span className="font-medium mx-1">{(page - 1) * limit + 1}</span>
        <span className="hidden sm:inline">to </span>
        <span className="sm:hidden">-</span>
        <span className="font-medium mx-1">{Math.min(page * limit, total)}</span>
        <span>of </span>
        <span className="font-medium ml-1">{total}</span>
        <span className="hidden sm:inline"> results</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center">
          <label htmlFor="pageSize" className="sr-only">Items per page</label>
          <select
            id="pageSize"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border rounded text-sm p-1
                       bg-white text-gray-900
                       border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500
                       shadow-inner"
          >
            {[10, 20, 30, 50, 100].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => canGoPrev && onPageChange(page - 1)}
            disabled={!canGoPrev}
            className={`relative inline-flex items-center p-2 rounded-l-md border ${
              canGoPrev 
              ? 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
            }`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex">
            {generatePageNumbers(page, pageCount).map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === p
                      ? 'z-10 bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            ))}
          </div>
          
          <div className="md:hidden px-4 py-2 text-sm text-gray-700 border-t border-b border-gray-300 bg-white">
            {page} / {pageCount}
          </div>
          
          <button
            onClick={() => canGoNext && onPageChange(page + 1)}
            disabled={!canGoNext}
            className={`relative inline-flex items-center p-2 rounded-r-md border ${
              canGoNext 
              ? 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
            }`}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function UserFormModal({ 
  type, 
  user, 
  formData, 
  errors, 
  isSubmitting, 
  onChange, 
  onSubmit, 
  onClose 
}) {
  const title = type === 'add' ? 'Add New User' : 'Edit User';
  
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !isSubmitting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isSubmitting]);
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={isSubmitting ? undefined : onClose}
        />
        
        {/* Center helper */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div 
          className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl ring-1 ring-gray-900/5 transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient background */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Form */}
          <div onSubmit={onSubmit}>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={onChange}
                  error={errors.username}
                  required
                />
                
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  error={errors.email}
                  required
                />
                
                <FormField
                  label={type === 'edit' ? "Password (leave blank to keep current)" : "Password"}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={onChange}
                  error={errors.password}
                  required={type === 'add'}
                />
                
                <div>
                  <label htmlFor="userlevel" className="block text-sm font-medium text-gray-800 mb-1">
                    User Level<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="userlevel"
                    name="userlevel"
                    value={formData.userlevel}
                    onChange={onChange}
                    className={`block w-full rounded-lg border shadow-sm p-2.5
                               bg-white text-gray-900
                               ${errors.userlevel ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    required
                  >
                    <option value="">Select User Level</option>
                    <option value="admin">Admin</option>
                    <option value="researcher">Researcher</option>
                    <option value="farmer">Farmer</option>
                    <option value="agent">Agent</option>
                  </select>
                  {errors.userlevel && (
                    <p className="mt-1 text-sm text-red-600">{errors.userlevel}</p>
                  )}
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-800 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={onChange}
                    className="block w-full rounded-lg border shadow-sm p-2.5
                               bg-white text-gray-900 placeholder-gray-400
                               border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <FormField
                  label="Land Size (hectares)"
                  name="landsize"
                  type="number"
                  step="0.01"
                  value={formData.landsize}
                  onChange={onChange}
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg text-white ${
                  isSubmitting 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {type === 'add' ? 'Creating...' : 'Updating...'}
                  </span>
                ) : (
                  type === 'add' ? 'Create User' : 'Update User'
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewUserModal({ user, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const field = (label, value) => (
    <div className="grid grid-cols-3 gap-3 py-2">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="col-span-2 text-sm text-gray-900">{value ?? '—'}</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />
        
        {/* Center helper */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div 
          className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl ring-1 ring-gray-900/5 transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
            <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow"
                   style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                {user.username?.charAt(0)?.toUpperCase() || <UserCircle size={20} />}
              </div>
              <div className="ml-4">
                <div className="text-base font-semibold text-gray-900">{user.username}</div>
                <div className="text-xs mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full ${getUserLevelStyle(user.userlevel)} font-medium`}>
                    {user.userlevel || 'unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {field('ID', `#${user.id}`)}
              {field('Email', user.email)}
              {field('Address', user.address)}
              {field('Land Size (ha)', user.landsize)}
              {field('Created', formatDate(user.created_at || user.createdAt))}
              {field('Updated', formatDate(user.updated_at || user.updatedAt))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ user, onClose, onConfirm, isDeleting }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !isDeleting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isDeleting]);
  
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={isDeleting ? undefined : onClose}
        />
        
        {/* Center helper */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div 
          className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl ring-1 ring-gray-900/5 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-500/10 to-orange-500/10">
            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="px-6 py-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the user <span className="font-semibold text-gray-900">{user.username}</span>? 
                  This action cannot be undone and will remove all data associated with this account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className={`px-4 py-2 rounded-lg text-white ${
                isDeleting 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg'
              }`}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete User'
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/20 shadow-2xl p-8">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-t-green-600 border-green-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading users...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-red-100 dark:border-red-900/30 shadow-2xl p-8">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Users</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg inline-flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/20 shadow-2xl p-8">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UserCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          No users match your current filters. Try adjusting your search criteria or reset filters to see all users.
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, error, required = false, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full rounded-lg border shadow-sm p-2.5
                    bg-white text-gray-900 placeholder-gray-400
                    ${error
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// ------- Helper Functions -------

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  const isThisYear = date.getFullYear() === today.getFullYear();
  
  if (isThisYear) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getUserLevelStyle(level) {
  const styles = {
    admin: 'bg-red-100 text-red-800',
    researcher: 'bg-blue-100 text-blue-800',
    farmer: 'bg-green-100 text-green-800',
    advisor: 'bg-purple-100 text-purple-800',
    agent: 'bg-amber-100 text-amber-800',
  };
  return styles[(level || '').toLowerCase()] || 'bg-gray-100 text-gray-800';
}

function generatePageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const pages = new Set([1, totalPages, currentPage]);
  
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.add(i);
  }
  
  if (currentPage <= 4) pages.add(2);
  if (currentPage >= totalPages - 3) pages.add(totalPages - 1);
  
  const result = [...pages].sort((a, b) => a - b);
  
  const withEllipses = [];
  for (let i = 0; i < result.length; i++) {
    withEllipses.push(result[i]);
    if (i < result.length - 1 && result[i + 1] - result[i] > 1) {
      withEllipses.push('...');
    }
  }
  
  return withEllipses;
}

function initialFormData() {
  return {
    username: '',
    email: '',
    userlevel: 'farmer',
    password: '',
    address: '',
    landsize: ''
  };
}
