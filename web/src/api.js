import axios from 'axios'

// Base URL de l'API (normalisée pour inclure /api)
const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_BASE = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE.replace(/\/$/, '')}/api`

// Instance Axios
export const api = axios.create({ baseURL: API_BASE })

// ⚡ Gestion des tokens
export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('nxt_access', accessToken)
  localStorage.setItem('nxt_refresh', refreshToken)
  setAuthToken(accessToken)
}

export function getAccessToken() {
  return localStorage.getItem('nxt_access')
}

export function getRefreshToken() {
  return localStorage.getItem('nxt_refresh')
}

export function clearTokens() {
  localStorage.removeItem('nxt_access')
  localStorage.removeItem('nxt_refresh')
  setAuthToken(null)
}

// ⚡ Auth header pour Axios
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// ⚡ getToken (pour App.jsx)
export function getToken() {
  return getAccessToken()
}

// 🚨 Intercepteurs globaux: redirection sur 401 et messages erreurs
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      // Token invalide/expiré -> nettoyage et redirection login
      try { clearTokens() } catch {}
      // Eviter boucle infinie si déjà sur /login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    // Laisser l'appelant gérer l'erreur avec un message propre
    return Promise.reject(error)
  }
)

// Helper: normaliser réponse API (pagination ou array direct)
export function normalizeListResponse(data) {
  // Si c'est déjà un array, retourner tel quel
  if (Array.isArray(data)) return data
  // Si c'est un objet avec items (pagination), retourner items
  if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items
  // Sinon, retourner array vide
  return []
}
