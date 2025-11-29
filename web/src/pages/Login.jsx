import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setTokens } from '../api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@nxt.com')
  const [password, setPassword] = useState('admin123')
  const [otp, setOtp] = useState('')
  const [needOtp, setNeedOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      console.log('Login: attempting login for', email)
      const payload = needOtp && otp ? { email, password, otp } : { email, password }
      const { data } = await api.post('/auth/login', payload)
      console.log('Login: success, got token and user:', data.user?.name)
      
      if (!data.accessToken) {
        throw new Error('Pas de token reçu du serveur')
      }
      
      setTokens(data.accessToken, data.refreshToken)
      onLogin?.(data.user)
      console.log('Login: navigating to dashboard')
      navigate('/dashboard')
    } catch (e) {
      console.error('Login: error', e)
      const msg = e?.response?.data?.error || e.message || 'Erreur de connexion'
      setError(msg)
      if (msg?.toLowerCase().includes('otp')) setNeedOtp(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d4a7c] to-[#1e3a5f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo et Titre NXT Helder */}
        <div className="flex flex-col items-center mb-6">
          {/* Logo cercle */}
          <div className="mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-blue-400">
              <div className="text-center">
                <div className="text-white font-bold text-xl">NXT</div>
                <div className="text-blue-200 font-semibold text-xs">HELDER</div>
              </div>
            </div>
          </div>
          {/* Titre */}
          <h1 className="text-4xl font-bold text-white mb-1">NXT Helder</h1>
          <p className="text-blue-300 text-sm">Gestion BTP Pro</p>
        </div>

        {/* Formulaire blanc */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-5">
            {/* Champ Login */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login</label>
              <input 
                className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={email} 
                onChange={e=>setEmail(e.target.value)}
                placeholder="admin@nxt.com"
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input 
                type="password" 
                className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {/* Code OTP si nécessaire */}
            {needOtp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code OTP (6 chiffres)</label>
                <input 
                  inputMode="numeric" 
                  pattern="\\d{6}" 
                  maxLength={6} 
                  className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={otp} 
                  onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))}
                  placeholder="123456"
                />
              </div>
            )}

            {/* Bouton Se connecter */}
            <button 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>NXT Helder Pro © 2025 - version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
