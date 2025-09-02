'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Plus, Edit, Trash2, X, Check, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminUsers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for users list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [userLevel, setUserLevel] = useState('');
  
  // User edit/create modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    userlevel: '',
    password: '',
    address: '',
    landsize: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Status message for operations
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Fetch users with filters and pagination
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query params - using the existing API
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      // Add search if provided (just use the generic query param your API supports)
      if (searchQuery) params.append('q', searchQuery);

      // We can't filter by userlevel in the URL since the API doesn't support it
      // We'll filter client-side after fetching

      const response = await fetch(`${API_URL}/api/v1/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // If we're filtering by userlevel, do it client-side
      let filteredUsers = data.data;
      if (userLevel) {
        filteredUsers = filteredUsers.filter(user => 
          user.userlevel?.toLowerCase() === userLevel.toLowerCase()
        );
      }
      
      setUsers(filteredUsers);
      setTotal(data.meta.total);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, userLevel, router]);

  // Load users on initial render and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset form for new user
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      userlevel: 'farmer',
      password: '',
      address: '',
      landsize: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Set form for editing
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      userlevel: user.userlevel || '',
      password: '', // Don't fill password for security
      address: user.address || '',
      landsize: user.landsize || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Confirm user deletion
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Execute delete operation
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Show success message
      setStatusMessage({
        type: 'success',
        message: `User ${userToDelete.username} was deleted successfully`
      });
      
      // Close modal and refresh users
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setStatusMessage({
        type: 'error',
        message: `Error: ${err.message}`
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!editingUser && !formData.password.trim()) {
      errors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.userlevel) {
      errors.userlevel = 'User level is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser 
        ? `${API_URL}/api/v1/users/${editingUser.id}` 
        : `${API_URL}/api/v1/users`;
      
      // Only include password if it's provided (for edits)
      const submitData = { ...formData };
      if (!submitData.password) delete submitData.password;
      
      // Convert landsize to number if provided
      if (submitData.landsize) {
        submitData.landsize = parseFloat(submitData.landsize);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user');
      }

      // Show success message
      setStatusMessage({
        type: 'success',
        message: `User ${editingUser ? 'updated' : 'created'} successfully`
      });
      
      // Close modal and refresh users
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setStatusMessage({
        type: 'error',
        message: `Error: ${err.message}`
      });
    }
  };

  // Clear status message after timeout
  useEffect(() => {
    if (statusMessage.message) {
      const timer = setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Handle filter apply
  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when applying filters
    fetchUsers();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setUserLevel('');
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">User Management</h1>
          <p className="text-gray-500">View, add, edit and manage system users</p>
        </div>

        {/* Status Message */}
        {statusMessage.message && (
          <div className={`mb-6 p-4 rounded-md ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {statusMessage.type === 'success' ? 
                <Check className="w-5 h-5 mr-2" /> : 
                <AlertTriangle className="w-5 h-5 mr-2" />
              }
              <p>{statusMessage.message}</p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <form onSubmit={applyFilters} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by username or email"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label htmlFor="userLevel" className="block text-sm font-medium text-gray-700 mb-1">User Level</label>
                <select
                  id="userLevel"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="admin">Admin</option>
                  <option value="adviser">Adviser</option>
                  <option value="farmer">Farmer</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Filter className="h-5 w-5" />
                  <span className="sr-only">Apply Filters</span>
                </button>
                
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Reset Filters</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {total > 0 && (
              <span>Showing {users.length} {userLevel ? userLevel : ''} users</span>
            )}
          </div>
          
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="spinner h-10 w-10 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg shadow p-6 text-red-800">
            <h3 className="font-semibold flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Users
            </h3>
            <p>{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No users found matching your criteria.</p>
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            {user.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserLevelStyle(user.userlevel)}`}>
                          {user.userlevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.address || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {total > limit && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }).map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {Math.ceil(total / limit) > 5 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      
                      {Math.ceil(total / limit) > 5 && (
                        <button
                          onClick={() => setPage(Math.ceil(total / limit))}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            page === Math.ceil(total / limit)
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {Math.ceil(total / limit)}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= Math.ceil(total / limit)}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page >= Math.ceil(total / limit) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Edit/Add Modal */}
        {showModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {editingUser ? 'Edit User' : 'Add New User'}
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                              Username
                            </label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            />
                            {formErrors.username && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            />
                            {formErrors.email && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                              {editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                            </label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            />
                            {formErrors.password && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="userlevel" className="block text-sm font-medium text-gray-700">
                              User Level
                            </label>
                            <select
                              id="userlevel"
                              name="userlevel"
                              value={formData.userlevel}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${formErrors.userlevel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            >
                              <option value="">Select User Level</option>
                              <option value="admin">Admin</option>
                              <option value="adviser">Adviser</option>
                              <option value="farmer">Farmer</option>
                              <option value="agent">Agent</option>
                            </select>
                            {formErrors.userlevel && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.userlevel}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                              Address
                            </label>
                            <textarea
                              id="address"
                              name="address"
                              rows="3"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            ></textarea>
                          </div>
                          
                          <div>
                            <label htmlFor="landsize" className="block text-sm font-medium text-gray-700">
                              Land Size (hectares)
                            </label>
                            <input
                              type="number"
                              name="landsize"
                              id="landsize"
                              step="0.01"
                              value={formData.landsize}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete User
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the user "{userToDelete.username}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Helper function to determine styling for user level tags
function getUserLevelStyle(level) {
  const styles = {
    admin: 'bg-red-100 text-red-800',
    adviser: 'bg-blue-100 text-blue-800',
    farmer: 'bg-green-100 text-green-800',
    agent: 'bg-purple-100 text-purple-800',
  };
  
  return styles[level?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}