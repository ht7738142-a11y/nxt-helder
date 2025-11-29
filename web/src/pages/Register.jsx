import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('commercial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError(''); setOk('')
    try {
      await api.post('/auth/register', { name, email, password, role })
      setOk('Compte créé. Vous pouvez vous connecter.')
      setTimeout(()=>navigate('/login'), 700)
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded border">
      <h1 className="text-xl font-semibold mb-4">Créer un compte</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      {ok && <div className="mb-3 text-green-700 text-sm">{ok}</div>}
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Rôle</label>
          <select className="w-full border rounded px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="commercial">Commercial</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button disabled={loading} className="w-full bg-teal-600 text-white py-2 rounded">{loading?'Création...':'Créer'}</button>
      </form>
    </div>
  )
}
