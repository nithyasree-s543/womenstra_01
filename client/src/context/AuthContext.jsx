import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('womentra_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('womentra_token') || null);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeDependent, setActiveDependent] = useState(null);

  // Check /api/auth/me on mount using httpOnly cookie and/or Bearer token
  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const savedToken = localStorage.getItem('womentra_token');
        const res = await api.getCurrentUser(savedToken);
        if (isMounted) {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('womentra_user');
            localStorage.removeItem('womentra_token');
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuthStatus();
    return () => {
      isMounted = false;
    };
  }, []);

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

  /**
   * REGISTER: name + phone + password + village + language
   */
  const register = async ({ phone, password, name, village, language }) => {
    setLoading(true);
    try {
      const res = await api.register({ phone, password, name, village, language });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * PASSWORD LOGIN: phone + password → get OTP challenge
   */
  const loginWithPassword = async ({ phone, password, language }) => {
    setLoading(true);
    try {
      const res = await api.loginWithPassword({ phone, password, language });
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * OTP VERIFY: finalises login and sets user + token
   */
  const loginWithPhoneOtp = async ({ phone, otp, name, village, language }) => {
    setLoading(true);
    try {
      const res = await api.verifyOtp({ phone, otp, name, village, language });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed.' };
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

  const logout = async () => {
    try {
      await api.logout();
    } catch { }
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
      isCheckingAuth,
      register,
      loginWithPassword,
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
