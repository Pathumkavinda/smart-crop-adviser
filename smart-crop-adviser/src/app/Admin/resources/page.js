'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Download, Trash2, X, Check, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, FileText, Eye, Calendar, Clock, User, Plus } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminResources() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for files list
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    farmer_id: '',
    adviser_id: '',
    category: '',
    date_from: '',
    date_to: '',
    q: '' // Search term
  });
  
  // File detail view
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Status message for operations
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Check if we should load a specific file
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      fetchFileById(id);
    }
  }, [searchParams]);

  // Fetch a specific file by ID
  const fetchFileById = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/user-files/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file details');
      }

      const data = await response.json();
      if (data && data.success) {
        setSelectedFile(data.data);
        setShowDetail(true);
      } else {
        throw new Error('File not found');
      }
    } catch (err) {
      console.error('Error fetching file:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files with filters and pagination
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      // Add any active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${API_URL}/api/v1/user-files?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setFiles([]);
          setTotal(0);
          return;
        }
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setFiles(data.data);
        setTotal(data.meta?.total || data.data.length);
      } else {
        setFiles([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, router]);

  // Load files on initial render and when dependencies change
  useEffect(() => {
    // Only fetch list if we're not showing a detail view
    if (!showDetail) {
      fetchFiles();
    }
  }, [fetchFiles, showDetail]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when applying filters
    fetchFiles();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      farmer_id: '',
      adviser_id: '',
      category: '',
      date_from: '',
      date_to: '',
      q: ''
    });
    setPage(1);
    fetchFiles();
  };

  // View file details
  const viewFileDetails = (file) => {
    setSelectedFile(file);
    setShowDetail(true);
    
    // Update URL to include file ID
    const url = new URL(window.location.href);
    url.searchParams.set('id', file.id);
    window.history.pushState({}, '', url.toString());
  };

  // Back to list view
  const backToList = () => {
    setShowDetail(false);
    setSelectedFile(null);
    
    // Remove id from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };
  
  // Confirm file deletion
  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  // Execute delete operation
  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/user-files/${fileToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Show success message
      setStatusMessage({
        type: 'success',
        message: `File "${fileToDelete.original_name}" was deleted successfully`
      });
      
      // Close modal and refresh files
      setShowDeleteConfirm(false);
      
      if (showDetail) {
        backToList();
      } else {
        fetchFiles();
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setStatusMessage({
        type: 'error',
        message: `Error: ${err.message}`
      });
    } finally {
      setLoading(false);
      // Clear message after delay
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
  };

  // Handle file download
  const downloadFile = (file) => {
    if (!file.public_url) {
      setStatusMessage({
        type: 'error',
        message: 'Download URL not available for this file'
      });
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
      return;
    }
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = file.public_url;
    link.download = file.original_name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileText />;
    
    if (mimeType.startsWith('image/')) {
      return <img src="/icons/image.svg" alt="Image" className="w-6 h-6" />;
    } else if (mimeType.startsWith('video/')) {
      return <img src="/icons/video.svg" alt="Video" className="w-6 h-6" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <img src="/icons/excel.svg" alt="Spreadsheet" className="w-6 h-6" />;
    } else if (mimeType.includes('pdf')) {
      return <img src="/icons/pdf.svg" alt="PDF" className="w-6 h-6" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <img src="/icons/document.svg" alt="Document" className="w-6 h-6" />;
    }
    
    return <FileText className="w-6 h-6" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render file detail view
  if (showDetail && selectedFile) {
    return (
      <AdminLayout>
        <div className="p-6">
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

          <button 
            onClick={backToList}
            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Files List
          </button>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                File Details
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedFile)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">File Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">File Name:</p>
                      <p className="font-medium">{selectedFile.original_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category:</p>
                      <p className="font-medium capitalize">{selectedFile.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">File Type:</p>
                      <p className="font-medium">{selectedFile.mime_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">File Size:</p>
                      <p className="font-medium">{formatFileSize(selectedFile.size_bytes)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Uploaded On:</p>
                      <p className="font-medium">{formatDate(selectedFile.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">User Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Farmer ID:</p>
                      <p className="font-medium">{selectedFile.farmer_id}</p>
                      <button 
                        onClick={() => router.push(`/admin/users?id=${selectedFile.farmer_id}`)}
                        className="text-indigo-600 text-xs hover:text-indigo-800 mt-1"
                      >
                        View Farmer Details
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adviser ID:</p>
                      <p className="font-medium">{selectedFile.adviser_id}</p>
                      <button 
                        onClick={() => router.push(`/admin/users?id=${selectedFile.adviser_id}`)}
                        className="text-indigo-600 text-xs hover:text-indigo-800 mt-1"
                      >
                        View Adviser Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedFile.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedFile.notes}</p>
                  </div>
                </div>
              )}

              {/* File Preview (if image) */}
              {selectedFile.mime_type?.startsWith('image/') && selectedFile.public_url && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Preview</h3>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                    <img 
                      src={selectedFile.public_url} 
                      alt={selectedFile.original_name}
                      className="max-h-96 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Resource Management</h1>
          <p className="text-gray-500">View and manage all uploaded files and resources</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    id="q"
                    name="q"
                    placeholder="Search files by name or notes"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.q}
                    onChange={handleFilterChange}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="soil">Soil</option>
                  <option value="recommendation">Recommendation</option>
                  <option value="photo">Photo</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    id="date_from"
                    name="date_from"
                    className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.date_from}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    id="date_to"
                    name="date_to"
                    className="border border-gray-300 rounded-md w-full px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.date_to}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="spinner h-10 w-10 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading resources...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg shadow p-6 text-red-800">
            <h3 className="font-semibold flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Resources
            </h3>
            <p>{error}</p>
            <button 
              onClick={fetchFiles}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No resources found matching your criteria.</p>
            {Object.values(filters).some(value => value) ? (
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            ) : (
              <p className="text-gray-400">Try uploading some files first.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                            {getFileIcon(file.mime_type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.original_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {file.mime_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {file.category ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {file.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size_bytes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(file.created_at)}</div>
                        <div className="text-xs text-gray-500">{formatTime(file.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-blue-500" />
                            <span>Farmer: #{file.farmer_id}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-green-500" />
                            <span>Adviser: #{file.adviser_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewFileDetails(file)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="text-green-600 hover:text-green-900"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(file)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && fileToDelete && (
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
                        Delete File
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the file "{fileToDelete.original_name}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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

// Helper function to format time
function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}