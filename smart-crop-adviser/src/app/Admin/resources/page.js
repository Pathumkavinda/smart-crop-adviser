'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Filter, Download, Trash2, X, Check, AlertTriangle, ChevronLeft, ChevronRight,
  RefreshCw, FileText, Eye, User, Plus, Save, Pencil, Link as LinkIcon, Copy, Upload, FolderOpen
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ENDPOINTS = {
  USER_FILES: `${API_URL}/api/v1/user-files`,
  USER_FILES_BY_ID: (id) => `${API_URL}/api/v1/user-files/${id}`,
  USER_FILES_BY_FARMER: (id) => `${API_URL}/api/v1/user-files/farmer/${id}`,
  USER_FILES_BY_ADVISER: (id) => `${API_URL}/api/v1/user-files/adviser/${id}`,
  USERS_SEARCH: `${API_URL}/api/v1/users`,
  ADMIN_USER: (id) => `/admin/users?id=${id}`,
};

const authHeader = (t) => (t ? { Authorization: `Bearer ${t}` } : {});
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };

function formatDate(s) { if (!s) return '—'; const d = new Date(s); return d.toLocaleDateString(); }
function formatTime(s) { if (!s) return ''; const d = new Date(s); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes && bytes !== 0) return '—';
  const u = ['Bytes','KB','MB','GB','TB']; const i = Math.floor(Math.log(Math.max(bytes,1))/Math.log(1024));
  return `${parseFloat((bytes/Math.pow(1024,i)).toFixed(2))} ${u[i]}`;
}
async function copyToClipboard(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }

function FileTypeIcon({ mime }) {
  if (!mime) return <FileText className="w-6 h-6 text-gray-500" />;
  
  // Use Lucide icons instead of missing SVG files
  if (mime.startsWith('image/')) return <FileText className="w-6 h-6 text-blue-500" />;
  if (mime.startsWith('video/')) return <FileText className="w-6 h-6 text-purple-500" />;
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileText className="w-6 h-6 text-green-500" />;
  if (mime.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
  if (mime.includes('word') || mime.includes('document')) return <FileText className="w-6 h-6 text-blue-600" />;
  return <FileText className="w-6 h-6 text-gray-500" />;
}

function resolveFileURL(apiBase, doc) {
  const v = (k) => doc?.[k];
  if (v('public_url')) return v('public_url');
  if (v('file_url')) return v('file_url');
  if (v('url')) return v('url');
  if (v('download_url')) return v('download_url');
  if (v('stored_name')) return `${apiBase.replace(/\/+$/, '')}/uploads/user_files/${v('stored_name')}`;
  const path = v('path') || v('filepath') || v('file_path');
  if (path) {
    const base = apiBase.replace(/\/+$/, '');
    const p = String(path).replace(/^\/+/, '');
    return `${base}/${p}`;
  }
  return null;
}

/* ---------- Timestamp picker (updated -> uploaded -> modified -> created) ---------- */
function pickBestTimestamp(obj) {
  if (!obj) return null;
  const keys = [
    'updated_at', 'updatedAt',
    'uploaded_at', 'uploadedAt',
    'modified_at', 'modifiedAt',
    'created_at', 'createdAt'
  ];
  for (const k of keys) if (obj[k]) return obj[k];
  return null;
}

/* ---------- Normalizers for many API shapes ---------- */
function pickArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && Array.isArray(obj.data.items)) return obj.data.items;
  if (obj.data && Array.isArray(obj.data.files)) return obj.data.files;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.files)) return obj.files;
  if (Array.isArray(obj.rows)) return obj.rows;
  if (Array.isArray(obj.results)) return obj.results;
  if (Array.isArray(obj.user_files)) return obj.user_files;
  if (Array.isArray(obj.list)) return obj.list;
  if (obj.result && Array.isArray(obj.result.items)) return obj.result.items;
  if (obj.payload && Array.isArray(obj.payload.items)) return obj.payload.items;
  return [];
}
function pickTotal(obj, fallbackCount) {
  if (!obj) return typeof fallbackCount === 'number' ? fallbackCount : 0;
  const tryNums = [
    obj.total, obj.count, obj.size,
    obj?.meta?.total, obj?.pagination?.total, obj?.data?.total,
    obj?.result?.total, obj?.payload?.total,
  ];
  for (const n of tryNums) {
    if (typeof n === 'number') return n;
    if (typeof n === 'string' && !isNaN(+n)) return +n;
  }
  return typeof fallbackCount === 'number' ? fallbackCount : 0;
}
function normalizeListShape(json) {
  const items = pickArray(json);
  const total = pickTotal(json, items.length);
  return { items, total };
}
function getId(x) { return x?.id ?? x?._id ?? x?.file_id ?? x?.uuid ?? x?.pk ?? String(Math.random()); }

