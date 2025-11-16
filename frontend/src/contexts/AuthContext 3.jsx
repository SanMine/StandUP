import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// LocalStorage keys
const USER_STORAGE_KEY = 'standup_user';
const AUTH_STATUS_KEY = 'standup_auth_status';

// Helper functions for localStorage
const saveUser = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving user to localStorage:', err);
  }
};

const loadUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error('Error loading user from localStorage:', err);
    return null;
  }
};

const saveAuthStatus = (status) => {
  try {
    localStorage.setItem(AUTH_STATUS_KEY, status.toString());
  } catch (err) {
    console.error('Error saving auth status to localStorage:', err);
  }
};

const loadAuthStatus = () => {
  try {
    const storedStatus = localStorage.getItem(AUTH_STATUS_KEY);
    return storedStatus === 'true';
  } catch (err) {
    console.error('Error loading auth status from localStorage:', err);
    return false;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_STATUS_KEY);
  } catch (err) {
    console.error('Error clearing localStorage:', err);
  }
};

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => loadUser());
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(() => loadAuthStatus());

  // Sync user to localStorage whenever it changes
  useEffect(() => {
    saveUser(user);
  }, [user]);

  // Sync auth status to localStorage whenever it changes
  useEffect(() => {
    saveAuthStatus(isSignedIn);
  }, [isSignedIn]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res?.success && res?.user) {
        setUser(res.user);
        setIsSignedIn(true);
      } else {
        // Clear state and storage if fetch fails
        setUser(null);
        setIsSignedIn(false);
        clearStorage();
      }
    } catch (err) {
      console.error('fetchMe error:', err);
      // Clear state and storage on error
      setUser(null);
      setIsSignedIn(false);
      clearStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we think user is signed in or we have user data in localStorage
    if (isSignedIn || user) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signin = async (email, password) => {
    try {
      const res = await authAPI.signin(email, password);
      if (res?.success && res?.user) {
        setUser(res.user);
        setIsSignedIn(true);
        // localStorage is automatically updated via useEffect
        return res;
      }
      return res;
    } catch (err) {
      console.error('signin error:', err);
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await authAPI.signup(userData);
      if (res?.success && res?.user) {
        setUser(res.user);
        // Don't set isSignedIn to true yet - wait for onboarding completion
        setIsSignedIn(false);
        // localStorage is automatically updated via useEffect
        return res;
      }
      return res;
    } catch (err) {
      console.error('signup error:', err);
      throw err;
    }
  };

  const signout = async () => {
    try {
      const res = await authAPI.signout();
      // Clear state and localStorage
      setUser(null);
      setIsSignedIn(false);
      clearStorage();
      return res;
    } catch (err) {
      console.error('signout error:', err);
      // Clear state and localStorage even on error
      setUser(null);
      setIsSignedIn(false);
      clearStorage();
      throw err;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    // localStorage will be updated automatically via useEffect
  };

  const setSignedInStatus = (value) => {
    setIsSignedIn(value);
    // localStorage will be updated automatically via useEffect
  };

  const value = {
    user,
    loading,
    isSignedIn,
    signin,
    signup,
    signout,
    fetchMe,
    setSignedIn: setSignedInStatus,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;