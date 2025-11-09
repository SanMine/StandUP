import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res?.success) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
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
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await authAPI.signup(userData);
    if (res?.success) {
      setUser(res.user);
    }
    return res;
  };

  const signout = async () => {
    try {
      const res = await authAPI.signout();
      setUser(null);
      return res;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
