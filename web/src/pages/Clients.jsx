import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Clients(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{ 
    (async()=>{ 
      try {
        const { data } = await api.get('/clients')
        setItems(normalizeListResponse(data))
      } finally {
        setLoading(false)
      }
    })() 
  }, [])

  const filtered = items.filter(c => 
    (c.name||'').toLowerCase().includes(q.toLowerCase()) || 
    (c.company||'').toLowerCase().includes(q.toLowerCase()) ||
    (c.email||'').toLowerCase().includes(q.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce client?')) return
    try {
      await api.delete(`/clients/${id}`)
      setItems(items.filter(c => c._id !== id))
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <button 
          onClick={() => navigate('/clients/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <div className="flex gap-3 bg-white p-4 rounded-lg shadow">
        <input 
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Rechercher un client..." 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Filtrer
        </button>
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}

      {/* Tableau */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Société</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company || '-'}</td>
                  <td className="px-4 py-3 text-blue-600">{c.email || '-'}</td>
                  <td className="px-4 py-3">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.address || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded" title="Voir">👁️</button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Modifier">✏️</button>
                      <button 
                        onClick={() => handleDelete(c._id)}
                        className="p-2 hover:bg-gray-100 rounded" 
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
