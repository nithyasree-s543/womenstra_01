import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('womentra_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('womentra_token') || null);
  const [loading, setLoading] = useState(false);
  const [activeDependent, setActiveDependent] = useState(null); // When mother switches to daughter profile

  useEffect(() => {
    if (user) {
      localStorage.setItem('womentra_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('womentra_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('womentra_token', token);
    } else {
      localStorage.removeItem('womentra_token');
    }
  }, [token]);

  const loginWithPhoneOtp = async ({ phone, otp, name, village, language }) => {
    setLoading(true);
    try {
      const res = await api.verifyOtp({ phone, otp, name, village, language });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfileVoice = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.voiceOnboard({ userId: user?.id, ...profileData });
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserState = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveDependent(null);
    localStorage.removeItem('womentra_user');
    localStorage.removeItem('womentra_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      loginWithPhoneOtp,
      updateProfileVoice,
      updateUserState,
      logout,
      activeDependent,
      setActiveDependent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
