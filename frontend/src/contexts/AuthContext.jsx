import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res?.success) {
        setUser(res.user);
        setIsSignedIn(true);
      } else {
        setUser(null);
        setIsSignedIn(false);
      }
    } catch (err) {
      setUser(null);
      setIsSignedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const signin = async (email, password) => {
    const res = await authAPI.signin(email, password);
    if (res?.success) {
      setUser(res.user);
      setIsSignedIn(true);
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await authAPI.signup(userData);
    if (res?.success) {
      setUser(res.user);
      setIsSignedIn(false); // Keep false until they actually sign in
    }
    return res;
  };

  const signout = async () => {
    try {
      const res = await authAPI.signout();
      setUser(null);
      setIsSignedIn(false);
      return res;
    } catch (err) {
      setUser(null);
      setIsSignedIn(false);
      throw err;
    }
  };

  const setSignedIn = (value) => {
    setIsSignedIn(value);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSignedIn, signin, signup, signout, fetchMe, setSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;