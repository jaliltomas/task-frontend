// Detects if running on localhost and uses appropriate backend URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const API_URL = isLocalhost 
  ? 'http://localhost:8000/api'
  : 'http://34.72.106.241:8000/api'

export const API_BASE = isLocalhost 
  ? 'http://localhost:8000'
  : 'http://34.72.106.241:8000'