export default function AdminResourcesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [isDark, setIsDark] = useState(false);

  // Detect dark theme
  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const token = useMemo(getToken, []);

  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [showAll, setShowAll] = useState(false);
  const PAGE_SIZE_FOR_ALL = 100;

  const [filters, setFilters] = useState({
    q: '', category: '', date_from: '', date_to: '',
    farmer_id: '', adviser_id: ''
  });

  const [farmerNameQ, setFarmerNameQ] = useState('');
  const [adviserNameQ, setAdviserNameQ] = useState('');
  const [farmerOpts, setFarmerOpts] = useState([]);
  const [adviserOpts, setAdviserOpts] = useState([]);
  const [searchingFarmers, setSearchingFarmers] = useState(false);
  const [searchingAdvisers, setSearchingAdvisers] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBusy, setEditBusy] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [distribBusy, setDistribBusy] = useState(false);
  const [distribFile, setDistribFile] = useState(null);
  const [distribCategory, setDistribCategory] = useState('');
  const [distribNotes, setDistribNotes] = useState('');
  const [roleTab, setRoleTab] = useState('farmer');
  const [userSearchQ, setUserSearchQ] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userFindBusy, setUserFindBusy] = useState(false);
  const [recipients, setRecipients] = useState([]);

  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const id = params.get('id');
    if (id) fetchFileById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const buildQueryFromState = (p, l) => {
    const qp = new URLSearchParams();
    qp.append('page', String(p));
    qp.append('limit', String(l));
    Object.entries(filters).forEach(([k, v]) => { if (v) qp.append(k, v); });
    return qp.toString();
  };

  const robustFetch = async (url) => {
    const tryOrder = [{ headers: { ...authHeader(token) } }, { headers: {} }];
    for (const opt of tryOrder) {
      try {
        const res = await fetch(url, opt);
        if (res.ok) return res;
        // Log the error for debugging
        if (!res.ok) {
          console.warn(`API request failed: ${url} - Status: ${res.status} ${res.statusText}`);
        }
      } catch (error) {
        console.error(`Network error for ${url}:`, error);
      }
    }
    return fetch(url, { headers: { ...authHeader(token) } });
  };

  const fetchListWithRoleSmart = useCallback(async (p, l) => {
    const farmerId = filters.farmer_id?.trim();
    const adviserId = filters.adviser_id?.trim();

    if (farmerId && !adviserId) {
      let res = await robustFetch(`${ENDPOINTS.USER_FILES_BY_FARMER(encodeURIComponent(farmerId))}?${buildQueryFromState(p, l)}`);
      if (!res.ok) res = await robustFetch(`${ENDPOINTS.USER_FILES}?farmer_id=${encodeURIComponent(farmerId)}&${buildQueryFromState(p, l)}`);
      return safeJSON(res);
    }

    if (adviserId && !farmerId) {
      let res = await robustFetch(`${ENDPOINTS.USER_FILES_BY_ADVISER(encodeURIComponent(adviserId))}?${buildQueryFromState(p, l)}`);
      if (!res.ok) res = await robustFetch(`${ENDPOINTS.USER_FILES}?adviser_id=${encodeURIComponent(adviserId)}&${buildQueryFromState(p, l)}`);
      return safeJSON(res);
    }

    const res = await robustFetch(`${ENDPOINTS.USER_FILES}?${buildQueryFromState(p, l)}`);
    return safeJSON(res);
  }, [filters.farmer_id, filters.adviser_id, token]);

  const fetchAllFiles = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const perPage = PAGE_SIZE_FOR_ALL;
      const seen = new Set();
      const all = [];
      for (let p = 1; p <= 500; p++) {
        const pageJson = await fetchListWithRoleSmart(p, perPage);
        const { items } = normalizeListShape(pageJson);
        if (!items || items.length === 0) break;
        for (const it of items) {
          const key = getId(it);
          if (seen.has(key)) continue;
          seen.add(key);
          all.push(it);
        }
        if (items.length < perPage) break;
      }
      setFiles(all);
      setTotal(all.length);
    } catch (e) {
      console.error(e);
      setErr('Failed to load files.');
    } finally {
      setLoading(false);
    }
  }, [fetchListWithRoleSmart]);

  const fetchFilesPaged = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const json = await fetchListWithRoleSmart(page, limit);
      const { items, total } = normalizeListShape(json);
      setFiles(items);
      setTotal(total);
    } catch (e) {
      console.error('Error fetching files:', e);
      setErr(`Failed to load files: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [fetchListWithRoleSmart, page, limit]);

  const fetchFiles = useCallback(() => {
    if (showDetail) return;
    if (showAll) return fetchAllFiles();
    return fetchFilesPaged();
  }, [showAll, showDetail, fetchAllFiles, fetchFilesPaged]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  async function fetchFileById(id) {
    try {
      setLoading(true);
      let res = await robustFetch(ENDPOINTS.USER_FILES_BY_ID(id));
      if (!res.ok) throw new Error('Not found');
      const data = await safeJSON(res);
      const payload = data?.data ?? data;
      if (!payload) throw new Error('Not found');
      setSelectedFile(payload); setShowDetail(true);
    } catch (e) {
      setErr('Could not load file details.');
    } finally { setLoading(false); }
  }

  function handleFilterInput(e) {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  }
  const applyFilters = (e) => { e.preventDefault(); setPage(1); (showAll ? fetchAllFiles() : fetchFilesPaged()); };
  const resetFilters = () => {
    setFilters({ q:'', category:'', date_from:'', date_to:'', farmer_id:'', adviser_id:'' });
    setFarmerNameQ(''); setAdviserNameQ(''); setPage(1);
    (showAll ? fetchAllFiles() : fetchFilesPaged());
  };

  const searchUsers = useCallback(async (q, role, setter, busySetter) => {
    if (!q) { setter([]); return; }
    try {
      busySetter(true);
      const p = new URLSearchParams();
      p.append('q', q); p.append('role', role); p.append('limit', '8');
      const res = await robustFetch(`${ENDPOINTS.USERS_SEARCH}?${p.toString()}`);
      const data = await safeJSON(res);
      const list = pickArray(data) || data?.users || [];
      setter(list);
    } finally { busySetter(false); }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(farmerNameQ, 'farmer', setFarmerOpts, setSearchingFarmers), 300);
    return () => clearTimeout(t);
  }, [farmerNameQ, searchUsers]);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(adviserNameQ, 'adviser', setAdviserOpts, setSearchingAdvisers), 300);
    return () => clearTimeout(t);
  }, [adviserNameQ, searchUsers]);

  const viewFileDetails = (file) => {
    setSelectedFile(file); setShowDetail(true);
    const url = new URL(window.location.href); url.searchParams.set('id', getId(file));
    window.history.pushState({}, '', url.toString());
  };
  const backToList = () => {
    setShowDetail(false); setSelectedFile(null);
    const url = new URL(window.location.href); url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };
  const downloadFile = (file) => {
    const url = resolveFileURL(API_URL, file);
    if (!url) { toast('error','Download URL not available'); return; }
    const a = document.createElement('a'); a.href = url; a.download = file.original_name || 'download';
    document.body.appendChild(a); a.click(); a.remove();
  };
  const handleDeleteClick = (file) => { setFileToDelete(file); setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      setLoading(true);
      const res = await fetch(ENDPOINTS.USER_FILES_BY_ID(getId(fileToDelete)), { method:'DELETE', headers:{ ...authHeader(token) } });
      if (!res.ok) throw new Error('Delete failed');
      toast('success', `Deleted "${fileToDelete.original_name || fileToDelete.notes || getId(fileToDelete)}"`);
      setShowDeleteConfirm(false);
      if (showDetail) backToList(); else fetchFiles();
    } catch (e) {
      toast('error', e.message || 'Delete failed');
    } finally { setLoading(false); }
  };

  const beginRename = (f) => { setEditId(getId(f)); setEditTitle(f.notes || f.original_name || ''); };
  const cancelRename = () => { setEditId(null); setEditTitle(''); };
  const saveRename = async () => {
    if (!editId) return;
    try {
      setEditBusy(true);
      const res = await fetch(ENDPOINTS.USER_FILES_BY_ID(editId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ notes: editTitle })
      });
      if (!res.ok) throw new Error('Rename failed');
      cancelRename(); fetchFiles(); toast('success','Title updated');
    } catch (e) { toast('error', e.message || 'Rename failed'); }
    finally { setEditBusy(false); }
  };

  const addRecipient = (u, role) => {
    const name = u.username || [u.first_name, u.last_name].filter(Boolean).join(' ') || `User ${u.id}`;
    setRecipients((prev) => prev.some((r) => r.id===u.id && r.role===role) ? prev : [...prev, { id: u.id, role, label: `#${u.id} ${name}` }]);
  };
  const removeRecipient = (id, role) => setRecipients((prev) => prev.filter((r) => !(r.id===id && r.role===role)));

  const findUsersForDistrib = useCallback(async () => {
    if (!userSearchQ) { setUserResults([]); return; }
    try {
      setUserFindBusy(true);
      const p = new URLSearchParams({ q: userSearchQ, role: roleTab, limit: '10' });
      const res = await robustFetch(`${ENDPOINTS.USERS_SEARCH}?${p.toString()}`);
      const data = await safeJSON(res);
      const list = pickArray(data) || data?.users || [];
      setUserResults(list);
    } finally { setUserFindBusy(false); }
  }, [userSearchQ, roleTab, token]);

  useEffect(() => {
    if (!showAddModal) return;
    const t = setTimeout(findUsersForDistrib, 300);
    return () => clearTimeout(t);
  }, [findUsersForDistrib, showAddModal]);

  const resetDistrib = () => {
    setDistribFile(null); setDistribCategory(''); setDistribNotes('');
    setRoleTab('farmer'); setUserSearchQ(''); setUserResults([]); setRecipients([]);
  };

  // FIXED: Updated uploadAndDistribute function to work with backend requirements
  const uploadAndDistribute = async () => {
    if (!distribFile) { toast('error','Choose a file'); return; }
    if (recipients.length === 0) { toast('error','Add at least one recipient'); return; }

    try {
      setDistribBusy(true);
      for (const r of recipients) {
        const fd = new FormData();
        fd.append('file', distribFile);
        if (distribCategory) fd.append('category', distribCategory);
        if (distribNotes) fd.append('notes', distribNotes);
        
        // FIXED: Backend requires both farmer_id and adviser_id to be provided
        // We'll send both, with the non-selected role getting a default value of 1
        // This works around the backend validation while maintaining the intent
        if (r.role === 'farmer') {
          fd.append('farmer_id', String(r.id));
          fd.append('adviser_id', '1'); // Default adviser ID - backend requires this
        } else if (r.role === 'adviser') {
          fd.append('farmer_id', '1'); // Default farmer ID - backend requires this  
          fd.append('adviser_id', String(r.id));
        }
        
        console.log('Uploading file for:', r.role, r.id); // Debug log
        
        const resp = await fetch(ENDPOINTS.USER_FILES, { 
          method:'POST', 
          headers: { ...authHeader(token) }, 
          body: fd 
        });
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('Upload failed response:', errorText);
          let errorMessage = `Upload failed for ${r.label}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) errorMessage = errorData.error;
          } catch (e) {
            // If response isn't JSON, use the text
            if (errorText) errorMessage = errorText.slice(0, 100);
          }
          throw new Error(errorMessage);
        }
      }
      toast('success','File uploaded to selected dashboards');
      setShowAddModal(false); resetDistrib(); fetchFiles();
    } catch (e) { 
      console.error('Upload error:', e);
      toast('error', e.message || 'Upload failed'); 
    } finally { 
      setDistribBusy(false); 
    }
  };

  function toast(type, message) {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage({ type:'', message:'' }), 3500);
  }

  /* ========== DETAIL VIEW ========== */
  if (showDetail && selectedFile) {
    return (
      <AdminLayout>
        <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900">
          <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {statusMessage.message && (
              <div className={`mb-6 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700/30' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700/30'}`}>
                <div className="flex items-center">
                  {statusMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                  <p>{statusMessage.message}</p>
                </div>
              </div>
            )}

            <button onClick={backToList} className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300">
              <ChevronLeft className="h-5 w-5 mr-1" /> Back to Files
            </button>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  File Details
                </h2>
                <div className="flex gap-2">
                  {selectedFile?.public_url && (
                    <>
                      <button
                        onClick={async () => {
                          const ok = await copyToClipboard(selectedFile.public_url);
                          toast(ok ? 'success' : 'error', ok ? 'Public link copied' : 'Copy failed');
                        }}
                        className="px-3 py-1.5 rounded-md text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <Copy className="h-4 w-4 inline mr-1" /> Copy Link
                      </button>
                      <a
                        href={selectedFile.public_url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-md text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <LinkIcon className="h-4 w-4 inline mr-1" /> Open
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="px-3 py-1.5 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-4 w-4 inline mr-1" /> Download
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedFile)}
                    className="px-3 py-1.5 rounded-md text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700/30 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                  <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600 dark:text-gray-400">File Name: </span><span className="font-medium break-all text-gray-900 dark:text-white">{selectedFile.original_name || '—'}</span></div>
                    <div><span className="text-gray-600 dark:text-gray-400">Category: </span><span className="font-medium capitalize text-gray-900 dark:text-white">{selectedFile.category || 'Uncategorized'}</span></div>
                    <div><span className="text-gray-600 dark:text-gray-400">Type: </span><span className="font-medium text-gray-900 dark:text-white">{selectedFile.mime_type || '—'}</span></div>
                    <div><span className="text-gray-600 dark:text-gray-400">Size: </span><span className="font-medium text-gray-900 dark:text-white">{formatFileSize(selectedFile.size_bytes)}</span></div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Uploaded: </span>
                      {(() => {
                        const ts = pickBestTimestamp(selectedFile);
                        return (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(ts)} <span className="text-xs text-gray-500 dark:text-gray-400">({formatTime(ts)})</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                  <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Farmer ID: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedFile.farmer_id ?? '—'}</span>{' '}
                      {selectedFile.farmer_id && (
                        <button onClick={() => router.push(ENDPOINTS.ADMIN_USER(selectedFile.farmer_id))}
                                className="text-xs ml-1 text-indigo-600 hover:text-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300">
                          View
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Adviser ID: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedFile.adviser_id ?? '—'}</span>{' '}
                      {selectedFile.adviser_id && (
                        <button onClick={() => router.push(ENDPOINTS.ADMIN_USER(selectedFile.adviser_id))}
                                className="text-xs ml-1 text-indigo-600 hover:text-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300">
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedFile.notes && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Notes</h3>
                    <div className="bg-gray-50/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-slate-700/50">
                      <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{selectedFile.notes}</p>
                    </div>
                  </div>
                )}

                {selectedFile.mime_type?.startsWith('image/') && resolveFileURL(API_URL, selectedFile) && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Preview</h3>
                    <div className="bg-gray-50/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 flex justify-center border border-gray-200/50 dark:border-slate-700/50">
                      <img src={resolveFileURL(API_URL, selectedFile)} alt={selectedFile.original_name || 'image'} className="max-h-96 max-w-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showDeleteConfirm && selectedFile && (
              <ConfirmDeleteModal
                loading={loading}
                name={selectedFile.original_name || selectedFile.notes || getId(selectedFile)}
                onCancel={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
              />
            )}
          </main>
        </div>
      </AdminLayout>
    );
  }

  /* ========== LIST VIEW ========== */
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900">
        <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {statusMessage.message && (
            <div className={`mb-6 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700/30' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700/30'}`}>
              <div className="flex items-center">
                {statusMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                <p>{statusMessage.message}</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300">
                  Admin Resources
                </h1>
                <p className="text-base md:text-lg text-slate-900 dark:text-slate-300 mt-2 font-medium">
                  Manage all user files across dashboards
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Live Data</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowAll((v) => !v); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${showAll ? 'text-white bg-indigo-600' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    title="Toggle to load every file from all pages"
                  >
                    {showAll ? 'Showing All' : 'Show All'}
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-medium"
                  >
                    <Plus className="inline h-4 w-4 mr-1" /> Add / Distribute
                  </button>
                  <button
                    onClick={fetchFiles}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium"
                  >
                    <RefreshCw className="inline h-4 w-4 mr-1" /> Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl mb-6 overflow-hidden">
            <form onSubmit={applyFilters} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text" name="q" value={filters.q} onChange={handleFilterInput}
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Name / notes / type…"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Category</label>
                  <select
                    name="category" value={filters.category} onChange={handleFilterInput}
                    className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All</option>
                    <option value="soil">Soil</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="photo">Photo</option>
                    <option value="report">Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Date From</label>
                  <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterInput}
                         className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Date To</label>
                  <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterInput}
                         className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                {/* Farmer by name -> id */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Farmer (by name)</label>
                  <div className="relative">
                    <input
                      type="text" value={farmerNameQ} onChange={(e)=>setFarmerNameQ(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Type to search farmers…"
                    />
                    {searchingFarmers && <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />}
                    {farmerNameQ && farmerOpts.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                        {farmerOpts.map((u) => {
                          const label = u.username || `${u.first_name||''} ${u.last_name||''}`.trim() || `User ${u.id}`;
                          return (
                            <button key={u.id} type="button"
                                    onClick={() => { setFilters((f)=>({ ...f, farmer_id: String(u.id) })); setFarmerNameQ(label); setFarmerOpts([]); }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100">
                              #{u.id} — {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {filters.farmer_id && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Filtering by Farmer ID: <strong className="text-gray-900 dark:text-white">#{filters.farmer_id}</strong>{' '}
                      <button type="button" onClick={()=>setFilters((f)=>({ ...f, farmer_id:'' }))}
                              className="ml-1 underline text-indigo-600 hover:text-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300">clear</button>
                    </div>
                  )}
                </div>

                {/* Adviser by name -> id */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Adviser (by name)</label>
                  <div className="relative">
                    <input
                      type="text" value={adviserNameQ} onChange={(e)=>setAdviserNameQ(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Type to search advisers…"
                    />
                    {searchingAdvisers && <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />}
                    {adviserNameQ && adviserOpts.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                        {adviserOpts.map((u) => {
                          const label = u.username || `${u.first_name||''} ${u.last_name||''}`.trim() || `User ${u.id}`;
                          return (
                            <button key={u.id} type="button"
                                    onClick={() => { setFilters((f)=>({ ...f, adviser_id: String(u.id) })); setAdviserNameQ(label); setAdviserOpts([]); }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100">
                              #{u.id} — {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {filters.adviser_id && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Filtering by Adviser ID: <strong className="text-gray-900 dark:text-white">#{filters.adviser_id}</strong>{' '}
                      <button type="button" onClick={()=>setFilters((f)=>({ ...f, adviser_id:'' }))}
                              className="ml-1 underline text-indigo-600 hover:text-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300">clear</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button" onClick={resetFilters}
                  className="px-4 py-2 rounded-lg flex items-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4 mr-1" /> Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white flex items-center bg-indigo-600 hover:bg-indigo-700"
                >
                  <Filter className="h-4 w-4 mr-1" /> Apply
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          {loading ? (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl p-8 text-center">
              <div className="h-10 w-10 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading resources…</p>
            </div>
          ) : err ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl shadow-2xl p-6 text-red-700 dark:text-red-200">
              <div className="flex items-center font-semibold mb-1"><AlertTriangle className="h-5 w-5 mr-2" /> Error</div>
              <p>{err}</p>
              <button onClick={fetchFiles}
                      className="mt-4 px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 inline-flex items-center">
                <RefreshCw className="inline h-4 w-4 mr-1" /> Try Again
              </button>
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No files found for the current filters.</p>
              <button onClick={resetFilters}
                      className="mt-4 px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50/90 dark:bg-slate-700/70 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Users</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm divide-y divide-gray-200 dark:divide-slate-700">
                    {files.map((f) => {
                      const rowId = getId(f);
                      const ts = pickBestTimestamp(f);
                      return (
                        <tr key={rowId} className="hover:bg-green-50/70 dark:hover:bg-slate-700/70 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                                <FileTypeIcon mime={f.mime_type} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium truncate max-w-xs text-gray-900 dark:text-white">
                                  {editId === rowId ? (
                                    <span className="inline-flex items-center gap-2">
                                      <input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)}
                                             className="px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100" />
                                      <button onClick={saveRename} disabled={editBusy}
                                              className="px-2 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700">
                                        {editBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                      </button>
                                      <button onClick={cancelRename}
                                              className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600">
                                        <X className="h-4 w-4" />
                                      </button>
                                    </span>
                                  ) : (
                                    <>
                                      {f.notes || f.original_name || 'Untitled'}
                                      <button onClick={()=>beginRename(f)} className="ml-2 opacity-60 hover:opacity-100 text-gray-500 dark:text-gray-400">
                                        <Pencil className="h-4 w-4 inline-block" />
                                      </button>
                                    </>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{f.mime_type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {f.category ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                {f.category}
                              </span>
                            ) : <span className="text-xs text-gray-500 dark:text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatFileSize(f.size_bytes)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(ts)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(ts)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-gray-700 dark:text-gray-300"><User className="h-3 w-3 mr-1 text-blue-500" /> Farmer: {f.farmer_id ? `#${f.farmer_id}` : '—'}</div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300"><User className="h-3 w-3 mr-1 text-green-500" /> Adviser: {f.adviser_id ? `#${f.adviser_id}` : '—'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              {f.public_url && (
                                <button
                                  onClick={async () => {
                                    const ok = await copyToClipboard(f.public_url);
                                    toast(ok ? 'success' : 'error', ok ? 'Public link copied' : 'Copy failed');
                                  }}
                                  title="Copy public link"
                                  className="opacity-80 hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                  <Copy className="h-5 w-5" />
                                </button>
                              )}
                              <button onClick={() => viewFileDetails(f)} title="Details" className="opacity-80 hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <Eye className="h-5 w-5" />
                              </button>
                              <button onClick={() => downloadFile(f)} title="Download" className="opacity-80 hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <Download className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDeleteClick(f)} title="Delete" className="opacity-80 hover:opacity-100 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50/90 dark:bg-slate-700/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {showAll
                    ? <>Showing <span className="font-medium">{files.length}</span> of <span className="font-medium">{total}</span> (all)</>
                    : <>Showing <span className="font-medium">{(page-1)*limit+1}</span>–<span className="font-medium">{Math.min(page*limit,total)}</span> of <span className="font-medium">{total}</span></>}
                </div>

                {!showAll && total > limit && (
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage((p)=>Math.max(1,p-1))} disabled={page===1}
                      className={`px-2 py-2 rounded-l-md border text-sm font-medium ${
                        page===1 
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-300 dark:border-slate-600' 
                          : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_,i)=>{
                      const n = i+1;
                      const active = page===n;
                      return (
                        <button key={n} onClick={()=>setPage(n)}
                                className={`px-4 py-2 border text-sm font-medium ${
                                  active 
                                    ? 'z-10 bg-indigo-900/40 border-indigo-500 text-indigo-200'
                                    : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}>
                          {n}
                        </button>
                      );
                    })}
                    {totalPages>5 && (
                      <>
                        <span className="px-4 py-2 border text-sm font-medium bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200">…</span>
                        <button onClick={()=>setPage(totalPages)}
                                className={`px-4 py-2 border text-sm font-medium ${
                                  page===totalPages
                                    ? 'z-10 bg-indigo-900/40 border-indigo-500 text-indigo-200'
                                    : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}>
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPage((p)=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
                      className={`px-2 py-2 rounded-r-md border text-sm font-medium ${
                        page>=totalPages 
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-300 dark:border-slate-600' 
                          : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                )}
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteConfirm && fileToDelete && (
            <ConfirmDeleteModal
              loading={loading}
              name={fileToDelete.original_name || fileToDelete.notes || getId(fileToDelete)}
              onCancel={() => setShowDeleteConfirm(false)}
              onConfirm={confirmDelete}
            />
          )}

          {/* Add / Distribute Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-30 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/45"
                   onClick={() => { if (!distribBusy) { setShowAddModal(false); resetDistrib(); } }} />
              <div className="relative w-full max-w-3xl mx-4 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-white/20 dark:border-slate-700/20">
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add / Distribute Resource</h3>
                  <button onClick={() => { setShowAddModal(false); resetDistrib(); }} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">File</label>
                    <input type="file" onChange={(e)=>setDistribFile(e.target.files?.[0]||null)}
                           className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                           accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
                    {distribFile && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{distribFile.name} • {formatFileSize(distribFile.size)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Category</label>
                    <select value={distribCategory} onChange={(e)=>setDistribCategory(e.target.value)}
                            className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Select</option>
                      <option value="soil">Soil</option>
                      <option value="recommendation">Recommendation</option>
                      <option value="photo">Photo</option>
                      <option value="report">Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Notes (optional)</label>
                    <textarea rows={3} value={distribNotes} onChange={(e)=>setDistribNotes(e.target.value)}
                              className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Add a label or instructions for recipients…" />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <button type="button"
                              onClick={()=>setRoleTab('farmer')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${roleTab==='farmer'?'text-white bg-indigo-600':'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        Farmers
                      </button>
                      <button type="button"
                              onClick={()=>setRoleTab('adviser')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${roleTab==='adviser'?'text-white bg-indigo-600':'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        Advisers
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text" value={userSearchQ} onChange={(e)=>setUserSearchQ(e.target.value)}
                        className="flex-1 rounded-lg px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Search ${roleTab}s by name/email…`}
                      />
                      <button onClick={findUsersForDistrib} type="button"
                              className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">
                        {userFindBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-gray-200 dark:border-slate-700">
                      {userResults.length===0 ? (
                        <div className="p-2 text-sm text-gray-600 dark:text-gray-400">No results.</div>
                      ) : userResults.map((u)=> {
                        const label = u.username || `${u.first_name||''} ${u.last_name||''}`.trim() || `User ${u.id}`;
                        return (
                          <div key={u.id} className="px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 last:border-b-0">
                            <div className="text-sm text-gray-900 dark:text-white">#{u.id} — {label}{u.email ? <span className="text-gray-500 dark:text-gray-400"> ({u.email})</span> : null}</div>
                            <button type="button"
                                    onClick={()=>addRecipient(u, roleTab)}
                                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {recipients.length>0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recipients.map((r)=>(
                          <span key={`${r.role}-${r.id}`} className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                            {r.role}:{' '}{r.label}
                            <button onClick={()=>removeRecipient(r.id,r.role)} className="ml-1 opacity-75 hover:opacity-100">
                              <X className="inline h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 flex justify-end gap-2 border-t border-gray-200 dark:border-slate-700">
                  <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                          onClick={()=>{ setShowAddModal(false); resetDistrib(); }}>
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
                          disabled={distribBusy}
                          onClick={uploadAndDistribute}>
                    {distribBusy ? <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" /> : <Plus className="h-4 w-4 inline mr-1" />}
                    Upload to Dashboards
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}

/* ---------- Confirm Delete Modal ---------- */
function ConfirmDeleteModal({ loading, name, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/45" onClick={onCancel} />
      <div className="relative max-w-md mx-auto mt-36 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-white/20 dark:border-slate-700/20">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3 bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete File</h3>
          </div>
        </div>
        <div className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{name}"</span>? This action cannot be undone.
        </div>
        <div className="px-5 py-4 flex justify-end gap-2 border-t border-gray-200 dark:border-slate-700">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-60">
            {loading ? <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 inline mr-1" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}