// Frontend API service layer connecting to Womentra Node.js/Express backend

const API_BASE = '/api';

export const api = {
  // Auth

  /** Register new user with name + phone + password + village + language */
  register: async ({ phone, password, name, village, language }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, name, village, language })
    });
    return res.json();
  },

  /** Password login step 1: validates password, returns OTP challenge */
  loginWithPassword: async ({ phone, password, language }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, language })
    });
    return res.json();
  },

  sendOtp: async (phone, language = 'en') => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, language })
    });
    return res.json();
  },

  verifyOtp: async ({ phone, otp, name, village, language }) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name, village, language })
    });
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  },

  voiceOnboard: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/voice-onboard`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  getCurrentUser: async (token) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      headers
    });
    return res.json();
  },

  linkDependent: async (data) => {
    const res = await fetch(`${API_BASE}/auth/dependents`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Schemes (Sarkari Saathi)
  getSchemes: async (category = 'all', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/schemes?${params.toString()}`);
    return res.json();
  },

  getSchemeById: async (id) => {
    const res = await fetch(`${API_BASE}/schemes/${id}`);
    return res.json();
  },

  checkEligibility: async (formData) => {
    const res = await fetch(`${API_BASE}/schemes/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  },

  applyScheme: async (appData) => {
    const res = await fetch(`${API_BASE}/schemes/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return res.json();
  },

  getMyApplications: async (userId) => {
    const res = await fetch(`${API_BASE}/schemes/my-applications?userId=${userId || 'user-1'}`);
    return res.json();
  },

  getCSCCenters: async () => {
    const res = await fetch(`${API_BASE}/schemes/csc/locations`);
    return res.json();
  },

  // Courses & Learning
  getCourses: async (category = 'all') => {
    const params = category !== 'all' ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/courses${params}`);
    return res.json();
  },

  getCourseById: async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}`);
    return res.json();
  },

  recordProgress: async (data) => {
    const res = await fetch(`${API_BASE}/courses/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  submitQuiz: async (quizData) => {
    const res = await fetch(`${API_BASE}/courses/quiz-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    });
    return res.json();
  },

  // Mentors
  getMentors: async (language, skill) => {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (skill) params.append('skill', skill);
    const res = await fetch(`${API_BASE}/mentors?${params.toString()}`);
    return res.json();
  },

  getMyMentor: async (userId) => {
    const res = await fetch(`${API_BASE}/mentors/my-mentor?userId=${userId || 'user-1'}`);
    return res.json();
  },

  assignMentor: async (userId, mentorId) => {
    const res = await fetch(`${API_BASE}/mentors/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mentorId })
    });
    return res.json();
  },

  rateMentor: async (rateData) => {
    const res = await fetch(`${API_BASE}/mentors/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rateData)
    });
    return res.json();
  },

  bookSession: async (bookData) => {
    const res = await fetch(`${API_BASE}/mentors/book-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    return res.json();
  },

  registerTutor: async (tutorData) => {
    const res = await fetch(`${API_BASE}/mentors/register-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tutorData)
    });
    return res.json();
  },

  // Community
  getCommunityPosts: async (category = 'all') => {
    const params = category !== 'all' ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/community/posts${params}`);
    return res.json();
  },

  createPost: async (postData) => {
    const res = await fetch(`${API_BASE}/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    return res.json();
  },

  likePost: async (id) => {
    const res = await fetch(`${API_BASE}/community/posts/${id}/like`, { method: 'POST' });
    return res.json();
  },

  reportPost: async (id, reason) => {
    const res = await fetch(`${API_BASE}/community/posts/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  // AI Voice Assistant ("Womentra Didi")
  askDidi: async (prompt, language = 'hi', userContext = {}) => {
    const res = await fetch(`${API_BASE}/ai/didi-voice-assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language, userContext })
    });
    return res.json();
  },

  // Payments & Packages
  getPackages: async () => {
    const res = await fetch(`${API_BASE}/payments/packages`);
    return res.json();
  },

  createPaymentOrder: async (packageId, userId) => {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, userId })
    });
    return res.json();
  },

  verifyPayment: async (payData) => {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payData)
    });
    return res.json();
  },

  redeemSponsorCode: async (code, userId) => {
    const res = await fetch(`${API_BASE}/payments/redeem-sponsor-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId })
    });
    return res.json();
  },

  // Daily Affirmations & Stories
  getDailyAffirmation: async () => {
    const res = await fetch(`${API_BASE}/daily-affirmation`);
    return res.json();
  },

  // Live Tutoring Rooms
  getLiveSessions: async () => {
    const res = await fetch(`${API_BASE}/live-sessions`);
    return res.json();
  },

  // Safety & Tracking
  shareLocation: async (locData) => {
    const res = await fetch(`${API_BASE}/tracking/share-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locData)
    });
    return res.json();
  },

  getActiveShares: async () => {
    const res = await fetch(`${API_BASE}/tracking/active-shares`);
    return res.json();
  },

  // Admin
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE}/admin/overview`);
    return res.json();
  },

  getPendingKyc: async () => {
    const res = await fetch(`${API_BASE}/admin/pending-kyc`);
    return res.json();
  },

  approveKyc: async (id, status, notes) => {
    const res = await fetch(`${API_BASE}/admin/approve-kyc/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes: notes })
    });
    return res.json();
  }
};
