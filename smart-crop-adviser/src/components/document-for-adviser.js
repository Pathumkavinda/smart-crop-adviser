'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext'; // Import the language context
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

// Translations for multi-language support
const translations = {
  en: {
    fileLabel: 'File',
    chooseFile: 'Choose file',
    noFileSelected: 'No file selected',
    titleLabel: 'Title (optional)',
    titlePlaceholder: 'e.g., Soil Analysis - 2025 Yala',
    uploadButton: 'Upload',
    acceptedFilesInfo: 'Accepted: PDF, images, Office docs. Linked to Farmer ID:',
    tableHeaders: {
      title: 'Title',
      typeSize: 'Type / Size',
      uploaded: 'Uploaded',
      actions: 'Actions'
    },
    loadingDocuments: 'Loading documents…',
    noDocuments: 'No documents yet.',
    buttonTitles: {
      save: 'Save',
      cancel: 'Cancel',
      viewDownload: 'View / Download',
      rename: 'Rename',
      delete: 'Delete'
    },
    confirmDelete: 'Delete this document?',
    errors: {
      loadFailed: 'Failed to load documents.',
      uploadFailed: 'Upload failed.',
      renameFailed: 'Rename failed.',
      deleteFailed: 'Delete failed.',
      noUrl: 'No file URL available.'
    }
  },
  si: {
    fileLabel: 'ගොනුව',
    chooseFile: 'ගොනුව තෝරන්න',
    noFileSelected: 'ගොනුවක් තෝරා නැත',
    titleLabel: 'මාතෘකාව (විකල්ප)',
    titlePlaceholder: 'උදා:, පස විශ්ලේෂණය - 2025 යල',
    uploadButton: 'උඩුගත කරන්න',
    acceptedFilesInfo: 'පිළිගත හැකි: PDF, රූප, Office ලේඛන. ගොවි හඳුනා අංකය සමඟ සම්බන්ධයි:',
    tableHeaders: {
      title: 'මාතෘකාව',
      typeSize: 'වර්ගය / ප්‍රමාණය',
      uploaded: 'උඩුගත කළ දිනය',
      actions: 'ක්‍රියාමාර්ග'
    },
    loadingDocuments: 'ලේඛන පූරණය වෙමින්…',
    noDocuments: 'තවම ලේඛන නැත.',
    buttonTitles: {
      save: 'සුරකින්න',
      cancel: 'අවලංගු කරන්න',
      viewDownload: 'බලන්න / බාගන්න',
      rename: 'නම වෙනස් කරන්න',
      delete: 'මකන්න'
    },
    confirmDelete: 'මෙම ලේඛනය මකන්නද?',
    errors: {
      loadFailed: 'ලේඛන පූරණය කිරීම අසාර්ථක විය.',
      uploadFailed: 'උඩුගත කිරීම අසාර්ථක විය.',
      renameFailed: 'නම වෙනස් කිරීම අසාර්ථක විය.',
      deleteFailed: 'මැකීම අසාර්ථක විය.',
      noUrl: 'ගොනු URL ලබාගත නොහැක.'
    }
  },
  ta: {
    fileLabel: 'கோப்பு',
    chooseFile: 'கோப்பைத் தேர்வுசெய்க',
    noFileSelected: 'கோப்பு தேர்ந்தெடுக்கப்படவில்லை',
    titleLabel: 'தலைப்பு (விருப்பத்தேர்வு)',
    titlePlaceholder: 'எ.கா., மண் பகுப்பாய்வு - 2025 யாலா',
    uploadButton: 'பதிவேற்றுக',
    acceptedFilesInfo: 'ஏற்றுக்கொள்ளப்படுபவை: PDF, படங்கள், Office ஆவணங்கள். விவசாயி ID உடன் இணைக்கப்பட்டுள்ளது:',
    tableHeaders: {
      title: 'தலைப்பு',
      typeSize: 'வகை / அளவு',
      uploaded: 'பதிவேற்றப்பட்டது',
      actions: 'செயல்கள்'
    },
    loadingDocuments: 'ஆவணங்கள் ஏற்றப்படுகின்றன…',
    noDocuments: 'இதுவரை ஆவணங்கள் இல்லை.',
    buttonTitles: {
      save: 'சேமி',
      cancel: 'ரத்துசெய்',
      viewDownload: 'காண்க / பதிவிறக்கம்',
      rename: 'மறுபெயரிடு',
      delete: 'நீக்கு'
    },
    confirmDelete: 'இந்த ஆவணத்தை நீக்கவா?',
    errors: {
      loadFailed: 'ஆவணங்களை ஏற்றுவதில் தோல்வி.',
      uploadFailed: 'பதிவேற்றம் தோல்வியடைந்தது.',
      renameFailed: 'மறுபெயரிடல் தோல்வியடைந்தது.',
      deleteFailed: 'நீக்குதல் தோல்வியடைந்தது.',
      noUrl: 'கோப்பு URL கிடைக்கவில்லை.'
    }
  }
};

