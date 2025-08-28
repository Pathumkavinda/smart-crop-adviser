'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// API URL constant - match your backend server address
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setUser(userData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login user
  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      setError('');

      console.log('Attempting login with:', { email, password });
      console.log('API URL:', API_URL);

      // Call login API with correct endpoint and format
      const res = await fetch(`${API_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', res.status);

      // Check for non-JSON response
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned unexpected response. Please try again later.');
      }

      const data = await res.json();
      console.log('Login response data:', data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Extract user data from response
      const userInfo = data.data;
      console.log('Login successful, user data:', userInfo);

      // Generate a simple token if one isn't provided by the API
      const token = data.token || `auth_token_${Date.now()}`;

      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Set user state
      setUser(userInfo);
      
      setLoading(false);
      
      // Return success
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');

      console.log('Register with data:', userData);

      // Call register API with correct endpoint
      const res = await fetch(`${API_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Register response status:', res.status);

      // Check for non-JSON response
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned unexpected response. Please try again later.');
      }

      const data = await res.json();
      console.log('Register response data:', data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Extract user data
      const userInfo = data.data;
      
      // Generate a simple token if not provided
      const token = data.token || `auth_token_${Date.now()}`;

      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Set user state
      setUser(userInfo);
      
      setLoading(false);
      
      // Return success
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError('');

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      console.log('Updating user with data:', userData);

      const token = localStorage.getItem('token');
      
      // Call update API
      const res = await fetch(`${API_URL}/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(userData),
      });

      console.log('Update response status:', res.status);

      // Check for non-JSON response
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned unexpected response. Please try again later.');
      }

      const data = await res.json();
      console.log('Update response data:', data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Update failed');
      }

      // Update local user data
      const updatedUser = data.data;
      
      // Merge the updated user data with existing user data
      const mergedUser = { ...user, ...updatedUser };
      
      // Save updated user data
      localStorage.setItem('user', JSON.stringify(mergedUser));

      // Update user state
      setUser(mergedUser);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Update failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Get user's prediction history
  const getUserPredictions = async (userId) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      // Fetch user's prediction history
      const response = await fetch(`${API_URL}/api/v1/predictions/user/${userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      // Check for non-JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned unexpected response. Please try again later.');
      }

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch prediction data');
      }
      
      setLoading(false);
      return data.data || [];
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err.message || 'Failed to fetch predictions. Please try again.');
      setLoading(false);
      return [];
    }
  };

  // Logout user
  const logout = () => {
    // Remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('loggedOut', 'true');

    // Reset user state
    setUser(null);

    // Redirect to home
    router.push('/');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Get user role
  const getUserRole = () => {
    return user ? user.userlevel : null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateUser,
        getUserPredictions,
        isAuthenticated,
        getUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}