import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Providers API
export const providersApi = {
  list: (params = {}) => api.get('/providers', { params }),
  get: (id) => api.get(`/providers/${id}`),
  getByPhone: (phone) => api.get(`/providers/phone/${phone}`),
  create: (data) => api.post('/providers', data),
  update: (id, data) => api.patch(`/providers/${id}`, data),
  delete: (id) => api.delete(`/providers/${id}`)
}

// Categories API
export const categoriesApi = {
  list: (params = {}) => api.get('/categories', { params }),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  seed: () => api.post('/categories/seed')
}

// Products API
export const productsApi = {
  list: (params = {}) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  getHistory: (id, params = {}) => api.get(`/products/${id}/history`, { params }),
  delete: (id) => api.delete(`/products/${id}`),
  getStats: () => api.get('/products/stats/summary')
}

// Messages API
export const messagesApi = {
  list: (params = {}) => api.get('/messages', { params }),
  getRecent: (limit = 20) => api.get('/messages/recent', { params: { limit } }),
  clearRecent: () => api.post('/messages/recent/clear'),
  get: (id) => api.get(`/messages/${id}`),
  delete: (id) => api.delete(`/messages/${id}`),
  getStats: () => api.get('/messages/stats/summary')
}

export default api