export default function DocumentsForAdvisers({
  apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  adviserId,
  farmerId,
  farmer,
  readOnly = false,
  language = 'en', // Add language prop with default
}) {
  const base = apiBase?.replace(/\/+$/, '') || '';
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const { language: contextLanguage } = useLanguage(); // Use language from context if available
  
  // Use language from props or context (whichever is available)
  const currentLanguage = language || contextLanguage || 'en';
  const trans = translations[currentLanguage] || translations.en;

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

  // Get text style based on language
  const getTextStyle = (s = {}) => ({ 
    ...s, 
    lineHeight: currentLanguage === 'si' ? 1.7 : currentLanguage === 'ta' ? 1.8 : 1.5 
  });

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
      setErr(trans.errors.loadFailed);
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
      setErr(trans.errors.uploadFailed);
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
      setErr(trans.errors.renameFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm(trans.confirmDelete)) return;
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
      setErr(trans.errors.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  function openDoc(doc) {
    const url = resolveFileURL(base, doc);
    if (!url) return alert(trans.errors.noUrl);
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
              <label className="text-sm" style={{...textMuted, ...getTextStyle()}}>{trans.fileLabel}</label>
              <div className="mt-1 flex items-center gap-2">
                <label className="px-3 py-2 rounded-md cursor-pointer hover:opacity-90"
                       style={{ backgroundColor: 'transparent', ...themedBorder }}>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <span className="inline-flex items-center gap-2" style={getTextStyle()}>
                    <ImageIcon size={16} /> {trans.chooseFile}
                  </span>
                </label>
                <div className="text-sm truncate max-w-[220px]" style={getTextStyle()}>
                  {file ? file.name : <span style={{...textMuted, ...getTextStyle()}}>{trans.noFileSelected}</span>}
                </div>
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="text-sm" style={{...textMuted, ...getTextStyle()}}>{trans.titleLabel}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md bg-transparent outline-none"
                style={{ ...themedBorder }}
                placeholder={trans.titlePlaceholder}
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
                <span style={getTextStyle()}>{trans.uploadButton}</span>
              </button>
            </div>
          </div>

          <div className="mt-2 text-xs" style={{...textMuted, ...getTextStyle()}}>
            {trans.acceptedFilesInfo} <strong>{farmerId ?? '—'}</strong>
          </div>
        </form>
      )}

      {/* Error banner */}
      {err && (
        <div className="mb-3 text-sm px-3 py-2 rounded"
             style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#ef4444', ...themedBorder, ...getTextStyle() }}>
          {err}
        </div>
      )}

      {/* Listing */}
      <div className="rounded-md overflow-hidden" style={{ ...themedBorder }}>
        <div className="grid grid-cols-12 px-3 py-2 text-sm"
             style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <div className="col-span-5" style={getTextStyle()}>{trans.tableHeaders.title}</div>
          <div className="col-span-3" style={getTextStyle()}>{trans.tableHeaders.typeSize}</div>
          <div className="col-span-3" style={getTextStyle()}>{trans.tableHeaders.uploaded}</div>
          <div className="col-span-1 text-right" style={getTextStyle()}>{trans.tableHeaders.actions}</div>
        </div>

        {loading ? (
          <div className="p-6 flex items-center gap-2 text-sm" style={{...textMuted, ...getTextStyle()}}>
            <Loader2 size={16} className="animate-spin" /> {trans.loadingDocuments}
          </div>
        ) : docs.length === 0 ? (
          <div className="p-6 text-sm" style={{...textMuted, ...getTextStyle()}}>
            {trans.noDocuments}
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
                        title={trans.buttonTitles.save}
                      >
                        <Save size={16} />
                      </button>
                      <button
                        className="px-2 py-1 rounded"
                        style={themedBorder}
                        onClick={() => { setEditId(null); setEditTitle(''); }}
                        title={trans.buttonTitles.cancel}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <div className="truncate" style={getTextStyle()}>{d.title}</div>
                    </div>
                  )}
                </div>

                {/* Type / Size */}
                <div className="col-span-3 pr-2 text-sm" style={{...textMuted, ...getTextStyle()}}>
                  {(d.mimetype || '—')}{d.size ? ` • ${(d.size/1024/1024).toFixed(2)} MB` : ''}
                </div>

                {/* Uploaded date */}
                <div className="col-span-3 pr-2 text-sm" style={{...textMuted, ...getTextStyle()}}>
                  {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button
                    className="px-2 py-1 rounded"
                    style={themedBorder}
                    onClick={() => openDoc(d)}
                    title={trans.buttonTitles.viewDownload}
                  >
                    <Download size={16} />
                  </button>

                  {canWrite && (
                    <>
                      <button
                        className="px-2 py-1 rounded"
                        style={themedBorder}
                        onClick={() => { setEditId(d.id); setEditTitle(d.title || ''); }}
                        title={trans.buttonTitles.rename}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="px-2 py-1 rounded text-red-400 hover:text-red-500"
                        style={themedBorder}
                        onClick={() => handleDelete(d.id)}
                        title={trans.buttonTitles.delete}
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