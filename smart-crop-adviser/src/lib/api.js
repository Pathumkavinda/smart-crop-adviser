export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return res.json();
}

// --- Admin endpoints (adjust paths to match your backend) ---
export const getAdminSummary = () => req('/api/v1/admin/summary');
// { users: {total, byRole:{farmer,advisor,admin}}, predictions:{thisMonth,lastMonth,monthlySeries:[...]}, crops:{list:[...]}, prices:[...], model:{version,updated_at,train_acc,val_acc,dataset_size}}

export const getUsers = (query='') => req(`/api/v1/users${query ? `?${query}` : ''}`);
// supports ?role=&status=&q=&page=&limit=

export const getPredictionHistory = (query='') => req(`/api/v1/prediction-history${query ? `?${query}` : ''}`);
// supports ?crop_name=&status=&q=&date_from=&date_to=&page=&limit=

export const getCropPrices = () => req('/api/v1/crop-prices');
export const getCrops = () => req('/api/v1/crops');

export const upsertCropPrice = (body) => req('/api/v1/crop-prices', { method:'POST', body: JSON.stringify(body) });
export const deleteCropPrice = (id) => req(`/api/v1/crop-prices/${id}`, { method:'DELETE' });

export const exportModel = () => req('/api/v1/model/export');
export const updateModel = (formData) =>
  fetch(`${API_BASE}/api/v1/model`, { method:'POST', body: formData }).then(r => {
    if (!r.ok) throw new Error('Model upload failed'); return r.json();
  });
