'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, MessageSquare, User, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

// API Base URL (same as in Dashboard)
const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, ''); // strip trailing slash

// Status badge colors
const STATUS_COLORS = {
  pending: {
    bg: { light: 'rgba(234,179,8,0.1)', dark: 'rgba(234,179,8,0.2)' },
    text: { light: '#ca8a04', dark: '#fcd34d' }
  },
  confirmed: {
    bg: { light: 'rgba(34,197,94,0.1)', dark: 'rgba(34,197,94,0.2)' },
    text: { light: '#16a34a', dark: '#86efac' }
  },
  cancelled: {
    bg: { light: 'rgba(239,68,68,0.1)', dark: 'rgba(239,68,68,0.2)' },
    text: { light: '#dc2626', dark: '#fca5a5' }
  },
  completed: {
    bg: { light: 'rgba(59,130,246,0.1)', dark: 'rgba(59,130,246,0.2)' },
    text: { light: '#2563eb', dark: '#93c5fd' }
  }
};

// Format date and time from ISO string
const formatDateTime = (dateString) => {
  if (!dateString) return { date: '—', time: '—' };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

/**
 * Individual appointment request card
 */
const RequestCard = ({ appointment, onUpdate, theme }) => {
  const isDark = theme.name === 'dark';
  const { date, time } = formatDateTime(appointment.appointment_date);
  const statusColor = STATUS_COLORS[appointment.appointment_status] || STATUS_COLORS.pending;
  
  return (
    <div className="border rounded-lg p-4 mb-4" 
         style={{ borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
      
      {/* Header with status badge */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">{appointment.subject}</h3>
        <span className="px-3 py-1 rounded-full text-xs capitalize"
              style={{ 
                backgroundColor: isDark ? statusColor.bg.dark : statusColor.bg.light,
                color: isDark ? statusColor.text.dark : statusColor.text.light
              }}>
          {appointment.appointment_status}
        </span>
      </div>
      
      {/* Farmer info */}
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full flex items-center justify-center mr-2"
             style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
          <User size={16} style={{ opacity: 0.7 }} />
        </div>
        <div>
          <div className="font-medium">
            {appointment.farmer?.username || appointment.farmer?.name || 'Farmer'}
          </div>
          <div className="text-xs opacity-70">
            {appointment.farmer?.email || ''}
          </div>
        </div>
      </div>
      
      {/* Appointment details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center">
          <Calendar size={16} className="mr-2 opacity-70" />
          <span className="text-sm">{date}</span>
        </div>
        <div className="flex items-center">
          <Clock size={16} className="mr-2 opacity-70" />
          <span className="text-sm">{time} ({appointment.duration_minutes} min)</span>
        </div>
        {appointment.location && (
          <div className="flex items-center md:col-span-2">
            <MapPin size={16} className="mr-2 opacity-70" />
            <span className="text-sm">{appointment.location}</span>
          </div>
        )}
      </div>
      
      {/* Message (if any) */}
      {appointment.message && (
        <div className="mb-4 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-start">
            <MessageSquare size={16} className="mr-2 mt-1 opacity-70" />
            <p className="text-sm opacity-80">{appointment.message}</p>
          </div>
        </div>
      )}
      
      {/* Action buttons (only for pending) */}
      {appointment.appointment_status === 'pending' && (
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => onUpdate(appointment.id, 'cancelled')}
            className="px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90"
            style={{ 
              backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)', 
              color: isDark ? '#fca5a5' : '#dc2626' 
            }}>
            <X size={16} /> Decline
          </button>
          <button
            onClick={() => onUpdate(appointment.id, 'confirmed')}
            className="px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90 text-white"
            style={{ backgroundColor: theme.colors.primary }}>
            <Check size={16} /> Approve
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Main Requests component (Parent)
 * This fetches and displays appointment requests for the advisor
 */
export default function Request() {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme.name === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Get authenticated user ID (advisor)
  const getUserId = () => {
    if (authUser?.id) return Number(authUser.id);
    if (typeof window !== 'undefined') {
      const local = Number(localStorage.getItem('userId'));
      if (Number.isFinite(local) && local > 0) return local;
    }
    return null;
  };
  
  const adviserId = getUserId();
  
  // Fetch appointments for the logged-in advisor
  const fetchAppointments = useCallback(async () => {
    if (!adviserId) return;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/appointments/adviser/${adviserId}`, { headers });
      
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      
      const data = await res.json();
      const appointments = data.data || data.items || data || [];
      
      // Sort by date (most recent first) and filter to show only pending ones first
      const sorted = appointments.sort((a, b) => 
        new Date(b.appointment_date) - new Date(a.appointment_date)
      );
      
      // Prioritize pending appointments by putting them first
      const prioritized = [
        ...sorted.filter(a => a.appointment_status === 'pending'),
        ...sorted.filter(a => a.appointment_status !== 'pending')
      ];
      
      setAppointments(prioritized);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointment requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [adviserId]);
  
  // Update appointment status (approve/decline)
  const updateAppointment = async (appointmentId, newStatus) => {
    if (!appointmentId) return;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { 
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/appointments/${appointmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ appointment_status: newStatus })
      });
      
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      
      // Show optimistic UI update
      setAppointments(current => 
        current.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, appointment_status: newStatus } 
            : appt
        )
      );
      
      // Refresh the full list
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(`Failed to ${newStatus === 'confirmed' ? 'approve' : 'decline'} the appointment. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!adviserId) return;
    
    fetchAppointments();
    
    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchAppointments, 30000);
    
    // Refresh on tab focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchAppointments();
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [adviserId, fetchAppointments]);
  
  // Filter to count pending appointments
  const pendingCount = appointments.filter(a => a.appointment_status === 'pending').length;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Appointment Requests
          </h1>
          <p className="text-sm opacity-70">
            Manage appointment requests from farmers
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.1)',
                    color: isDark ? '#fcd34d' : '#ca8a04' 
                  }}>
              {pendingCount} pending
            </span>
          )}
          
          <button 
            onClick={fetchAppointments}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-2 rounded-md hover:opacity-90"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', 
              color: theme.colors.text 
            }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-md flex items-center" style={{
          backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2',
          color: isDark ? '#F87171' : '#B91C1C'
        }}>
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {loading && appointments.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
               style={{ borderColor: theme.colors.primary }} />
        </div>
      )}
      
      {/* Empty state */}
      {!loading && appointments.length === 0 && (
        <div className="text-center py-12 border rounded-lg"
             style={{ 
               borderColor: theme.colors.border,
               backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
             }}>
          <Calendar size={48} className="mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-medium mb-1">No appointment requests</h3>
          <p className="text-sm opacity-70">
            When farmers request appointments, they will appear here
          </p>
        </div>
      )}
      
      {/* Appointment list */}
      {appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <RequestCard
              key={appointment.id}
              appointment={appointment}
              onUpdate={updateAppointment}
              theme={theme}
            />
          ))}
        </div>
      )}
      
      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="text-right mt-4">
          <span className="text-xs opacity-60">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}