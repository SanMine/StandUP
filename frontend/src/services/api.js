import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

  //Get current employer's jobs
  getMyJobs: async (params = {}) => {
    const response = await api.get('/jobs/my-jobs', { params });
    return response.data;
  },

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
  },

  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
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
  },

  deleteApplication: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },

  // Saved Jobs
  getSavedJobs: async () => {
    const response = await api.get('/applications/saved/jobs');
    return response.data;
  },

  saveJob: async (jobId) => {
    const response = await api.post('/applications/saved', { jobId });
    return response.data;
  },

  unsaveJob: async (jobId) => {
    const response = await api.delete(`/applications/saved/${jobId}`);
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
  },

  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/portfolio/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await api.delete(`/portfolio/projects/${projectId}`);
    return response.data;
  }
};

// Resume API calls
export const resumeAPI = {
  getResume: async () => {
    const response = await api.get('/resume');
    return response.data;
  },

  updateResume: async (resumeData) => {
    const response = await api.put('/resume', resumeData);
    return response.data;
  },

  // Education management
  addEducation: async (educationData) => {
    const response = await api.post('/resume/education', educationData);
    return response.data;
  },

  updateEducation: async (educationId, educationData) => {
    const response = await api.put(`/resume/education/${educationId}`, educationData);
    return response.data;
  },

  deleteEducation: async (educationId) => {
    const response = await api.delete(`/resume/education/${educationId}`);
    return response.data;
  },

  // Experience management
  addExperience: async (experienceData) => {
    const response = await api.post('/resume/experience', experienceData);
    return response.data;
  },

  updateExperience: async (experienceId, experienceData) => {
    const response = await api.put(`/resume/experience/${experienceId}`, experienceData);
    return response.data;
  },

  deleteExperience: async (experienceId) => {
    const response = await api.delete(`/resume/experience/${experienceId}`);
    return response.data;
  },

  // ATS score
  calculateATSScore: async () => {
    const response = await api.get('/resume/ats-score');
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

// Candidate API calls (Employer only)
export const candidateAPI = {
  // Get all candidates
  getCandidates: async (params = {}) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  // Get single candidate
  getCandidateById: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  // Update candidate status
  updateStatus: async (id, status) => {
    const response = await api.put(`/candidates/${id}/status`, { status });
    return response.data;
  },

  // Update candidate notes
  updateNotes: async (id, notes) => {
    const response = await api.put(`/candidates/${id}/notes`, { notes });
    return response.data;
  },

  // Update candidate rating
  updateRating: async (id, rating) => {
    const response = await api.put(`/candidates/${id}/rating`, { rating });
    return response.data;
  },

  // Update candidate tags
  updateTags: async (id, tags) => {
    const response = await api.put(`/candidates/${id}/tags`, { tags });
    return response.data;
  },

  // Schedule interview
  scheduleInterview: async (id, interview_date) => {
    const response = await api.put(`/candidates/${id}/interview`, { interview_date });
    return response.data;
  },

  // Update interview link
  updateInterviewLink: async (id, interview_link, interview_date) => {
    const response = await api.put(`/candidates/${id}/interview-link`, { interview_link, interview_date });
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/candidates/stats');
    return response.data;
  },

  // Delete candidate
  deleteCandidate: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  }
};

export default api;