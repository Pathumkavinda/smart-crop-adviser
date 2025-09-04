'use client';

import ThemeWrapper from '@/components/ThemeWrapper';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Filter, Download, Trash2, X, Check, AlertTriangle, ChevronLeft, ChevronRight,
  RefreshCw, FileText, Eye, User, Plus, Save, Pencil, Link as LinkIcon, Copy
} from 'lucide-react';

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
  const show = (src) => <img src={src} alt="type" className="w-6 h-6" />;
  if (mime.startsWith('image/')) return show('/icons/image.svg');
  if (mime.startsWith('video/')) return show('/icons/video.svg');
  if (mime.includes('spreadsheet') || mime.includes('excel')) return show('/icons/excel.svg');
  if (mime.includes('pdf')) return show('/icons/pdf.svg');
  if (mime.includes('word') || mime.includes('document')) return show('/icons/document.svg');
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
  const { user } = useAuth();
  const { theme } = useTheme();
  const { translations } = useLanguage();

  const token = useMemo(getToken, []);
  const isDark = theme.name === 'dark';

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
    qp.append('per_page', String(l));
    qp.append('pageSize', String(l));
    qp.append('size', String(l));
    Object.entries(filters).forEach(([k, v]) => { if (v) qp.append(k, v); });
    return qp.toString();
  };

  const robustFetch = async (url) => {
    const tryOrder = [{ headers: { ...authHeader(token) } }, { headers: {} }];
    for (const opt of tryOrder) {
      const res = await fetch(url, opt);
      if (res.ok) return res;
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
      console.error(e);
      setErr('Failed to load files.');
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
        if (r.role === 'farmer') fd.append('farmer_id', String(r.id));
        if (r.role === 'adviser') fd.append('adviser_id', String(r.id));
        const resp = await fetch(ENDPOINTS.USER_FILES, { method:'POST', headers: { ...authHeader(token) }, body: fd });
        if (!resp.ok) throw new Error(`Upload failed for ${r.label}`);
      }
      toast('success','File uploaded to selected dashboards');
      setShowAddModal(false); resetDistrib(); fetchFiles();
    } catch (e) { toast('error', e.message || 'Upload failed'); }
    finally { setDistribBusy(false); }
  };

  function toast(type, message) {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage({ type:'', message:'' }), 3500);
  }

  /* ========== DETAIL VIEW ========== */
  if (showDetail && selectedFile) {
    return (
      <ThemeWrapper>
        <div className="max-w-6xl mx-auto p-6">
          {statusMessage.message && (
            <div className={`mb-6 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`} style={{ border:`1px solid ${theme.colors.border}` }}>
              <div className="flex items-center">
                {statusMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                <p>{statusMessage.message}</p>
              </div>
            </div>
          )}

          <button onClick={backToList} className="mb-6 flex items-center" style={{ color: theme.colors.primary }}>
            <ChevronLeft className="h-5 w-5 mr-1" /> {translations?.common?.back || 'Back to Files'}
          </button>

          <div className="rounded-lg overflow-hidden shadow" style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom:`1px solid ${theme.colors.border}` }}>
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" style={{ color: theme.colors.primary }} />
                {translations?.resources?.details || 'File Details'}
              </h2>
              <div className="flex gap-2">
                {selectedFile?.public_url && (
                  <>
                    <button
                      onClick={async () => {
                        const ok = await copyToClipboard(selectedFile.public_url);
                        toast(ok ? 'success' : 'error', ok ? 'Public link copied' : 'Copy failed');
                      }}
                      className="px-3 py-1.5 rounded-md text-sm"
                      style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)', color: theme.colors.text }}
                    >
                      <Copy className="h-4 w-4 inline mr-1" /> Copy Link
                    </button>
                    <a
                      href={selectedFile.public_url} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md text-sm"
                      style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)', color: theme.colors.text }}
                    >
                      <LinkIcon className="h-4 w-4 inline mr-1" /> Open
                    </a>
                  </>
                )}
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="px-3 py-1.5 rounded-md text-sm"
                  style={{ background: theme.colors.primary, color:'#fff' }}
                >
                  <Download className="h-4 w-4 inline mr-1" /> Download
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedFile)}
                  className="px-3 py-1.5 rounded-md text-sm"
                  style={{ background:isDark?'#3b0f0f':'#fee2e2', color:isDark?'#fecaca':'#b91c1c', border:`1px solid ${theme.colors.border}` }}
                >
                  <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg p-4" style={{ background:isDark?'#151515':'#f9fafb', border:`1px solid ${theme.colors.border}` }}>
                <h3 className="text-lg font-medium mb-3">File Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">File Name: </span><span className="font-medium break-all">{selectedFile.original_name || '—'}</span></div>
                  <div><span className="text-gray-500">Category: </span><span className="font-medium capitalize">{selectedFile.category || 'Uncategorized'}</span></div>
                  <div><span className="text-gray-500">Type: </span><span className="font-medium">{selectedFile.mime_type || '—'}</span></div>
                  <div><span className="text-gray-500">Size: </span><span className="font-medium">{formatFileSize(selectedFile.size_bytes)}</span></div>
                  <div>
                    <span className="text-gray-500">Uploaded: </span>
                    {(() => {
                      const ts = pickBestTimestamp(selectedFile);
                      return (
                        <span className="font-medium">
                          {formatDate(ts)} <span className="text-xs text-gray-500">({formatTime(ts)})</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ background:isDark?'#151515':'#f9fafb', border:`1px solid ${theme.colors.border}` }}>
                <h3 className="text-lg font-medium mb-3">User Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Farmer ID: </span>
                    <span className="font-medium">{selectedFile.farmer_id ?? '—'}</span>{' '}
                    {selectedFile.farmer_id && (
                      <button onClick={() => router.push(ENDPOINTS.ADMIN_USER(selectedFile.farmer_id))}
                              className="text-xs ml-1" style={{ color: theme.colors.primary }}>
                        View
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Adviser ID: </span>
                    <span className="font-medium">{selectedFile.adviser_id ?? '—'}</span>{' '}
                    {selectedFile.adviser_id && (
                      <button onClick={() => router.push(ENDPOINTS.ADMIN_USER(selectedFile.adviser_id))}
                              className="text-xs ml-1" style={{ color: theme.colors.primary }}>
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {selectedFile.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <div className="rounded-lg p-4" style={{ background:isDark?'#151515':'#f9fafb', border:`1px solid ${theme.colors.border}` }}>
                    <p className="text-sm whitespace-pre-wrap">{selectedFile.notes}</p>
                  </div>
                </div>
              )}

              {selectedFile.mime_type?.startsWith('image/') && resolveFileURL(API_URL, selectedFile) && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-2">Preview</h3>
                  <div className="rounded-lg p-4 flex justify-center" style={{ background:isDark?'#151515':'#f9fafb', border:`1px solid ${theme.colors.border}` }}>
                    <img src={resolveFileURL(API_URL, selectedFile)} alt={selectedFile.original_name || 'image'} className="max-h-96 max-w-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {showDeleteConfirm && selectedFile && (
            <ConfirmDeleteModal
              theme={theme}
              loading={loading}
              name={selectedFile.original_name || selectedFile.notes || getId(selectedFile)}
              onCancel={() => setShowDeleteConfirm(false)}
              onConfirm={confirmDelete}
            />
          )}
        </div>
      </ThemeWrapper>
    );
  }

  /* ========== LIST VIEW ========== */
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto p-6">
        {statusMessage.message && (
          <div className={`mb-6 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
               style={{ border:`1px solid ${theme.colors.border}` }}>
            <div className="flex items-center">
              {statusMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
              <p>{statusMessage.message}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Resources</h1>
            <p className="opacity-75">Manage all user files across dashboards</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAll((v) => !v); }}
              className={`px-4 py-2 rounded-md ${showAll ? 'text-white' : ''}`}
              style={{ background: showAll ? theme.colors.primary : (isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)') }}
              title="Toggle to load every file from all pages"
            >
              {showAll ? 'Showing All' : 'Show All'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-md text-white"
              style={{ background: theme.colors.primary }}
            >
              <Plus className="inline h-4 w-4 mr-1" /> Add / Distribute
            </button>
            <button
              onClick={fetchFiles}
              className="px-4 py-2 rounded-md"
              style={{ background: isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)' }}
            >
              <RefreshCw className="inline h-4 w-4 mr-1" /> Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow mb-6" style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
          <form onSubmit={applyFilters} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text" name="q" value={filters.q} onChange={handleFilterInput}
                    className="w-full rounded-md px-3 py-2"
                    style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
                    placeholder="Name / notes / type…"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 opacity-60" />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Category</label>
                <select
                  name="category" value={filters.category} onChange={handleFilterInput}
                  className="w-full rounded-md px-3 py-2"
                  style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
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
                <label className="block text-sm mb-1">Date From</label>
                <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterInput}
                       className="w-full rounded-md px-3 py-2"
                       style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }} />
              </div>
              <div>
                <label className="block text-sm mb-1">Date To</label>
                <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterInput}
                       className="w-full rounded-md px-3 py-2"
                       style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }} />
              </div>

              {/* Farmer by name -> id */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Farmer (by name)</label>
                <div className="relative">
                  <input
                    type="text" value={farmerNameQ} onChange={(e)=>setFarmerNameQ(e.target.value)}
                    className="w-full rounded-md px-3 py-2"
                    style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
                    placeholder="Type to search farmers…"
                  />
                  {searchingFarmers && <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin opacity-60" />}
                  {farmerNameQ && farmerOpts.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md shadow"
                         style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
                      {farmerOpts.map((u) => {
                        const label = u.username || `${u.first_name||''} ${u.last_name||''}`.trim() || `User ${u.id}`;
                        return (
                          <button key={u.id} type="button"
                                  onClick={() => { setFilters((f)=>({ ...f, farmer_id: String(u.id) })); setFarmerNameQ(label); setFarmerOpts([]); }}
                                  className="w-full text-left px-3 py-2 hover:opacity-80">
                            #{u.id} — {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {filters.farmer_id && (
                  <div className="mt-1 text-xs opacity-75">Filtering by Farmer ID: <strong>#{filters.farmer_id}</strong>{' '}
                    <button type="button" onClick={()=>setFilters((f)=>({ ...f, farmer_id:'' }))}
                            className="ml-1 underline">clear</button>
                  </div>
                )}
              </div>

              {/* Adviser by name -> id */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Adviser (by name)</label>
                <div className="relative">
                  <input
                    type="text" value={adviserNameQ} onChange={(e)=>setAdviserNameQ(e.target.value)}
                    className="w-full rounded-md px-3 py-2"
                    style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
                    placeholder="Type to search advisers…"
                  />
                  {searchingAdvisers && <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin opacity-60" />}
                  {adviserNameQ && adviserOpts.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md shadow"
                         style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
                      {adviserOpts.map((u) => {
                        const label = u.username || `${u.first_name||''} ${u.last_name||''}`.trim() || `User ${u.id}`;
                        return (
                          <button key={u.id} type="button"
                                  onClick={() => { setFilters((f)=>({ ...f, adviser_id: String(u.id) })); setAdviserNameQ(label); setAdviserOpts([]); }}
                                  className="w-full text-left px-3 py-2 hover:opacity-80">
                            #{u.id} — {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {filters.adviser_id && (
                  <div className="mt-1 text-xs opacity-75">Filtering by Adviser ID: <strong>#{filters.adviser_id}</strong>{' '}
                    <button type="button" onClick={()=>setFilters((f)=>({ ...f, adviser_id:'' }))}
                            className="ml-1 underline">clear</button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button" onClick={resetFilters}
                className="px-4 py-2 rounded-md flex items-center"
                style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)' }}
              >
                <X className="h-4 w-4 mr-1" /> Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white flex items-center"
                style={{ background: theme.colors.primary }}
              >
                <Filter className="h-4 w-4 mr-1" /> Apply
              </button>
            </div>
          </form>
        </div>

        {/* list */}
        {loading ? (
          <div className="p-10 text-center rounded-lg"
               style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
            <div className="h-10 w-10 rounded-full border-4 border-t-transparent mx-auto animate-spin" style={{ borderColor: theme.colors.primary }} />
            <p className="mt-3 opacity-75">Loading resources…</p>
          </div>
        ) : err ? (
          <div className="p-6 rounded-lg"
               style={{ background:isDark?'#2b1515':'#fee2e2', border:`1px solid ${theme.colors.border}`, color:isDark?'#fecaca':'#7f1d1d' }}>
            <div className="flex items-center font-semibold mb-1"><AlertTriangle className="h-5 w-5 mr-2" /> Error</div>
            <p>{err}</p>
            <button onClick={fetchFiles}
                    className="mt-4 px-4 py-2 rounded-md text-white"
                    style={{ background: theme.colors.primary }}>
              <RefreshCw className="inline h-4 w-4 mr-1" /> Try Again
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center rounded-lg"
               style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
            <FileText className="h-12 w-12 mx-auto opacity-40 mb-3" />
            <p className="opacity-75">No files found for the current filters.</p>
            <button onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-md text-white"
                    style={{ background: theme.colors.primary }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden shadow"
               style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: theme.colors.border }}>
                <thead>
                  <tr style={{ background: isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)' }}>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme.colors.border }}>
                  {files.map((f) => {
                    const rowId = getId(f);
                    const ts = pickBestTimestamp(f);
                    return (
                      <tr key={rowId} className="hover:opacity-90">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-md flex items-center justify-center"
                                 style={{ background:isDark?'rgba(255,255,255,0.06)':'#f3f4f6' }}>
                              <FileTypeIcon mime={f.mime_type} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium truncate max-w-xs">
                                {editId === rowId ? (
                                  <span className="inline-flex items-center gap-2">
                                    <input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)}
                                           className="px-2 py-1 rounded"
                                           style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }} />
                                    <button onClick={saveRename} disabled={editBusy}
                                            className="px-2 py-1 rounded text-white"
                                            style={{ background: theme.colors.primary }}>
                                      {editBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    </button>
                                    <button onClick={cancelRename}
                                            className="px-2 py-1 rounded"
                                            style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)' }}>
                                      <X className="h-4 w-4" />
                                    </button>
                                  </span>
                                ) : (
                                  <>
                                    {f.notes || f.original_name || 'Untitled'}
                                    <button onClick={()=>beginRename(f)} className="ml-2 opacity-60 hover:opacity-100">
                                      <Pencil className="h-4 w-4 inline-block" />
                                    </button>
                                  </>
                                )}
                              </div>
                              <div className="text-xs opacity-75">{f.mime_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {f.category ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                  style={{ background: isDark?'#1f2937':'#dbeafe', color: isDark?'#93c5fd':'#1e3a8a' }}>
                              {f.category}
                            </span>
                          ) : <span className="text-xs opacity-60">—</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm opacity-80">{formatFileSize(f.size_bytes)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{formatDate(ts)}</div>
                          <div className="text-xs opacity-70">{formatTime(ts)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm opacity-90">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center"><User className="h-3 w-3 mr-1" style={{ color:'#3b82f6' }} /> Farmer: {f.farmer_id ? `#${f.farmer_id}` : '—'}</div>
                            <div className="flex items-center"><User className="h-3 w-3 mr-1" style={{ color:'#10b981' }} /> Adviser: {f.adviser_id ? `#${f.adviser_id}` : '—'}</div>
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
                                className="opacity-80 hover:opacity-100"
                              >
                                <Copy className="h-5 w-5" />
                              </button>
                            )}
                            <button onClick={() => viewFileDetails(f)} title="Details" className="opacity-80 hover:opacity-100">
                              <Eye className="h-5 w-5" />
                            </button>
                            <button onClick={() => downloadFile(f)} title="Download" className="opacity-80 hover:opacity-100">
                              <Download className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(f)} title="Delete" className="opacity-80 hover:opacity-100" style={{ color:'#ef4444' }}>
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

            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop:`1px solid ${theme.colors.border}` }}>
              <div className="text-sm opacity-80">
                {showAll
                  ? <>Showing <span className="font-medium">{files.length}</span> of <span className="font-medium">{total}</span> (all)</>
                  : <>Showing <span className="font-medium">{(page-1)*limit+1}</span>–<span className="font-medium">{Math.min(page*limit,total)}</span> of <span className="font-medium">{total}</span></>}
              </div>

              {!showAll && total > limit && (
                <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage((p)=>Math.max(1,p-1))} disabled={page===1}
                    className="px-2 py-2 rounded-l-md border"
                    style={{ borderColor: theme.colors.border, opacity: page===1?0.5:1 }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_,i)=>{
                    const n = i+1;
                    const active = page===n;
                    return (
                      <button key={n} onClick={()=>setPage(n)}
                              className="px-4 py-2 border text-sm"
                              style={{
                                borderColor: theme.colors.border,
                                background: active ? (isDark?'rgba(255,255,255,0.08)':'#eef2ff') : 'transparent',
                                color: active ? theme.colors.primary : theme.colors.text
                              }}>
                        {n}
                      </button>
                    );
                  })}
                  {totalPages>5 && (
                    <>
                      <span className="px-4 py-2 border text-sm" style={{ borderColor: theme.colors.border }}>…</span>
                      <button onClick={()=>setPage(totalPages)}
                              className="px-4 py-2 border text-sm"
                              style={{ borderColor: theme.colors.border }}>
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setPage((p)=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
                    className="px-2 py-2 rounded-r-md border"
                    style={{ borderColor: theme.colors.border, opacity: page>=totalPages?0.5:1 }}
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
            theme={theme}
            loading={loading}
            name={fileToDelete.original_name || fileToDelete.notes || getId(fileToDelete)}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDelete}
          />
        )}

        {/* Add / Distribute Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.45)' }}
                 onClick={() => { if (!distribBusy) { setShowAddModal(false); resetDistrib(); } }} />
            <div className="relative w-full max-w-3xl mx-4 rounded-lg shadow"
                 style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:`1px solid ${theme.colors.border}` }}>
                <h3 className="text-lg font-semibold">Add / Distribute Resource</h3>
                <button onClick={() => { setShowAddModal(false); resetDistrib(); }} className="p-2 rounded-md hover:opacity-80">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm mb-1">File</label>
                  <input type="file" onChange={(e)=>setDistribFile(e.target.files?.[0]||null)}
                         className="w-full rounded-md px-3 py-2"
                         style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
                         accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
                  {distribFile && <p className="mt-1 text-xs opacity-75">{distribFile.name} • {formatFileSize(distribFile.size)}</p>}
                </div>

                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <select value={distribCategory} onChange={(e)=>setDistribCategory(e.target.value)}
                          className="w-full rounded-md px-3 py-2"
                          style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}>
                    <option value="">Select</option>
                    <option value="soil">Soil</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="photo">Photo</option>
                    <option value="report">Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Notes (optional)</label>
                  <textarea rows={3} value={distribNotes} onChange={(e)=>setDistribNotes(e.target.value)}
                            className="w-full rounded-md px-3 py-2"
                            style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
                            placeholder="Add a label or instructions for recipients…" />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button"
                            onClick={()=>setRoleTab('farmer')}
                            className={`px-3 py-1.5 rounded-md text-sm ${roleTab==='farmer'?'text-white':''}`}
                            style={{ background: roleTab==='farmer'?theme.colors.primary:(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)') }}>
                      Farmers
                    </button>
                    <button type="button"
                            onClick={()=>setRoleTab('adviser')}
                            className={`px-3 py-1.5 rounded-md text-sm ${roleTab==='adviser'?'text-white':''}`}
                            style={{ background: roleTab==='adviser'?theme.colors.primary:(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)') }}>
                      Advisers
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text" value={userSearchQ} onChange={(e)=>setUserSearchQ(e.target.value)}
                      className="flex-1 rounded-md px-3 py-2"
                      style={{ background:'transparent', border:`1px solid ${theme.colors.border}` }}
                      placeholder={`Search ${roleTab}s by name/email…`}
                    />
                    <button onClick={findUsersForDistrib} type="button"
                            className="px-3 py-2 rounded-md"
                            style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)' }}>
                      {userFindBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-2 max-h-40 overflow-auto rounded border" style={{ borderColor: theme.colors.border }}>
                    {userResults.length===0 ? (
                      <div className="p-2 text-sm opacity-70">No results.</div>
                    ) : userResults.map((u)=> {
                      const label = u.username || `${u.first_name||''} ${u.last_name||''}`.trim() || `User ${u.id}`;
                      return (
                        <div key={u.id} className="px-3 py-2 flex items-center justify-between"
                             style={{ borderBottom:`1px solid ${theme.colors.border}` }}>
                          <div className="text-sm">#{u.id} — {label}{u.email ? <span className="opacity-60"> ({u.email})</span> : null}</div>
                          <button type="button"
                                  onClick={()=>addRecipient(u, roleTab)}
                                  className="px-2 py-1 text-xs rounded border hover:opacity-80"
                                  style={{ borderColor: theme.colors.border }}>
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {recipients.length>0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recipients.map((r)=>(
                        <span key={`${r.role}-${r.id}`} className="px-2 py-1 text-xs rounded-full"
                              style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)' }}>
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

              <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop:`1px solid ${theme.colors.border}` }}>
                <button className="px-4 py-2 rounded-md"
                        onClick={()=>{ setShowAddModal(false); resetDistrib(); }}
                        style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)' }}>
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-md text-white disabled:opacity-60"
                        disabled={distribBusy}
                        onClick={uploadAndDistribute}
                        style={{ background: theme.colors.primary }}>
                  {distribBusy ? <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" /> : <Plus className="h-4 w-4 inline mr-1" />}
                  Upload to Dashboards
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeWrapper>
  );
}

/* ---------- Confirm Delete Modal ---------- */
function ConfirmDeleteModal({ theme, loading, name, onCancel, onConfirm }) {
  const isDark = theme.name === 'dark';
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.45)' }} onClick={onCancel} />
      <div className="relative max-w-md mx-auto mt-36 rounded-lg shadow"
           style={{ background: theme.colors.card, border:`1px solid ${theme.colors.border}` }}>
        <div className="px-5 py-4" style={{ borderBottom:`1px solid ${theme.colors.border}` }}>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                 style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#fee2e2' }}>
              <AlertTriangle className="h-6 w-6" style={{ color:'#ef4444' }} />
            </div>
            <h3 className="text-lg font-semibold">Delete File</h3>
          </div>
        </div>
        <div className="px-5 py-4 text-sm">
          Are you sure you want to delete <span className="font-semibold">"{name}"</span>? This action cannot be undone.
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop:`1px solid ${theme.colors.border}` }}>
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 rounded-md"
                  style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-md text-white"
                  style={{ background:'#dc2626' }}>
            {loading ? <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 inline mr-1" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
