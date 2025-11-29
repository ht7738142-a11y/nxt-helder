import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function Companies(){
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(()=>{ 
    (async()=>{ 
      try{ 
        const { data } = await api.get('/companies')
        const list = normalizeListResponse(data)
        setItems(list)
        setFilteredItems(list)
      }catch(e){ 
        setError(e?.response?.data?.error || e.message) 
      } finally{ 
        setLoading(false) 
      } 
    })() 
  }, [])

  useEffect(() => {
    if (search) {
      setFilteredItems(items.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      ))
    } else {
      setFilteredItems(items)
    }
  }, [search, items])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette entreprise?')) return
    try {
      await api.delete(`/companies/${id}`)
      const updated = items.filter(c => c._id !== id)
      setItems(updated)
      setFilteredItems(updated)
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Entreprises</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Nouveau
        </button>
      </div>

      {/* Recherche */}
      <div className="flex gap-3 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Filtrer
        </button>
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Tableau */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Profil</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">N° de TVA</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(c => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.type || 'Entreprise'}</td>
                  <td className="px-4 py-3">{c.phone || '-'}</td>
                  <td className="px-4 py-3">{c.tva || '-'}</td>
                  <td className="px-4 py-3 text-blue-600">{c.email || '-'}</td>
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
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucune entreprise trouvée
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
