import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, normalizeListResponse } from '../api'

export default function Devis(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(()=>{ 
    (async()=>{ 
      try {
        const { data } = await api.get('/devis')
        setItems(normalizeListResponse(data))
      } catch (err) {
        console.error('Devis: error loading', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = items.filter(d => 
    (d.title||'').toLowerCase().includes(q.toLowerCase()) ||
    (d.client?.name||'').toLowerCase().includes(q.toLowerCase())
  )

  const StatusBadge = ({ status }) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
      in_progress: 'bg-blue-500 text-white'
    }
    const labels = {
      draft: 'Chantier en cours',
      sent: 'Envoyé',
      approved: 'Accepté',
      rejected: 'Rejeté',
      in_progress: 'Chantier en cours'
    }
    return <span className={`px-3 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
  }

  const StateBadge = ({ state }) => {
    const colors = {
      accepted: 'bg-green-500 text-white',
      in_progress: 'bg-blue-500 text-white',
      pending: 'bg-orange-500 text-white',
      rejected: 'bg-red-500 text-white'
    }
    const labels = {
      accepted: 'Accepté',
      in_progress: 'En cours',
      pending: 'En attente',
      rejected: 'Rejeté'
    }
    return <span className={`px-3 py-1 rounded text-xs font-medium ${colors[state] || 'bg-green-500 text-white'}`}>{labels[state] || 'Accepté'}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Devis</h1>
        <Link to="/devis/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Nouveau devis
        </Link>
      </div>

      {/* Recherche */}
      <div className="flex gap-3 bg-white p-4 rounded-lg shadow">
        <input 
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Rechercher un devis..." 
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
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Type de chantier</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, index) => (
                <tr key={d._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{filtered.length - index}</td>
                  <td className="px-4 py-3">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 font-medium">{d.client?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{d.title || d.reference || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status || 'in_progress'} /></td>
                  <td className="px-4 py-3"><StateBadge state={d.state || 'accepted'} /></td>
                  <td className="px-4 py-3 font-bold text-gray-900">{(d.totals?.grandTotal || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-600">{d.siteType || 'Gros-oeuvre'}</td>
                  <td className="px-4 py-3 text-gray-600">{d.responsible || 'Marie S'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded" title="Voir">👁️</button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Modifier">✏️</button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Menu">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    Aucun devis trouvé
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
