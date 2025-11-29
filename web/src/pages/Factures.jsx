import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function Factures() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    (async () => {
      try {
        console.log('Factures: fetching...')
        const { data } = await api.get('/factures')
        console.log('Factures: received data:', data)
        const list = normalizeListResponse(data)
        console.log('Factures: normalized list:', list)
        setItems(list)
      } catch (err) {
        console.error('Factures: error loading:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = items.filter(f =>
    (f.invoiceNumber||'').toLowerCase().includes(q.toLowerCase()) ||
    (f.client?.name||'').toLowerCase().includes(q.toLowerCase())
  )

  const StatusBadge = ({ status }) => {
    const colors = {
      paid: 'bg-green-500 text-white',
      unpaid: 'bg-red-500 text-white',
      partial: 'bg-orange-500 text-white',
      overdue: 'bg-red-700 text-white'
    }
    const labels = {
      paid: 'Payée',
      unpaid: 'À payer',
      partial: 'Partielle',
      overdue: 'En retard'
    }
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Factures</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Nouvelle facture
        </button>
      </div>

      {/* Recherche */}
      <div className="flex gap-3 bg-white p-4 rounded-lg shadow">
        <input 
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Rechercher une facture..." 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Filtrer
        </button>
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Tableau */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">N° Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Montant TTC</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{f.issueDate ? new Date(f.issueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 font-medium">{f.invoiceNumber || f.number || '-'}</td>
                  <td className="px-4 py-3">{f.client?.name || '-'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{(f.totals?.grandTotal || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">
                        📄 PDF
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Modifier">✏️</button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Supprimer">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucune facture trouvée
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
