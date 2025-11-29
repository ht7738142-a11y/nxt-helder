import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import FileUploader from '../components/FileUploader'

export default function Chantiers(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [uploadFor, setUploadFor] = useState(null)

  async function load(){ 
    try {
      const { data } = await api.get('/chantiers')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load() }, [])

  async function onUpload(id, files){
    const fd = new FormData()
    files.forEach(f=>fd.append('files', f))
    await api.post(`/chantiers/${id}/files`, fd)
    setUploadFor(null)
    await load()
  }

  const filtered = items.filter(c => 
    (c.title||'').toLowerCase().includes(q.toLowerCase()) || 
    (c.client?.name||'').toLowerCase().includes(q.toLowerCase())
  )

  const StatusBadge = ({ status }) => {
    const colors = {
      preparation: 'bg-gray-100 text-gray-800',
      en_cours: 'bg-blue-500 text-white',
      termine: 'bg-green-500 text-white',
      suspendu: 'bg-orange-500 text-white',
      annule: 'bg-red-500 text-white'
    }
    const labels = {
      preparation: 'Préparation',
      en_cours: 'En cours',
      termine: 'Terminé',
      suspendu: 'Suspendu',
      annule: 'Annulé'
    }
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Chantiers</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Nouveau chantier
        </button>
      </div>

      {/* Recherche */}
      <div className="flex gap-3 bg-white p-4 rounded-lg shadow">
        <input 
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Rechercher un chantier..." 
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
                <th className="px-4 py-3">Chantier</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Avancement</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.title || '-'}</div>
                    <div className="text-xs text-gray-500">{c.address || ''}</div>
                  </td>
                  <td className="px-4 py-3">{c.client?.name || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${c.progress || 0}%`}}></div>
                      </div>
                      <span className="text-xs font-medium">{c.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div>Estimé: <span className="font-medium">{c.costEstimate || 0} €</span></div>
                      <div>Réel: <span className="font-bold text-gray-900">{c.costActual || 0} €</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/chantiers/${c._id}`} className="p-2 hover:bg-gray-100 rounded" title="Voir">👁️</Link>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Modifier">✏️</button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Fichiers" onClick={()=>setUploadFor(c._id)}>📎</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Aucun chantier trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {uploadFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Ajouter des fichiers</h3>
            <FileUploader onFiles={(files)=>onUpload(uploadFor, files)} />
            <button 
              onClick={()=>setUploadFor(null)}
              className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 w-full"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
