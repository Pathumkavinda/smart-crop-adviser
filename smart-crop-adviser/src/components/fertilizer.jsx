"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Trash2, Plus, Edit, X, Save, AlertTriangle, Leaf } from "lucide-react";

// ---------- utils ----------
const fmtDate = (d) => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString(); } catch { return "-"; }
};

const DatePicker = ({ value, onChange, label, isDark, error }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <CalendarIcon className="h-5 w-5" style={{ color: isDark ? "#aaa" : "#666" }} />
      </div>
      <input
        type="date"
        value={value ? new Date(value).toISOString().split("T")[0] : ""}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="pl-10 pr-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white",
          borderColor: error ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
          color: isDark ? "#eee" : "#333",
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  </div>
);

// ---------- component ----------
export default function Fertilizer({
  apiBase = "http://localhost:3001",
  userId = null,
  fertilizers = [], // parent state (optional)
  setFertilizers = () => {},
  theme = { colors: {} },
  isDark = false,
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cultivations, setCultivations] = useState([]); // for crop dropdown

  // ---- form (match backend fields exactly) ----
  const [formData, setFormData] = useState({
    user_id: userId,
    crop: "", // string
    fertilizer_name: "",
    fertilizer_type: "",
    application_date: new Date(),
    next_application_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    quantity: "",
    application_method: "",
    location: "",
    land_size: "",
    note: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.crop) e.crop = "Crop is required";
    if (!formData.fertilizer_name) e.fertilizer_name = "Fertilizer name is required";
    if (!formData.fertilizer_type) e.fertilizer_type = "Fertilizer type is required";
    if (!formData.application_date) e.application_date = "Application date is required";
    if (formData.next_application_date && formData.application_date && new Date(formData.next_application_date) <= new Date(formData.application_date)) {
      e.next_application_date = "Next application must be after application date";
    }
    setValidationErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setFormData({
      user_id: userId,
      crop: "",
      fertilizer_name: "",
      fertilizer_type: "",
      application_date: new Date(),
      next_application_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      quantity: "",
      application_method: "",
      location: "",
      land_size: "",
      note: "",
    });
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value && validationErrors[name]) {
      setValidationErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }

    // If user chose a cultivation id from the dropdown, auto-fill fields
    if (name === "crop" && value && value.startsWith("id:")) {
      const id = value.replace("id:", "");
      const c = cultivations.find((c) => String(c.id) === String(id));
      if (c) {
        setFormData((prev) => ({
          ...prev,
          crop: c.crop,
          location: c.location || prev.location,
          land_size: c.land_size || prev.land_size,
          // keep other fields
        }));
      }
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setIsEditingId(null);
    resetForm();
  };

  // ---------- API calls (match your routes) ----------
  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFertilizers = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/fertilizers?user_id=${encodeURIComponent(userId)}`, {
        headers: { ...authHeader() },
        cache: "no-store", // avoid 304 w/o body
      });
      if (!res.ok && res.status !== 304) throw new Error(`HTTP ${res.status}`);
      if (res.status === 304) return; // nothing changed
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      setFertilizers(list.filter((f) => String(f.user_id) === String(userId)));
    } catch (err) {
      console.error("fetchFertilizers error", err);
      setError("Failed to load fertilizer applications");
    } finally { setLoading(false); }
  }, [apiBase, userId, setFertilizers]);

  const fetchCultivations = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiBase}/api/v1/cultivations?user_id=${encodeURIComponent(userId)}`, {
        headers: { ...authHeader() },
        cache: "no-store",
      });
      if (!res.ok && res.status !== 304) throw new Error(`HTTP ${res.status}`);
      if (res.status === 304) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      setCultivations(list);
    } catch (err) {
      console.error("fetchCultivations error", err);
    }
  }, [apiBase, userId]);

  useEffect(() => { fetchCultivations(); fetchFertilizers(); }, [fetchCultivations, fetchFertilizers]);

  // CREATE
  const addFertilizer = async () => {
    if (!validate()) return;
    try {
      setLoading(true); setError("");
      const payload = {
        user_id: userId,
        crop: formData.crop, // string
        fertilizer_name: formData.fertilizer_name,
        fertilizer_type: formData.fertilizer_type,
        application_date: new Date(formData.application_date).toISOString(),
        next_application_date: formData.next_application_date ? new Date(formData.next_application_date).toISOString() : null,
        quantity: formData.quantity || null,
        application_method: formData.application_method || null,
        location: formData.location || null,
        land_size: formData.land_size || null,
        note: formData.note || null,
      };

      const res = await fetch(`${apiBase}/api/v1/fertilizers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.error || "Failed to add fertilizer");
      }
      const created = await res.json();
      setFertilizers((prev) => [...prev, created]);
      setSuccessMessage("Fertilizer application added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsAddingNew(false);
      resetForm();
    } catch (err) {
      console.error("addFertilizer error", err);
      setError(String(err.message || err));
    } finally { setLoading(false); }
  };

  // UPDATE
  const updateFertilizer = async () => {
    if (!validate() || !isEditingId) return;
    try {
      setLoading(true); setError("");
      const payload = {
        user_id: userId,
        crop: formData.crop,
        fertilizer_name: formData.fertilizer_name,
        fertilizer_type: formData.fertilizer_type,
        application_date: new Date(formData.application_date).toISOString(),
        next_application_date: formData.next_application_date ? new Date(formData.next_application_date).toISOString() : null,
        quantity: formData.quantity || null,
        application_method: formData.application_method || null,
        location: formData.location || null,
        land_size: formData.land_size || null,
        note: formData.note || null,
      };
      const res = await fetch(`${apiBase}/api/v1/fertilizers/${isEditingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.error || "Failed to update fertilizer");
      }
      const updated = await res.json();
      setFertilizers((prev) => prev.map((x) => (String(x.id) === String(isEditingId) ? updated : x)));
      setSuccessMessage("Fertilizer application updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsEditingId(null);
      resetForm();
    } catch (err) {
      console.error("updateFertilizer error", err);
      setError(String(err.message || err));
    } finally { setLoading(false); }
  };

  // DELETE
  const deleteFertilizer = async (id) => {
    if (!window.confirm("Delete this fertilizer record?")) return;
    try {
      setLoading(true); setError("");
      const res = await fetch(`${apiBase}/api/v1/fertilizers/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.error || "Failed to delete fertilizer");
      }
      setFertilizers((prev) => prev.filter((x) => String(x.id) !== String(id)));
      setSuccessMessage("Fertilizer application deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("deleteFertilizer error", err);
      setError(String(err.message || err));
    } finally { setLoading(false); }
  };

  // edit start
  const startEditing = (row) => {
    setIsEditingId(row.id);
    setFormData({
      user_id: userId,
      crop: row.crop || "",
      fertilizer_name: row.fertilizer_name || "",
      fertilizer_type: row.fertilizer_type || "",
      application_date: row.application_date ? new Date(row.application_date) : new Date(),
      next_application_date: row.next_application_date ? new Date(row.next_application_date) : "",
      quantity: row.quantity ?? "",
      application_method: row.application_method || "",
      location: row.location || "",
      land_size: row.land_size || "",
      note: row.note || "",
    });
  };

  // submit
  const onSubmit = (e) => {
    e.preventDefault();
    if (isEditingId) updateFertilizer(); else addFertilizer();
  };

  // ---------- UI ----------
  if (loading && !isAddingNew && !isEditingId && fertilizers.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.1)", color: isDark ? "#F87171" : "#DC2626", border: `1px solid ${isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.2)"}` }}>
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: isDark ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.1)", color: isDark ? "#4ADE80" : "#22C55E", border: `1px solid ${isDark ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.2)"}` }}>
          <p>{successMessage}</p>
        </div>
      )}

      {!isAddingNew && !isEditingId && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsAddingNew(true)} className="flex items-center px-4 py-2 rounded-md text-white" style={{ backgroundColor: theme.colors.primary }}>
            <Plus className="h-4 w-4 mr-2" /> Add Fertilizer Application
          </button>
        </div>
      )}

      {(isAddingNew || isEditingId) && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ color: isDark ? "#eee" : "#333" }}>{isEditingId ? "Edit Fertilizer Application" : "Add New Fertilizer Application"}</h3>
            <button onClick={handleCancel} className="p-1 rounded-full hover:bg-opacity-10" style={{ color: isDark ? "#aaa" : "#666", backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crop selector: show cultivations if any; otherwise free text */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>
                  Crop {validationErrors.crop && <span className="text-red-500">*</span>}
                </label>
                {cultivations.length > 0 ? (
                  <select name="crop" value={formData.crop.startsWith("id:") ? formData.crop : formData.crop} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: validationErrors.crop ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }}>
                    <option value="">Select crop</option>
                    {cultivations.map((c) => (
                      <option key={c.id} value={`id:${c.id}`}>{c.crop} {c.location ? `(${c.location})` : ""}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" name="crop" value={formData.crop} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: validationErrors.crop ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }} placeholder="e.g., Rice" />
                )}
                {validationErrors.crop && <p className="mt-1 text-xs text-red-500">{validationErrors.crop}</p>}
              </div>

              {/* Fertilizer name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>
                  Fertilizer Name {validationErrors.fertilizer_name && <span className="text-red-500">*</span>}
                </label>
                <input type="text" name="fertilizer_name" value={formData.fertilizer_name} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: validationErrors.fertilizer_name ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }} placeholder="e.g., NPK 10-10-10" />
                {validationErrors.fertilizer_name && <p className="mt-1 text-xs text-red-500">{validationErrors.fertilizer_name}</p>}
              </div>

              {/* Fertilizer type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>
                  Fertilizer Type {validationErrors.fertilizer_type && <span className="text-red-500">*</span>}
                </label>
                <select name="fertilizer_type" value={formData.fertilizer_type} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: validationErrors.fertilizer_type ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }}>
                  <option value="">Select type</option>
                  <option value="nitrogen">Nitrogen (N)</option>
                  <option value="phosphorus">Phosphorus (P)</option>
                  <option value="potassium">Potassium (K)</option>
                  <option value="npk">NPK Compound</option>
                  <option value="organic">Organic</option>
                  <option value="micronutrient">Micronutrient</option>
                  <option value="foliar">Foliar</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Dates */}
              <DatePicker value={formData.application_date} onChange={(d) => setFormData((p) => ({ ...p, application_date: d }))} label="Application Date" isDark={isDark} error={validationErrors.application_date} />
              <DatePicker value={formData.next_application_date} onChange={(d) => setFormData((p) => ({ ...p, next_application_date: d }))} label="Next Application Date" isDark={isDark} error={validationErrors.next_application_date} />

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>Quantity</label>
                <input type="number" step="0.01" min="0" name="quantity" value={formData.quantity} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }} placeholder="e.g., 25" />
              </div>

              {/* Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>Application Method</label>
                <select name="application_method" value={formData.application_method} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }}>
                  <option value="">Select method</option>
                  <option value="broadcast">Broadcast</option>
                  <option value="banded">Banded</option>
                  <option value="foliar_spray">Foliar Spray</option>
                  <option value="drip">Drip Irrigation</option>
                  <option value="fertigation">Fertigation</option>
                  <option value="side_dress">Side Dress</option>
                  <option value="top_dress">Top Dress</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Location & land size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }} placeholder="Field / block" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>Land Size</label>
                <input type="text" name="land_size" value={formData.land_size} onChange={handleChange} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }} placeholder="e.g., 1.2 ha" />
              </div>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: isDark ? "#ddd" : "#333" }}>Notes</label>
              <textarea name="note" value={formData.note} onChange={handleChange} rows={3} className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#eee" : "#333" }} placeholder="Optional notes" />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-md border" style={{ backgroundColor: "transparent", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#ddd" : "#333" }} disabled={loading}>Cancel</button>
              <button type="submit" className="flex items-center px-4 py-2 rounded-md text-white" style={{ backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />) : (<Save className="h-4 w-4 mr-2" />)}
                {isEditingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!isAddingNew && !isEditingId && (
        <>
          {(!fertilizers || fertilizers.length === 0) ? (
            <div className="text-center py-8 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`, color: isDark ? "#aaa" : "#666" }}>
              <p>No fertilizer applications found</p>
              <button onClick={() => setIsAddingNew(true)} className="mt-2 text-sm" style={{ color: theme.colors.primary }}>Add your first fertilizer application</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {fertilizers
                .sort((a, b) => new Date(b.application_date) - new Date(a.application_date))
                .map((row) => (
                  <div key={row.id} className="p-4 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Leaf className="h-5 w-5 mr-2" style={{ color: isDark ? "#60A5FA" : "#3B82F6" }} />
                          <h3 className="text-lg font-medium" style={{ color: isDark ? "#eee" : "#333" }}>{row.fertilizer_name}</h3>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Crop</p>
                            <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{row.crop}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Location</p>
                            <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{row.location || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Applied</p>
                            <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{fmtDate(row.application_date)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Next Application</p>
                            <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{fmtDate(row.next_application_date)}</p>
                          </div>
                          {row.quantity != null && (
                            <div>
                              <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Quantity</p>
                              <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{row.quantity}</p>
                            </div>
                          )}
                          {row.application_method && (
                            <div>
                              <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Method</p>
                              <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{row.application_method.replace(/_/g, " ")}</p>
                            </div>
                          )}
                        </div>
                        {row.note && (
                          <div className="mt-2">
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>Notes</p>
                            <p className="text-sm" style={{ color: isDark ? "#ddd" : "#333" }}>{row.note}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-1">
                        <button onClick={() => startEditing(row)} className="p-1 rounded hover:bg-opacity-10" style={{ color: theme.colors.primary, backgroundColor: isDark ? `${theme.colors.primary}20` : `${theme.colors.primary}10` }} title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteFertilizer(row.id)} className="p-1 rounded hover:bg-opacity-10" style={{ color: "#EF4444", backgroundColor: isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.1)" }} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
