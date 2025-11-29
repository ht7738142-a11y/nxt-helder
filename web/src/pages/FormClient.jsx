import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { PROFILS_BATIMENT } from './Contacts'

export default function FormClient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company: '', profil: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!id

  // Charger les données si mode édition
  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true)
        try {
          const { data } = await api.get(`/clients/${id}`)
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            company: data.company || '',
            profil: data.profil || ''
          })
        } catch (e) {
          setError('Erreur lors du chargement: ' + (e?.response?.data?.error || e.message))
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [id])

  function set(k, v) { setForm(s => ({ ...s, [k]: v })) }

  async function submit(e) {
    e.preventDefault(); setError(''); setOk('')
    try {
      if (isEdit) {
        await api.put(`/clients/${id}`, form)
        setOk('Contact modifié avec succès')
        setTimeout(() => navigate('/contacts'), 1500)
      } else {
        await api.post('/clients', form)
        setOk('Contact créé avec succès')
        setForm({ name: '', email: '', phone: '', address: '', company: '', profil: '' })
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    }
  }

  if (loading) {
    return <div className="max-w-xl mx-auto bg-white p-6 rounded border">
      <p className="text-center">Chargement...</p>
    </div>
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded border shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Modifier le contact' : 'Nouveau contact'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/contacts')}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      {ok && <div className="mb-3 text-green-700 text-sm">{ok}</div>}
      <form onSubmit={submit} className="grid gap-3">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e=>set('name', e.target.value)} required />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2" value={form.email} onChange={e=>set('email', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Téléphone</label>
            <input className="w-full border rounded px-3 py-2" value={form.phone} onChange={e=>set('phone', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Adresse</label>
          <input className="w-full border rounded px-3 py-2" value={form.address} onChange={e=>set('address', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Société</label>
          <input className="w-full border rounded px-3 py-2" value={form.company} onChange={e=>set('company', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Profil</label>
          <select 
            className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={form.profil} 
            onChange={e=>set('profil', e.target.value)}
          >
            <option value="">-- Sélectionner un profil --</option>
            {PROFILS_BATIMENT.map(profil => (
              <option key={profil} value={profil}>{profil}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2.5 font-medium transition"
          >
            {isEdit ? '💾 Enregistrer les modifications' : '✅ Créer le contact'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/contacts')}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded py-2.5 font-medium transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
