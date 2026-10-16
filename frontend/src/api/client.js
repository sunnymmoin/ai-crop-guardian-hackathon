import axios from 'axios'

// In development Vite proxies /api to the backend. In production set VITE_API_URL
// (for example https://ai-crop-backend.onrender.com/api).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

const TOKEN_KEY = 'cropGuardian.token'
const USER_KEY = 'cropGuardian.user'

// localStorage can throw in private windows, so every access is guarded.
export const session = {
  get token() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  get user() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  },
  save(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch { /* login still works for this page view */ }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch { /* nothing stored */ }
  },
}

let handleUnauthorized = () => {}

/** Called when the backend rejects the saved token, so the UI can show the user as logged out. */
export function setUnauthorizedHandler(handler) {
  handleUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = session.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && session.token) {
      session.clear()
      handleUnauthorized()
    }
    return Promise.reject(error)
  },
)

/** The backend's error message, or a fallback when the server could not be reached. */
export function errorMessage(error, fallback = 'Cannot reach the server. Please check that the backend is running.') {
  return error?.response?.data?.detail || fallback
}

const data = (request) => request.then((response) => response.data)

export const authApi = {
  register: (body) => data(api.post('/auth/register', body)),
  login: (body) => data(api.post('/auth/login', body)),
  me: () => data(api.get('/auth/me')),
}

/** Upload a leaf photo. Returns disease_en/ur, recommendation_en/ur, confidence, mode, scan_id. */
export function diagnoseLeaf(file) {
  const formData = new FormData()
  formData.append('file', file)
  return data(api.post('/predict', formData))
}

export const cultivationApi = {
  list: () => data(api.get('/cultivation')),
  add: (crop) => data(api.post('/cultivation', crop)),
}

export const analyticsApi = {
  summary: () => data(api.get('/analytics/summary')),
  heatmap: () => data(api.get('/analytics/heatmap')),
  ads: () => data(api.get('/ads')),
  createAd: (ad) => data(api.post('/ads', ad)),
}
