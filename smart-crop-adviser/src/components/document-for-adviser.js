'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Download, Pencil, Trash2, Plus, Save, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';

const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };
const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});
const getToken = () => (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

// Try to infer a usable URL for viewing/downloading
function resolveFileURL(apiBase, doc) {
  // Prefer explicit URLs from the backend
  if (doc.public_url) return doc.public_url;
  if (doc.file_url) return doc.file_url;
  if (doc.url) return doc.url;
  if (doc.download_url) return doc.download_url;

  // If backend gives a stored file name, use the served static path
  if (doc.stored_name) {
    const base = apiBase?.replace(/\/+$/, '') || '';
    return `${base}/uploads/user_files/${doc.stored_name}`;
  }
  // If backend returns a path like 'uploads/xyz.pdf' or '/uploads/xyz.pdf'
  if (doc.path || doc.filepath) {
    const base = apiBase?.replace(/\/+$/, '') || '';
    const p = (doc.path || doc.filepath).replace(/^\/+/, '');
    return `${base}/${p}`;
  }
  return null;
}

export default function DocumentsForAdvisers({
  apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  adviserId,
  farmerId,
  farmer,
  readOnly = false,
}) {
  const base = apiBase?.replace(/\/+$/, '') || '';
  const { theme } = useTheme();
  const { user: authUser } = useAuth();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Upload form
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  // Inline rename state
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const canWrite = !readOnly;

  const themedBorder = useMemo(() => ({ border: `1px solid ${theme.colors.border}` }), [theme]);
  const textMuted = { opacity: 0.75 };

  async function fetchDocs() {
    if (!farmerId) {
      setDocs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const token = getToken();

      // Prefer dedicated by-farmer endpoint
      let res = await fetch(`${base}/api/v1/user-files/farmer/${encodeURIComponent(farmerId)}?limit=100`, {
        headers: { ...authHeader(token) }
      });

      // Fallback to query-style list if needed
      if (!res.ok) {
        res = await fetch(`${base}/api/v1/user-files?farmer_id=${encodeURIComponent(farmerId)}&limit=100`, {
          headers: { ...authHeader(token) }
        });
        if (!res.ok) throw new Error(`List failed: ${res.status}`);
      }

      const body = await safeJSON(res);
      const list = body?.items ?? body?.data ?? body ?? [];

      // Normalize to the UI shape
      const shaped = list.map((d) => ({
        id: d.id ?? d.doc_id ?? d._id,
        // Display title = notes (user label) or fallback to original filename
        title: d.notes ?? d.title ?? d.name ?? d.original_name ?? 'Untitled',
        size: d.size_bytes ?? d.size ?? d.filesize ?? null,
        mimetype: d.mime_type ?? d.mimetype ?? d.type ?? null,
        created_at: d.created_at ?? d.uploaded_at ?? d.createdAt ?? null,
        updated_at: d.updated_at ?? d.updatedAt ?? null,
        public_url: d.public_url ?? null,
        stored_name: d.stored_name ?? null,
        path: d.path ?? d.filepath ?? null,
        farmer_id: d.farmer_id ?? d.user_id ?? null,
        adviser_id: d.adviser_id ?? d.owner_id ?? null,
        category: d.category ?? null,
        notes: d.notes ?? null,
        original_name: d.original_name ?? null,
      }));
      setDocs(shaped);
    } catch (e) {
      console.error(e);
      setErr('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDocs(); /* eslint-disable-next-line */ }, [farmerId, base]);

  async function handleUpload(e) {
    e?.preventDefault?.();
    if (!file || !farmerId) return;

    setBusy(true);
    setErr('');
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      // Backend uses notes for user-provided label; original_name comes from the actual file
      if (title) fd.append('notes', title);
      fd.append('farmer_id', farmerId);
      if (adviserId) fd.append('adviser_id', adviserId);

      const res = await fetch(`${base}/api/v1/user-files`, {
        method: 'POST',
        headers: { ...authHeader(token) }, // Do not set Content-Type for FormData
        body: fd,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      setFile(null);
      setTitle('');
      await fetchDocs();
    } catch (e) {
      console.error(e);
      setErr('Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(id) {
    setBusy(true);
    setErr('');
    try {
      const token = getToken();
      // We treat the inline title as a user label -> update 'notes'
      const res = await fetch(`${base}/api/v1/user-files/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(token),
        },
        body: JSON.stringify({ notes: editTitle }),
      });
      if (!res.ok) throw new Error(`Rename failed: ${res.status}`);
      setEditId(null);
      setEditTitle('');
      await fetchDocs();
    } catch (e) {
      console.error(e);
      setErr('Rename failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document?')) return;
    setBusy(true);
    setErr('');
    try {
      const token = getToken();
      const res = await fetch(`${base}/api/v1/user-files/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader(token) },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await fetchDocs();
    } catch (e) {
      console.error(e);
      setErr('Delete failed.');
    } finally {
      setBusy(false);
    }
  }

  function openDoc(doc) {
    const url = resolveFileURL(base, doc);
    if (!url) return alert('No file URL available.');
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      {/* Uploader (hidden for Farmer/readOnly) */}
      {canWrite && (
        <form onSubmit={handleUpload} className="rounded-md p-4 mb-4"
              style={{ backgroundColor: theme.colors.background, ...themedBorder }}>
          <div className="grid sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="text-sm" style={textMuted}>File</label>
              <div className="mt-1 flex items-center gap-2">
                <label className="px-3 py-2 rounded-md cursor-pointer hover:opacity-90"
                       style={{ backgroundColor: 'transparent', ...themedBorder }}>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon size={16} /> Choose file
                  </span>
                </label>
                <div className="text-sm truncate max-w-[220px]">
                  {file ? file.name : <span style={textMuted}>No file selected</span>}
                </div>
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="text-sm" style={textMuted}>Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md bg-transparent outline-none"
                style={{ ...themedBorder }}
                placeholder="e.g., Soil Analysis - 2025 Yala"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={!file || busy || !farmerId}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-white disabled:opacity-60"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Upload
              </button>
            </div>
          </div>

          <div className="mt-2 text-xs" style={textMuted}>
            Accepted: PDF, images, Office docs. Linked to Farmer ID: <strong>{farmerId ?? '—'}</strong>
          </div>
        </form>
      )}

      {/* Error banner */}
      {err && (
        <div className="mb-3 text-sm px-3 py-2 rounded"
             style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#ef4444', ...themedBorder }}>
          {err}
        </div>
      )}

      {/* Listing */}
      <div className="rounded-md overflow-hidden" style={{ ...themedBorder }}>
        <div className="grid grid-cols-12 px-3 py-2 text-sm"
             style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Type / Size</div>
          <div className="col-span-3">Uploaded</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 flex items-center gap-2 text-sm" style={textMuted}>
            <Loader2 size={16} className="animate-spin" /> Loading documents…
          </div>
        ) : docs.length === 0 ? (
          <div className="p-6 text-sm" style={textMuted}>
            No documents yet.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: theme.colors.border }}>
            {docs.map((d) => (
              <li key={d.id} className="grid grid-cols-12 items-center px-3 py-2">
                {/* Title (or inline editor) */}
                <div className="col-span-5 pr-2">
                  {editId === d.id && canWrite ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-transparent outline-none"
                        style={themedBorder}
                      />
                      <button
                        className="px-2 py-1 rounded text-white"
                        style={{ backgroundColor: theme.colors.primary }}
                        onClick={() => handleRename(d.id)}
                        title="Save"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        className="px-2 py-1 rounded"
                        style={themedBorder}
                        onClick={() => { setEditId(null); setEditTitle(''); }}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <div className="truncate">{d.title}</div>
                    </div>
                  )}
                </div>

                {/* Type / Size */}
                <div className="col-span-3 pr-2 text-sm" style={textMuted}>
                  {(d.mimetype || '—')}{d.size ? ` • ${(d.size/1024/1024).toFixed(2)} MB` : ''}
                </div>

                {/* Uploaded date */}
                <div className="col-span-3 pr-2 text-sm" style={textMuted}>
                  {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button
                    className="px-2 py-1 rounded"
                    style={themedBorder}
                    onClick={() => openDoc(d)}
                    title="View / Download"
                  >
                    <Download size={16} />
                  </button>

                  {canWrite && (
                    <>
                      <button
                        className="px-2 py-1 rounded"
                        style={themedBorder}
                        onClick={() => { setEditId(d.id); setEditTitle(d.title || ''); }}
                        title="Rename"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="px-2 py-1 rounded text-red-400 hover:text-red-500"
                        style={themedBorder}
                        onClick={() => handleDelete(d.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
