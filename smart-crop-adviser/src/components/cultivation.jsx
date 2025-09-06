'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Trash2, Plus, Edit, X, Save, AlertTriangle } from 'lucide-react';

/* ---------------------------------- Utils --------------------------------- */

const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return '-';
  }
};

const DatePicker = ({ value, onChange, label, isDark, error }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#ddd' : '#333' }}>
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <CalendarIcon className="h-5 w-5" style={{ color: isDark ? '#aaa' : '#666' }} />
      </div>
      <input
        type="date"
        value={value ? new Date(value).toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="pl-10 pr-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
          borderColor: error ? '#f87171' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          color: isDark ? '#eee' : '#333',
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  </div>
);

/* ------------------------------- Translations --------------------------- */
const translations = {
  en: {
    addCultivation: "Add Cultivation",
    editCultivation: "Edit Cultivation",
    addNewCultivation: "Add New Cultivation",
    cropName: "Crop Name",
    location: "Location",
    locationPlaceholder: "Farm location or field name",
    landSize: "Land Size",
    landSizePlaceholder: "e.g., 1.0 acre / 0.4 ha / 20 perches",
    status: "Status",
    statusOptions: {
      planning: "Planned",
      active: "Active",
      completed: "Completed"
    },
    planningDate: "Planning Date",
    expectedHarvestDate: "Expected Harvest Date",
    notes: "Notes",
    notesPlaceholder: "Optional notes about this cultivation",
    cancel: "Cancel",
    update: "Update",
    save: "Save",
    noCultivationsFound: "No cultivation records found",
    addFirstCultivation: "Add your first cultivation",
    daysLeft: "days left",
    validation: {
      cropRequired: "Crop name is required",
      planningDateRequired: "Planning date is required",
      harvestDateRequired: "Expected harvest date is required",
      harvestAfterPlanning: "Harvest date must be after planning date",
      locationRequired: "Location is required",
      landSizeRequired: "Land size is required"
    }
  },
  
  // Sinhala translations
  si: {
    addCultivation: "වගාව එකතු කරන්න",
    editCultivation: "වගාව සංස්කරණය කරන්න",
    addNewCultivation: "නව වගාවක් එකතු කරන්න",
    cropName: "බෝග නාමය",
    location: "ස්ථානය",
    locationPlaceholder: "ගොවිපළ ස්ථානය හෝ කෙත් නම",
    landSize: "ඉඩම් ප්‍රමාණය",
    landSizePlaceholder: "උදා: අක්කර 1.0 / හෙක්ටයාර 0.4 / පර්චස් 20",
    status: "තත්ත්වය",
    statusOptions: {
      planning: "සැලසුම් කළ",
      active: "ක්‍රියාකාරී",
      completed: "සම්පූර්ණ කළ"
    },
    planningDate: "සැලසුම් දිනය",
    expectedHarvestDate: "අපේක්ෂිත අස්වනු දිනය",
    notes: "සටහන්",
    notesPlaceholder: "මෙම වගාව පිළිබඳ විකල්ප සටහන්",
    cancel: "අවලංගු කරන්න",
    update: "යාවත්කාලීන කරන්න",
    save: "සුරකින්න",
    noCultivationsFound: "වගා වාර්තා හමු නොවීය",
    addFirstCultivation: "ඔබගේ පළමු වගාව එකතු කරන්න",
    daysLeft: "දින ඉතිරිය",
    validation: {
      cropRequired: "බෝග නාමය අවශ්‍යයි",
      planningDateRequired: "සැලසුම් දිනය අවශ්‍යයි",
      harvestDateRequired: "අපේක්ෂිත අස්වනු දිනය අවශ්‍යයි",
      harvestAfterPlanning: "අස්වනු දිනය සැලසුම් දිනයට පසු විය යුතුය",
      locationRequired: "ස්ථානය අවශ්‍යයි",
      landSizeRequired: "ඉඩම් ප්‍රමාණය අවශ්‍යයි"
    }
  },
  
  // Tamil translations
  ta: {
    addCultivation: "சாகுபடியை சேர்க்க",
    editCultivation: "சாகுபடியைத் திருத்த",
    addNewCultivation: "புதிய சாகுபடி சேர்க்க",
    cropName: "பயிர் பெயர்",
    location: "இடம்",
    locationPlaceholder: "பண்ணை இடம் அல்லது நிலத்தின் பெயர்",
    landSize: "நில அளவு",
    landSizePlaceholder: "உ.தா., 1.0 ஏக்கர் / 0.4 ஹெக்டேர் / 20 பேர்ச்",
    status: "நிலை",
    statusOptions: {
      planning: "திட்டமிடப்பட்டது",
      active: "செயலில்",
      completed: "முடிக்கப்பட்டது"
    },
    planningDate: "திட்டமிடல் திகதி",
    expectedHarvestDate: "எதிர்பார்க்கப்படும் அறுவடை திகதி",
    notes: "குறிப்புகள்",
    notesPlaceholder: "இந்த சாகுபடி பற்றிய விருப்ப குறிப்புகள்",
    cancel: "ரத்து செய்க",
    update: "புதுப்பிக்க",
    save: "சேமி",
    noCultivationsFound: "சாகுபடி பதிவுகள் எதுவும் இல்லை",
    addFirstCultivation: "உங்கள் முதல் சாகுபடியைச் சேர்க்கவும்",
    daysLeft: "நாட்கள் மீதம்",
    validation: {
      cropRequired: "பயிர் பெயர் தேவை",
      planningDateRequired: "திட்டமிடல் திகதி தேவை",
      harvestDateRequired: "எதிர்பார்க்கப்படும் அறுவடை திகதி தேவை",
      harvestAfterPlanning: "அறுவடை திகதி திட்டமிடல் திகதிக்குப் பிறகு இருக்க வேண்டும்",
      locationRequired: "இடம் தேவை",
      landSizeRequired: "நில அளவு தேவை"
    }
  }
};

/* ------------------------------- Main Component --------------------------- */

export default function CultivationDates({
  apiBase = '',
  userId = null,
  cultivationDates = [],
  setCultivationDates = () => {},
  theme = { colors: { primary: '#3b82f6' } },
  isDark = false,
  language = 'en',
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [trans, setTrans] = useState(translations.en);

  // Set language
  useEffect(() => {
    setTrans(translations[language] || translations.en);
  }, [language]);

  // Local form state (UI names); we map to API on submit
  const [formData, setFormData] = useState({
    crop_id: '',
    crop_name: '',
    planting_date: new Date(),
    expected_harvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    location: '',
    land_size: '',
    status: 'planning', // backend default is 'planning'
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.crop_name) errors.crop_name = trans.validation.cropRequired;
    if (!formData.planting_date) errors.planting_date = trans.validation.planningDateRequired;
    if (!formData.expected_harvest) errors.expected_harvest = trans.validation.harvestDateRequired;
    if (formData.expected_harvest <= formData.planting_date) {
      errors.expected_harvest = trans.validation.harvestAfterPlanning;
    }
    if (!formData.location) errors.location = trans.validation.locationRequired;
    if (!formData.land_size) errors.land_size = trans.validation.landSizeRequired;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      crop_id: '',
      crop_name: '',
      planting_date: new Date(),
      expected_harvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      location: '',
      land_size: '',
      status: 'planning',
      notes: '',
    });
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value && validationErrors[name]) {
      setValidationErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setIsEditingId(null);
    resetForm();
  };

  /* ------------------------------- API Calls ------------------------------ */

  const fetchCultivationDates = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(
        `${apiBase}/api/v1/cultivations?user_id=${encodeURIComponent(userId)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) {
        const errData = await safeJson(res);
        throw new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setCultivationDates(list);
    } catch (err) {
      console.error('Error fetching cultivation dates:', err);
      setError('Failed to load cultivation dates');
    } finally {
      setLoading(false);
    }
  }, [apiBase, userId, setCultivationDates]);

  useEffect(() => {
    fetchCultivationDates();
  }, [fetchCultivationDates]);

  const handleAddCultivation = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // Map UI -> API field names
      const payload = {
        user_id: userId,
        crop: formData.crop_name,
        location: formData.location,
        land_size: formData.land_size,
        status: formData.status,
        planning_date: formData.planting_date.toISOString(),
        expected_harvest_date: formData.expected_harvest.toISOString(),
        note: formData.notes,
      };

      const res = await fetch(`${apiBase}/api/v1/cultivations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await safeJson(res);
        throw new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
      }

      const created = await res.json();
      setCultivationDates((prev) => [created, ...prev]);
      setSuccessMessage('Cultivation added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      resetForm();
      setIsAddingNew(false);
    } catch (err) {
      console.error('Error adding cultivation:', err);
      setError(err?.message || 'Failed to add cultivation');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCultivation = async () => {
    if (!validateForm() || !isEditingId) return;

    try {
      setLoading(true);
      setError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const payload = {
        user_id: userId,
        crop: formData.crop_name,
        location: formData.location,
        land_size: formData.land_size,
        status: formData.status,
        planning_date: formData.planting_date.toISOString(),
        expected_harvest_date: formData.expected_harvest.toISOString(),
        note: formData.notes,
      };

      const res = await fetch(`${apiBase}/api/v1/cultivations/${isEditingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await safeJson(res);
        throw new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
      }

      const updated = await res.json();
      setCultivationDates((prev) => prev.map((r) => (r.id === isEditingId ? updated : r)));
      setSuccessMessage('Cultivation updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      resetForm();
      setIsEditingId(null);
    } catch (err) {
      console.error('Error updating cultivation:', err);
      setError(err?.message || 'Failed to update cultivation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCultivation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cultivation record?')) return;

    try {
      setLoading(true);
      setError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${apiBase}/api/v1/cultivations/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errData = await safeJson(res);
        throw new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
      }

      const ok = await res.json();
      if (ok?.success) {
        setCultivationDates((prev) => prev.filter((r) => r.id !== id));
        setSuccessMessage('Cultivation deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to delete cultivation');
      }
    } catch (err) {
      console.error('Error deleting cultivation:', err);
      setError(err?.message || 'Failed to delete cultivation');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (cultivation) => {
    setIsEditingId(cultivation.id);
    setFormData({
      crop_id: cultivation.crop_id || '',
      crop_name: cultivation.crop || '',
      planting_date: cultivation.planning_date ? new Date(cultivation.planning_date) : new Date(),
      expected_harvest: cultivation.expected_harvest_date
        ? new Date(cultivation.expected_harvest_date)
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      location: cultivation.location || '',
      land_size: cultivation.land_size || '',
      status: cultivation.status || 'planning',
      notes: cultivation.note || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditingId) handleEditCultivation();
    else handleAddCultivation();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', text: '#22C55E' };
      case 'completed':
        return { bg: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', text: '#3B82F6' };
      case 'planned':
      case 'planning':
        return { bg: isDark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.1)', text: '#EAB308' };
      default:
        return { bg: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.1)', text: '#6B7280' };
    }
  };

  // Get text style based on language
  const getTextStyle = (s = {}) => ({ 
    ...s, 
    lineHeight: language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5 
  });

  /* --------------------------------- Render -------------------------------- */

  if (loading && !isAddingNew && !isEditingId && cultivationDates.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      {/* Error */}
      {error && (
        <div
          className="mb-4 p-3 rounded-md"
          style={{
            backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
            color: isDark ? '#F87171' : '#DC2626',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p style={getTextStyle()}>{error}</p>
          </div>
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div
          className="mb-4 p-3 rounded-md"
          style={{
            backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
            color: isDark ? '#4ADE80' : '#22C55E',
            border: `1px solid ${isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)'}`,
          }}
        >
          <p style={getTextStyle()}>{successMessage}</p>
        </div>
      )}

      {/* Add button */}
      {!isAddingNew && !isEditingId && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span style={getTextStyle()}>{trans.addCultivation}</span>
          </button>
        </div>
      )}

      {/* Form */}
      {(isAddingNew || isEditingId) && (
        <div
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ ...getTextStyle(), color: isDark ? '#eee' : '#333' }}>
              {isEditingId ? trans.editCultivation : trans.addNewCultivation}
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 rounded-full hover:bg-opacity-10"
              style={{
                color: isDark ? '#aaa' : '#666',
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crop Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                  {trans.cropName} {validationErrors.crop_name && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="crop_name"
                  value={formData.crop_name}
                  onChange={handleChange}
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    borderColor: validationErrors.crop_name ? '#f87171' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? '#eee' : '#333',
                  }}
                />
                {validationErrors.crop_name && <p className="mt-1 text-xs text-red-500" style={getTextStyle()}>{validationErrors.crop_name}</p>}
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                  {trans.location} {validationErrors.location && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    borderColor: validationErrors.location ? '#f87171' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? '#eee' : '#333',
                  }}
                  placeholder={trans.locationPlaceholder}
                />
                {validationErrors.location && <p className="mt-1 text-xs text-red-500" style={getTextStyle()}>{validationErrors.location}</p>}
              </div>

              {/* Land Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                  {trans.landSize} {validationErrors.land_size && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="land_size"
                  value={formData.land_size}
                  onChange={handleChange}
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    borderColor: validationErrors.land_size ? '#f87171' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? '#eee' : '#333',
                  }}
                  placeholder={trans.landSizePlaceholder}
                />
                {validationErrors.land_size && <p className="mt-1 text-xs text-red-500" style={getTextStyle()}>{validationErrors.land_size}</p>}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                  {trans.status}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? '#eee' : '#333',
                  }}
                >
                  <option value="planning">{trans.statusOptions.planning}</option>
                  <option value="active">{trans.statusOptions.active}</option>
                  <option value="completed">{trans.statusOptions.completed}</option>
                </select>
              </div>

              {/* Planning Date */}
              <DatePicker
                value={formData.planting_date}
                onChange={(date) => setFormData({ ...formData, planting_date: date })}
                label={trans.planningDate}
                isDark={isDark}
                error={validationErrors.planting_date}
              />

              {/* Expected Harvest Date */}
              <DatePicker
                value={formData.expected_harvest}
                onChange={(date) => setFormData({ ...formData, expected_harvest: date })}
                label={trans.expectedHarvestDate}
                isDark={isDark}
                error={validationErrors.expected_harvest}
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                {trans.notes}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="px-4 py-2 w-full rounded-md border focus:ring-2 focus:outline-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  color: isDark ? '#eee' : '#333',
                }}
                placeholder={trans.notesPlaceholder}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-md border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  color: isDark ? '#ddd' : '#333',
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
          {cultivationDates.length === 0 ? (
            <div
              className="text-center py-8 rounded-lg"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: `1px dashed ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                color: isDark ? '#aaa' : '#666',
              }}
            >
              <p style={getTextStyle()}>{trans.noCultivationsFound}</p>
              <button
                onClick={() => setIsAddingNew(true)}
                className="mt-2 text-sm"
                style={{ color: theme.colors.primary }}
              >
                <span style={getTextStyle()}>{trans.addFirstCultivation}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {cultivationDates
                .slice()
                .sort((a, b) => new Date(b.planning_date) - new Date(a.planning_date))
                .map((cultivation) => {
                  const statusColor = getStatusColor(cultivation.status);
                  const daysToHarvest = cultivation.expected_harvest_date
                    ? Math.max(
                        0,
                        Math.floor(
                          (new Date(cultivation.expected_harvest_date) - new Date()) / (1000 * 60 * 60 * 24)
                        )
                      )
                    : null;

                  return (
                    <div
                      key={cultivation.id}
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium" style={{ ...getTextStyle(), color: isDark ? '#eee' : '#333' }}>
                              {cultivation.crop}
                            </h3>
                            <span
                              className="ml-2 px-2 py-0.5 text-xs rounded-full"
                              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                            >
                              {trans.statusOptions[cultivation.status] || cultivation.status}
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <div>
                              <p className="text-xs" style={{ color: isDark ? '#aaa' : '#666' }}>
                                {trans.location}
                              </p>
                              <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                                {cultivation.location || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: isDark ? '#aaa' : '#666' }}>
                                {trans.landSize}
                              </p>
                              <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                                {cultivation.land_size || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: isDark ? '#aaa' : '#666' }}>
                                {trans.planningDate}
                              </p>
                              <p className="text-sm" style={{ color: isDark ? '#ddd' : '#333' }}>
                                {formatDate(cultivation.planning_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: isDark ? '#aaa' : '#666' }}>
                                {trans.expectedHarvestDate}
                              </p>
                              <p className="text-sm" style={{ color: isDark ? '#ddd' : '#333' }}>
                                {formatDate(cultivation.expected_harvest_date)}
                                {daysToHarvest !== null && cultivation.status === 'active' && (
                                  <span className="ml-2 text-xs" style={{ color: theme.colors.primary }}>
                                    ({daysToHarvest} {trans.daysLeft})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {cultivation.note && (
                            <div className="mt-2">
                              <p className="text-xs" style={{ color: isDark ? '#aaa' : '#666' }}>
                                {trans.notes}
                              </p>
                              <p className="text-sm" style={{ ...getTextStyle(), color: isDark ? '#ddd' : '#333' }}>
                                {cultivation.note}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => startEditing(cultivation)}
                            className="p-1 rounded hover:bg-opacity-10"
                            style={{
                              color: theme.colors.primary,
                              backgroundColor: isDark ? `${theme.colors.primary}20` : `${theme.colors.primary}10`,
                            }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCultivation(cultivation.id)}
                            className="p-1 rounded hover:bg-opacity-10"
                            style={{
                              color: '#EF4444',
                              backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------- small helpers ---------------------------- */

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}