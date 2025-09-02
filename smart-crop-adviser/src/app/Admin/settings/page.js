'use client';

import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Check, Shield, Bell, Database, Server, Lock, Mail, Globe, Upload, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminSettings() {
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Smart Crop',
    siteDescription: 'Crop recommendation and management platform',
    contactEmail: 'admin@smartcrop.com',
    maintenanceMode: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPasswords: true,
    loginAttempts: '5',
    sessionTimeout: '120',
    twoFactorAuth: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    userRegistration: true,
    predictionAlerts: true,
    systemUpdates: false
  });

  const [backupSettings, setBackupSettings] = useState({
    backupFrequency: 'daily',
    retentionPeriod: '30',
    lastBackup: new Date().toISOString()
  });

  // Status message for form submissions
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load settings from localStorage if available
        const storedGeneral = localStorage.getItem('admin_general_settings');
        const storedSecurity = localStorage.getItem('admin_security_settings');
        const storedNotification = localStorage.getItem('admin_notification_settings');
        const storedBackup = localStorage.getItem('admin_backup_settings');
        
        if (storedGeneral) setGeneralSettings(JSON.parse(storedGeneral));
        if (storedSecurity) setSecuritySettings(JSON.parse(storedSecurity));
        if (storedNotification) setNotificationSettings(JSON.parse(storedNotification));
        if (storedBackup) setBackupSettings(JSON.parse(storedBackup));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Handle input changes for each settings group
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  const handleBackupChange = (e) => {
    const { name, value } = e.target;
    setBackupSettings({
      ...backupSettings,
      [name]: value
    });
  };

  // Form submission handlers - using localStorage as fallback
  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Since there's no specific admin settings API, we'll use localStorage
      localStorage.setItem('admin_general_settings', JSON.stringify(generalSettings));
      
      // Show success message
      setStatusMessage({
        type: 'success',
        message: 'General settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to save settings: ' + error.message
      });
    } finally {
      setLoading(false);
      // Clear message after delay
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
  };

  const saveSecuritySettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem('admin_security_settings', JSON.stringify(securitySettings));
      
      setStatusMessage({
        type: 'success',
        message: 'Security settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to save settings: ' + error.message
      });
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
  };

  const saveNotificationSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem('admin_notification_settings', JSON.stringify(notificationSettings));
      
      setStatusMessage({
        type: 'success',
        message: 'Notification settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to save settings: ' + error.message
      });
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
  };

  const saveBackupSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem('admin_backup_settings', JSON.stringify(backupSettings));
      
      setStatusMessage({
        type: 'success',
        message: 'Backup settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving backup settings:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to save settings: ' + error.message
      });
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }
  };

  const triggerBackup = () => {
    setStatusMessage({
      type: 'info',
      message: 'Backup in progress...'
    });
    
    setLoading(true);
    
    // Simulate backup process
    setTimeout(() => {
      const now = new Date();
      const newBackupSettings = {
        ...backupSettings,
        lastBackup: now.toISOString()
      };
      
      setBackupSettings(newBackupSettings);
      localStorage.setItem('admin_backup_settings', JSON.stringify(newBackupSettings));
      
      setStatusMessage({
        type: 'success',
        message: 'Manual backup completed successfully'
      });
      
      setLoading(false);
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
    }, 3000);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Settings</h1>
          <p className="text-gray-500">Configure system settings and preferences</p>
        </div>

        {/* Status Message */}
        {statusMessage.message && (
          <div className={`mb-6 p-4 rounded-md ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 
            statusMessage.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <div className="flex items-center">
              {statusMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : 
              statusMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-2" /> :
              <Bell className="w-5 h-5 mr-2" />}
              <p>{statusMessage.message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-800">General Settings</h2>
            </div>
            <form onSubmit={saveGeneralSettings} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    rows="2"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onChange={handleGeneralChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                    Maintenance Mode
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
          
          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-800">Security Settings</h2>
            </div>
            <form onSubmit={saveSecuritySettings} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireStrongPasswords"
                    name="requireStrongPasswords"
                    checked={securitySettings.requireStrongPasswords}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireStrongPasswords" className="ml-2 block text-sm text-gray-700">
                    Require Strong Passwords
                  </label>
                </div>
                
                <div>
                  <label htmlFor="loginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Login Attempts
                  </label>
                  <select
                    id="loginAttempts"
                    name="loginAttempts"
                    value={securitySettings.loginAttempts}
                    onChange={handleSecurityChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="3">3 attempts</option>
                    <option value="5">5 attempts</option>
                    <option value="10">10 attempts</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    id="sessionTimeout"
                    name="sessionTimeout"
                    min="5"
                    max="1440"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    name="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                    Enable Two-Factor Authentication
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Save Security Settings
                </button>
              </div>
            </form>
          </div>
          
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-800">Notification Settings</h2>
            </div>
            <form onSubmit={saveNotificationSettings} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Send email notifications for system events</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="emailNotifications" 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"
                    />
                    <label 
                      htmlFor="emailNotifications" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">System Updates</h4>
                    <p className="text-xs text-gray-500">Notify admins about system updates</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="systemUpdates" 
                      id="systemUpdates" 
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"
                    />
                    <label 
                      htmlFor="systemUpdates" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Prediction Alerts</h4>
                    <p className="text-xs text-gray-500">Notify admins of new predictions</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="predictionAlerts" 
                      id="predictionAlerts" 
                      checked={notificationSettings.predictionAlerts}
                      onChange={handleNotificationChange}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"
                    />
                    <label 
                      htmlFor="predictionAlerts" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">User Registration</h4>
                    <p className="text-xs text-gray-500">Notify admins when new users register</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="userRegistration" 
                      id="userRegistration" 
                      checked={notificationSettings.userRegistration}
                      onChange={handleNotificationChange}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"
                    />
                    <label 
                      htmlFor="userRegistration" 
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Settings
                </button>
              </div>
            </form>
          </div>
          
          {/* Backup & Maintenance */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <Database className="h-5 w-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-800">Backup & Maintenance</h2>
            </div>
            <form onSubmit={saveBackupSettings} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    id="backupFrequency"
                    name="backupFrequency"
                    value={backupSettings.backupFrequency}
                    onChange={handleBackupChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    id="retentionPeriod"
                    name="retentionPeriod"
                    min="1"
                    max="365"
                    value={backupSettings.retentionPeriod}
                    onChange={handleBackupChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Last Backup</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(backupSettings.lastBackup).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={triggerBackup}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      Backup Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Server className="h-4 w-4 mr-2" />
                  )}
                  Save Backup Settings
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Note About Settings</h3>
              <p className="text-sm mt-1">
                Since there are no specific API endpoints for admin settings, these settings are currently stored in your browser's localStorage. 
                In a production environment, you would want to implement server-side storage for these settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}