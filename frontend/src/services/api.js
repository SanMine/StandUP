import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if using JWT instead of sessions
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signin: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  signout: async () => {
    const response = await api.post('/auth/signout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// User Profile API calls
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  updateSkills: async (skills) => {
    const response = await api.post('/users/skills', { skills });
    return response.data;
  }
};

// Jobs API calls
export const jobsAPI = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },
  
  getJob: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },
  
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  }
};

// Applications API calls
export const applicationsAPI = {
  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  
  applyForJob: async (jobId, notes) => {
    const response = await api.post('/applications', { jobId, notes });
    return response.data;
  },
  
  updateApplication: async (applicationId, updates) => {
    const response = await api.put(`/applications/${applicationId}`, updates);
    return response.data;
  }
};

// Mentors API calls
export const mentorsAPI = {
  getMentors: async () => {
    const response = await api.get('/mentors');
    return response.data;
  },
  
  bookSession: async (mentorId, sessionData) => {
    const response = await api.post('/mentors/sessions', { mentorId, ...sessionData });
    return response.data;
  }
};

// Learning API calls
export const learningAPI = {
  getCourses: async () => {
    const response = await api.get('/learning/courses');
    return response.data;
  },

  // Server-side proxied Coursera endpoint
  getCoursera: async () => {
    const response = await api.get('/learning/courses/coursera');
    return response.data;
  },
  
  getEvents: async () => {
    const response = await api.get('/learning/events');
    return response.data;
  }
};

// Portfolio API calls
export const portfolioAPI = {
  getProjects: async () => {
    const response = await api.get('/portfolio/projects');
    return response.data;
  },
  
  createProject: async (projectData) => {
    const response = await api.post('/portfolio/projects', projectData);
    return response.data;
  }
};

// AI API calls
export const aiAPI = {
  matchJobs: async (preferences) => {
    const response = await api.post('/ai/match-jobs', preferences);
    return response.data;
  },
  
  analyzeResume: async (resumeText) => {
    const response = await api.post('/ai/analyze-resume', { resumeText });
    return response.data;
  }
};

export default api;
