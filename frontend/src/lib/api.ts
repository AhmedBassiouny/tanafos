import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      
      // Only redirect if not already on auth pages
      const authPaths = ['/login', '/signup', '/']
      if (!authPaths.includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const auth = {
  signup: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
}

// Tasks API calls
export const tasks = {
  getAll: () => api.get('/tasks'),
  getById: (id: number) => api.get(`/tasks/${id}`)
}

// Progress API calls
export const progress = {
  log: (data: { taskId: number; value: number }) =>
    api.post('/progress', data),
  
  getToday: () => api.get('/progress/today')
}

// Leaderboard API calls
export const leaderboard = {
  getOverall: () => api.get('/leaderboard'),
  getByTask: (taskId: number) => api.get(`/leaderboard/${taskId}`)
}

// User API calls
export const user = {
  getStats: () => api.get('/user/stats'),
  getProfile: () => api.get('/user/profile')
}