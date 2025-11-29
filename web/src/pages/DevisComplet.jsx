import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, normalizeListResponse } from '../api'

export default function DevisComplet(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selectedClient, setSelectedClient] = useState('all')
  const [selectedResponsible, setSelectedResponsible] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'grid'
  const [selectedItems, setSelectedItems] = useState([])
  const [showContextMenu, setShowContextMenu] = useState(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Extraction des valeurs uniques pour filtres
  const clients = [...new Set(items.map(d => d.client?.name).filter(Boolean))]
  const responsibles = [...new Set(items.map(d => d.responsible).filter(Boolean))]
  const statuses = ['draft', 'sent', 'approved', 'rejected', 'in_progress']
  const states = ['accepted', 'in_progress', 'pending', 'rejected']
  const types = ['Gros-oeuvre', 'Maçonnerie', 'Électricité', 'Plomberie', 'Autre']

  // Filtrage
  const filtered = items.filter(d => {
    if (q && !(d.title||'').toLowerCase().includes(q.toLowerCase()) && 
        !(d.client?.name||'').toLowerCase().includes(q.toLowerCase())) return false
    if (selectedClient !== 'all' && d.client?.name !== selectedClient) return false
    if (selectedResponsible !== 'all' && d.responsible !== selectedResponsible) return false
    if (selectedStatus !== 'all' && d.status !== selectedStatus) return false
    if (selectedState !== 'all' && d.state !== selectedState) return false
    if (selectedType !== 'all' && d.siteType !== selectedType) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedItems.map(d => d._id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleExport = (format) => {
    alert(`Export ${format} de ${selectedItems.length || filtered.length} devis`)
  }

  const handleBulkDelete = () => {
    if (confirm(`Supprimer ${selectedItems.length} devis?`)) {
      setItems(items.filter(d => !selectedItems.includes(d._id)))
      setSelectedItems([])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Devis
          {filtered.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length})</span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('PDF')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
          >
            📄 PDF
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
          >
            📊 Excel
          </button>
          <Link to="/devis/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            + Nouveau devis
          </Link>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid md:grid-cols-6 gap-3">
          <input 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Rechercher..." 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
          />
          
          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            <option value="all">Tous les clients</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedResponsible}
            onChange={e => setSelectedResponsible(e.target.value)}
          >
            <option value="all">Tous les responsables</option>
            {responsibles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tous les statuts actifs</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="all">Tous les types de chant.</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Filtrer
          </button>
        </div>

        {/* Options d'affichage */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Vue liste"
            >
              ☰
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Vue grille"
            >
              ⊞
            </button>
            <select 
              className="ml-4 px-3 py-1 border rounded text-sm"
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded">
              <span className="text-sm font-medium text-blue-700">{selectedItems.length} sélectionnés</span>
              <button 
                onClick={() => handleExport('PDF')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Exporter
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}

      {/* Tableau */}
      {!loading && viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 w-12">
                  <input 
                    type="checkbox"
                    checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
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
              {paginatedItems.map((d, index) => (
                <tr key={d._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox"
                      checked={selectedItems.includes(d._id)}
                      onChange={() => handleSelectItem(d._id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-4 py-3">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 font-medium">{d.client?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{d.title || d.reference || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status || 'in_progress'} /></td>
                  <td className="px-4 py-3"><StateBadge state={d.state || 'accepted'} /></td>
                  <td className="px-4 py-3 font-bold text-gray-900">{(d.totals?.grandTotal || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-600">{d.siteType || 'Gros-oeuvre'}</td>
                  <td className="px-4 py-3 text-gray-600">{d.responsible || 'Marie S'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button className="p-2 hover:bg-gray-100 rounded" title="Voir">👁️</button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Modifier">✏️</button>
                      <button 
                        onClick={() => setShowContextMenu(showContextMenu === d._id ? null : d._id)}
                        className="p-2 hover:bg-gray-100 rounded" 
                        title="Plus d'options"
                      >
                        ⋮
                      </button>
                      {showContextMenu === d._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-48">
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">📄 Dupliquer</button>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">📧 Envoyer par email</button>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">📥 Télécharger PDF</button>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">📦 Archiver</button>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-red-600">🗑️ Supprimer</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    Aucun devis trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                Affichage {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filtered.length)} sur {filtered.length} résultats
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue grille */}
      {!loading && viewMode === 'grid' && (
        <div className="grid md:grid-cols-3 gap-4">
          {paginatedItems.map(d => (
            <div key={d._id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">{d.client?.name || '-'}</div>
                  <div className="text-sm text-gray-600">{d.title || 'Sans titre'}</div>
                </div>
                <input 
                  type="checkbox"
                  checked={selectedItems.includes(d._id)}
                  onChange={() => handleSelectItem(d._id)}
                  className="rounded"
                />
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={d.status || 'in_progress'} />
                  <StateBadge state={d.state || 'accepted'} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{(d.totals?.grandTotal || 0).toFixed(2)} €</div>
                <div className="text-sm text-gray-600">{d.siteType || 'Gros-oeuvre'}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-gray-500">{d.responsible || 'Marie S'}</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded text-sm">👁️</button>
                  <button className="p-1 hover:bg-gray-100 rounded text-sm">✏️</button>
                  <button className="p-1 hover:bg-gray-100 rounded text-sm">⋮</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
