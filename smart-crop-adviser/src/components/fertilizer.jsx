"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext"; // Import the language context
import { Calendar as CalendarIcon, Trash2, Plus, Edit, X, Save, AlertTriangle, Leaf } from "lucide-react";

// ---------- utils ----------
const fmtDate = (d) => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString(); } catch { return "-"; }
};

// Translations for multi-language support
const translations = {
  en: {
    addFertilizer: "Add Fertilizer Application",
    editFertilizer: "Edit Fertilizer Application",
    addNewFertilizer: "Add New Fertilizer Application",
    cancel: "Cancel",
    save: "Save",
    update: "Update",
    noFertilizersFound: "No fertilizer applications found",
    addFirstFertilizer: "Add your first fertilizer application",
    confirmDelete: "Delete this fertilizer record?",
    labels: {
      crop: "Crop",
      cropPlaceholder: "e.g., Rice",
      selectCrop: "Select crop",
      fertilizerName: "Fertilizer Name",
      fertilizerNamePlaceholder: "e.g., NPK 10-10-10",
      fertilizerType: "Fertilizer Type",
      selectType: "Select type",
      applicationDate: "Application Date",
      nextApplicationDate: "Next Application Date",
      quantity: "Quantity",
      quantityPlaceholder: "e.g., 25",
      applicationMethod: "Application Method",
      selectMethod: "Select method",
      location: "Location",
      locationPlaceholder: "Field / block",
      landSize: "Land Size",
      landSizePlaceholder: "e.g., 1.2 ha",
      notes: "Notes",
      notesPlaceholder: "Optional notes"
    },
    types: {
      nitrogen: "Nitrogen (N)",
      phosphorus: "Phosphorus (P)",
      potassium: "Potassium (K)",
      npk: "NPK Compound",
      organic: "Organic",
      micronutrient: "Micronutrient",
      foliar: "Foliar",
      other: "Other"
    },
    methods: {
      broadcast: "Broadcast",
      banded: "Banded",
      foliar_spray: "Foliar Spray",
      drip: "Drip Irrigation",
      fertigation: "Fertigation",
      side_dress: "Side Dress",
      top_dress: "Top Dress",
      other: "Other"
    },
    tableHeaders: {
      crop: "Crop",
      location: "Location",
      applied: "Applied",
      nextApplication: "Next Application",
      quantity: "Quantity",
      method: "Method",
      notes: "Notes"
    },
    validation: {
      cropRequired: "Crop is required",
      fertilizerNameRequired: "Fertilizer name is required",
      fertilizerTypeRequired: "Fertilizer type is required",
      applicationDateRequired: "Application date is required",
      nextAfterCurrent: "Next application must be after application date"
    },
    errors: {
      loadFailed: "Failed to load fertilizer applications",
      addFailed: "Failed to add fertilizer",
      updateFailed: "Failed to update fertilizer",
      deleteFailed: "Failed to delete fertilizer"
    },
    success: {
      added: "Fertilizer application added successfully",
      updated: "Fertilizer application updated successfully",
      deleted: "Fertilizer application deleted successfully"
    }
  },
  
  // Sinhala translations
  si: {
    addFertilizer: "පොහොර යෙදීම එක් කරන්න",
    editFertilizer: "පොහොර යෙදීම සංස්කරණය කරන්න",
    addNewFertilizer: "නව පොහොර යෙදීමක් එක් කරන්න",
    cancel: "අවලංගු කරන්න",
    save: "සුරකින්න",
    update: "යාවත්කාලීන කරන්න",
    noFertilizersFound: "පොහොර යෙදීම් කිසිවක් හමු නොවීය",
    addFirstFertilizer: "ඔබගේ පළමු පොහොර යෙදීම එකතු කරන්න",
    confirmDelete: "මෙම පොහොර යෙදීමේ වාර්තාව මකන්නද?",
    labels: {
      crop: "බෝගය",
      cropPlaceholder: "උදා:, සහල්",
      selectCrop: "බෝගය තෝරන්න",
      fertilizerName: "පොහොර නම",
      fertilizerNamePlaceholder: "උදා:, NPK 10-10-10",
      fertilizerType: "පොහොර වර්ගය",
      selectType: "වර්ගය තෝරන්න",
      applicationDate: "යෙදූ දිනය",
      nextApplicationDate: "ඊළඟ යෙදීමේ දිනය",
      quantity: "ප්‍රමාණය",
      quantityPlaceholder: "උදා:, 25",
      applicationMethod: "යෙදීමේ ක්‍රමය",
      selectMethod: "ක්‍රමය තෝරන්න",
      location: "ස්ථානය",
      locationPlaceholder: "කෙත / කොටස",
      landSize: "ඉඩම් ප්‍රමාණය",
      landSizePlaceholder: "උදා:, හෙක්ටයාර 1.2",
      notes: "සටහන්",
      notesPlaceholder: "විකල්ප සටහන්"
    },
    types: {
      nitrogen: "නයිට්‍රජන් (N)",
      phosphorus: "පොස්පරස් (P)",
      potassium: "පොටෑසියම් (K)",
      npk: "NPK සංයෝග",
      organic: "කාබනික",
      micronutrient: "ක්ෂුද්‍ර පෝෂක",
      foliar: "පත්‍ර යෙදුම්",
      other: "වෙනත්"
    },
    methods: {
      broadcast: "විසිරීම",
      banded: "පටි ක්‍රමය",
      foliar_spray: "පත්‍ර ඉසීම",
      drip: "බිංදු ජල සැපයුම",
      fertigation: "ජල පොහොර",
      side_dress: "පැති යෙදීම",
      top_dress: "උඩ යෙදීම",
      other: "වෙනත්"
    },
    tableHeaders: {
      crop: "බෝගය",
      location: "ස්ථානය",
      applied: "යෙදූ දිනය",
      nextApplication: "ඊළඟ යෙදීම",
      quantity: "ප්‍රමාණය",
      method: "ක්‍රමය",
      notes: "සටහන්"
    },
    validation: {
      cropRequired: "බෝගය අවශ්‍යයි",
      fertilizerNameRequired: "පොහොර නම අවශ්‍යයි",
      fertilizerTypeRequired: "පොහොර වර්ගය අවශ්‍යයි",
      applicationDateRequired: "යෙදූ දිනය අවශ්‍යයි",
      nextAfterCurrent: "ඊළඟ යෙදීමේ දිනය, යෙදූ දිනයට පසු විය යුතුය"
    },
    errors: {
      loadFailed: "පොහොර යෙදීම් පූරණය කිරීම අසාර්ථක විය",
      addFailed: "පොහොර යෙදීම එකතු කිරීම අසාර්ථක විය",
      updateFailed: "පොහොර යෙදීම යාවත්කාලීන කිරීම අසාර්ථක විය",
      deleteFailed: "පොහොර යෙදීම මැකීම අසාර්ථක විය"
    },
    success: {
      added: "පොහොර යෙදීම සාර්ථකව එකතු කරන ලදී",
      updated: "පොහොර යෙදීම සාර්ථකව යාවත්කාලීන කරන ලදී",
      deleted: "පොහොර යෙදීම සාර්ථකව මකා දමන ලදී"
    }
  },
  
  // Tamil translations
  ta: {
    addFertilizer: "உர பயன்பாட்டைச் சேர்க்க",
    editFertilizer: "உர பயன்பாட்டைத் திருத்த",
    addNewFertilizer: "புதிய உர பயன்பாட்டைச் சேர்க்க",
    cancel: "ரத்துசெய்",
    save: "சேமி",
    update: "புதுப்பிக்க",
    noFertilizersFound: "உர பயன்பாடுகள் எதுவும் கிடைக்கவில்லை",
    addFirstFertilizer: "உங்கள் முதல் உர பயன்பாட்டைச் சேர்க்கவும்",
    confirmDelete: "இந்த உர பதிவை நீக்கவா?",
    labels: {
      crop: "பயிர்",
      cropPlaceholder: "எ.கா., நெல்",
      selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
      fertilizerName: "உர பெயர்",
      fertilizerNamePlaceholder: "எ.கா., NPK 10-10-10",
      fertilizerType: "உர வகை",
      selectType: "வகையைத் தேர்ந்தெடுக்கவும்",
      applicationDate: "இட்ட திகதி",
      nextApplicationDate: "அடுத்த பயன்பாட்டு திகதி",
      quantity: "அளவு",
      quantityPlaceholder: "எ.கா., 25",
      applicationMethod: "பயன்படுத்தும் முறை",
      selectMethod: "முறையைத் தேர்ந்தெடுக்கவும்",
      location: "இடம்",
      locationPlaceholder: "நிலம் / பகுதி",
      landSize: "நில அளவு",
      landSizePlaceholder: "எ.கா., 1.2 ஹெக்டேர்",
      notes: "குறிப்புகள்",
      notesPlaceholder: "விருப்ப குறிப்புகள்"
    },
    types: {
      nitrogen: "நைட்ரஜன் (N)",
      phosphorus: "பாஸ்பரஸ் (P)",
      potassium: "பொட்டாசியம் (K)",
      npk: "NPK கூட்டு",
      organic: "கரிம",
      micronutrient: "நுண்ணூட்டம்",
      foliar: "இலை வழி",
      other: "மற்றவை"
    },
    methods: {
      broadcast: "விதைத்தல்",
      banded: "பட்டை முறை",
      foliar_spray: "இலை தெளிப்பு",
      drip: "சொட்டு நீர்",
      fertigation: "நீர் உரமூட்டல்",
      side_dress: "பக்க வழி",
      top_dress: "மேல் வழி",
      other: "மற்றவை"
    },
    tableHeaders: {
      crop: "பயிர்",
      location: "இடம்",
      applied: "இட்ட திகதி",
      nextApplication: "அடுத்த பயன்பாடு",
      quantity: "அளவு",
      method: "முறை",
      notes: "குறிப்புகள்"
    },
    validation: {
      cropRequired: "பயிர் தேவை",
      fertilizerNameRequired: "உர பெயர் தேவை",
      fertilizerTypeRequired: "உர வகை தேவை",
      applicationDateRequired: "இட்ட திகதி தேவை",
      nextAfterCurrent: "அடுத்த பயன்பாட்டு திகதி இட்ட திகதிக்குப் பின்னர் இருக்க வேண்டும்"
    },
    errors: {
      loadFailed: "உர பயன்பாடுகளை ஏற்றுவதில் தோல்வி",
      addFailed: "உரத்தைச் சேர்ப்பதில் தோல்வி",
      updateFailed: "உரத்தைப் புதுப்பிப்பதில் தோல்வி",
      deleteFailed: "உரத்தை நீக்குவதில் தோல்வி"
    },
    success: {
      added: "உர பயன்பாடு வெற்றிகரமாகச் சேர்க்கப்பட்டது",
      updated: "உர பயன்பாடு வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
      deleted: "உர பயன்பாடு வெற்றிகரமாக நீக்கப்பட்டது"
    }
  }
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
  language = 'en', // Add language prop with default
}) {
  // Use the language context if available, or fall back to the language prop
  const { language: contextLanguage } = useLanguage || {};
  const currentLanguage = language || contextLanguage || 'en';
  const trans = translations[currentLanguage] || translations.en;

  // Get text style based on language
  const getTextStyle = (s = {}) => ({ 
    ...s, 
    lineHeight: currentLanguage === 'si' ? 1.7 : currentLanguage === 'ta' ? 1.8 : 1.5 
  });

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
    if (!formData.crop) e.crop = trans.validation.cropRequired;
    if (!formData.fertilizer_name) e.fertilizer_name = trans.validation.fertilizerNameRequired;
    if (!formData.fertilizer_type) e.fertilizer_type = trans.validation.fertilizerTypeRequired;
    if (!formData.application_date) e.application_date = trans.validation.applicationDateRequired;
    if (formData.next_application_date && formData.application_date && new Date(formData.next_application_date) <= new Date(formData.application_date)) {
      e.next_application_date = trans.validation.nextAfterCurrent;
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
      setError(trans.errors.loadFailed);
    } finally { setLoading(false); }
  }, [apiBase, userId, setFertilizers, trans.errors.loadFailed]);

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
        throw new Error(err?.message || err?.error || trans.errors.addFailed);
      }
      const created = await res.json();
      setFertilizers((prev) => [...prev, created]);
      setSuccessMessage(trans.success.added);
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
        throw new Error(err?.message || err?.error || trans.errors.updateFailed);
      }
      const updated = await res.json();
      setFertilizers((prev) => prev.map((x) => (String(x.id) === String(isEditingId) ? updated : x)));
      setSuccessMessage(trans.success.updated);
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
    if (!window.confirm(trans.confirmDelete)) return;
    try {
      setLoading(true); setError("");
      const res = await fetch(`${apiBase}/api/v1/fertilizers/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.error || trans.errors.deleteFailed);
      }
      setFertilizers((prev) => prev.filter((x) => String(x.id) !== String(id)));
      setSuccessMessage(trans.success.deleted);
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

  // Helper function to get dropdown styles - black text on white background
  const getDropdownStyles = (hasError = false) => ({
    backgroundColor: "white", // Always white background for better readability
    borderColor: hasError ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
    color: "#333", // Always dark text for readability on white background
  });

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
            <p style={getTextStyle()}>{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: isDark ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.1)", color: isDark ? "#4ADE80" : "#22C55E", border: `1px solid ${isDark ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.2)"}` }}>
          <p style={getTextStyle()}>{successMessage}</p>
        </div>
      )}

      {!isAddingNew && !isEditingId && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsAddingNew(true)} className="flex items-center px-4 py-2 rounded-md text-white" style={{ backgroundColor: theme.colors.primary }}>
            <Plus className="h-4 w-4 mr-2" /> <span style={getTextStyle()}>{trans.addFertilizer}</span>
          </button>
        </div>
      )}

      {(isAddingNew || isEditingId) && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ ...getTextStyle(), color: isDark ? "#eee" : "#333" }}>
              {isEditingId ? trans.editFertilizer : trans.addNewFertilizer}
            </h3>
            <button onClick={handleCancel} className="p-1 rounded-full hover:bg-opacity-10" style={{ color: isDark ? "#aaa" : "#666", backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crop selector: show cultivations if any; otherwise free text */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>
                  {trans.labels.crop} {validationErrors.crop && <span className="text-red-500">*</span>}
                </label>
                {cultivations.length > 0 ? (
                  <select 
                    name="crop" 
                    value={formData.crop.startsWith("id:") ? formData.crop : formData.crop} 
                    onChange={handleChange} 
                    className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                    style={getDropdownStyles(validationErrors.crop)}
                  >
                    <option value="">{trans.labels.selectCrop}</option>
                    {cultivations.map((c) => (
                      <option key={c.id} value={`id:${c.id}`}>{c.crop} {c.location ? `(${c.location})` : ""}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    name="crop" 
                    value={formData.crop} 
                    onChange={handleChange} 
                    className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                    style={{ 
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", 
                      borderColor: validationErrors.crop ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                      color: isDark ? "#eee" : "#333" 
                    }} 
                    placeholder={trans.labels.cropPlaceholder} 
                  />
                )}
                {validationErrors.crop && <p className="mt-1 text-xs text-red-500" style={getTextStyle()}>{validationErrors.crop}</p>}
              </div>

              {/* Fertilizer name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>
                  {trans.labels.fertilizerName} {validationErrors.fertilizer_name && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="text" 
                  name="fertilizer_name" 
                  value={formData.fertilizer_name} 
                  onChange={handleChange} 
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                  style={{ 
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", 
                    borderColor: validationErrors.fertilizer_name ? "#f87171" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                    color: isDark ? "#eee" : "#333" 
                  }} 
                  placeholder={trans.labels.fertilizerNamePlaceholder} 
                />
                {validationErrors.fertilizer_name && <p className="mt-1 text-xs text-red-500" style={getTextStyle()}>{validationErrors.fertilizer_name}</p>}
              </div>

              {/* Fertilizer type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>
                  {trans.labels.fertilizerType} {validationErrors.fertilizer_type && <span className="text-red-500">*</span>}
                </label>
                <select 
                  name="fertilizer_type" 
                  value={formData.fertilizer_type} 
                  onChange={handleChange} 
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                  style={getDropdownStyles(validationErrors.fertilizer_type)}
                >
                  <option value="">{trans.labels.selectType}</option>
                  <option value="nitrogen">{trans.types.nitrogen}</option>
                  <option value="phosphorus">{trans.types.phosphorus}</option>
                  <option value="potassium">{trans.types.potassium}</option>
                  <option value="npk">{trans.types.npk}</option>
                  <option value="organic">{trans.types.organic}</option>
                  <option value="micronutrient">{trans.types.micronutrient}</option>
                  <option value="foliar">{trans.types.foliar}</option>
                  <option value="other">{trans.types.other}</option>
                </select>
                {validationErrors.fertilizer_type && <p className="mt-1 text-xs text-red-500" style={getTextStyle()}>{validationErrors.fertilizer_type}</p>}
              </div>

              {/* Dates */}
              <DatePicker value={formData.application_date} onChange={(d) => setFormData((p) => ({ ...p, application_date: d }))} label={trans.labels.applicationDate} isDark={isDark} error={validationErrors.application_date} />
              <DatePicker value={formData.next_application_date} onChange={(d) => setFormData((p) => ({ ...p, next_application_date: d }))} label={trans.labels.nextApplicationDate} isDark={isDark} error={validationErrors.next_application_date} />

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{trans.labels.quantity}</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleChange} 
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                  style={{ 
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", 
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                    color: isDark ? "#eee" : "#333" 
                  }} 
                  placeholder={trans.labels.quantityPlaceholder} 
                />
              </div>

              {/* Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{trans.labels.applicationMethod}</label>
                <select 
                  name="application_method" 
                  value={formData.application_method} 
                  onChange={handleChange} 
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                  style={getDropdownStyles()}
                >
                  <option value="">{trans.labels.selectMethod}</option>
                  <option value="broadcast">{trans.methods.broadcast}</option>
                  <option value="banded">{trans.methods.banded}</option>
                  <option value="foliar_spray">{trans.methods.foliar_spray}</option>
                  <option value="drip">{trans.methods.drip}</option>
                  <option value="fertigation">{trans.methods.fertigation}</option>
                  <option value="side_dress">{trans.methods.side_dress}</option>
                  <option value="top_dress">{trans.methods.top_dress}</option>
                  <option value="other">{trans.methods.other}</option>
                </select>
              </div>

              {/* Location & land size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{trans.labels.location}</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                  style={{ 
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", 
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                    color: isDark ? "#eee" : "#333" 
                  }} 
                  placeholder={trans.labels.locationPlaceholder} 
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{trans.labels.landSize}</label>
                <input 
                  type="text" 
                  name="land_size" 
                  value={formData.land_size} 
                  onChange={handleChange} 
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                  style={{ 
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", 
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                    color: isDark ? "#eee" : "#333" 
                  }} 
                  placeholder={trans.labels.landSizePlaceholder} 
                />
              </div>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{trans.labels.notes}</label>
              <textarea 
                name="note" 
                value={formData.note} 
                onChange={handleChange} 
                rows={3} 
                className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none" 
                style={{ 
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white", 
                  borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                  color: isDark ? "#eee" : "#333" 
                }} 
                placeholder={trans.labels.notesPlaceholder} 
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="px-4 py-2 rounded-md border" 
                style={{ 
                  backgroundColor: "transparent", 
                  borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", 
                  color: isDark ? "#ddd" : "#333" 
                }} 
                disabled={loading}
              >
                <span style={getTextStyle()}>{trans.cancel}</span>
              </button>
              <button 
                type="submit" 
                className="flex items-center px-4 py-2 rounded-md text-white" 
                style={{ backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }} 
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                <span style={getTextStyle()}>{isEditingId ? trans.update : trans.save}</span>
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
              <p style={getTextStyle()}>{trans.noFertilizersFound}</p>
              <button onClick={() => setIsAddingNew(true)} className="mt-2 text-sm" style={{ color: theme.colors.primary }}>
                <span style={getTextStyle()}>{trans.addFirstFertilizer}</span>
              </button>
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
                          <h3 className="text-lg font-medium" style={{ ...getTextStyle(), color: isDark ? "#eee" : "#333" }}>{row.fertilizer_name}</h3>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.crop}</p>
                            <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{row.crop}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.location}</p>
                            <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{row.location || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.applied}</p>
                            <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{fmtDate(row.application_date)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.nextApplication}</p>
                            <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{fmtDate(row.next_application_date)}</p>
                          </div>
                          {row.quantity != null && (
                            <div>
                              <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.quantity}</p>
                              <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{row.quantity}</p>
                            </div>
                          )}
                          {row.application_method && (
                            <div>
                              <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.method}</p>
                              <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>
                                {trans.methods[row.application_method] || row.application_method.replace(/_/g, " ")}
                              </p>
                            </div>
                          )}
                        </div>
                        {row.note && (
                          <div className="mt-2">
                            <p className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>{trans.tableHeaders.notes}</p>
                            <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? "#ddd" : "#333" }}>{row.note}</p>
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