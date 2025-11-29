import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, normalizeListResponse } from '../api'

export default function GestionChantiers(){
  const navigate = useNavigate()
  const [chantiers, setChantiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedManager, setSelectedManager] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [selectedItems, setSelectedItems] = useState([])
  const [showContextMenu, setShowContextMenu] = useState(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(()=>{ 
    loadChantiers()
  }, [])

  async function loadChantiers(){ 
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/chantiers')
      const normalized = normalizeListResponse(data)
      setChantiers(normalized)
    } catch (err) {
      console.error('Erreur chargement chantiers:', err)
      setError('Erreur de chargement')
      // Données de démo si erreur
      setChantiers([
        {
          _id: '1',
          title: 'Gros oeuvre Villa Dupont',
          address: 'rue des moines, 87, 93003 Paris France',
          client: { name: 'Dupuis SPRL', _id: '1' },
          status: 'en_cours',
          progress: 45,
          manager: 'Jean Michel',
          startDate: '2024-06-03',
          endDate: '2024-07-09',
          costEstimate: 15765.25,
          costActual: 7419.04
        },
        {
          _id: '2',
          title: 'Électricité Maison Dupont',
          address: '45 rue Victor Hugo, 75001 Paris',
          client: { name: 'Dupont Nicolas', _id: '2' },
          status: 'en_attente',
          progress: 15,
          manager: 'Marie Sprumont',
          startDate: '2024-06-10',
          endDate: '2024-07-20',
          costEstimate: 8500.00,
          costActual: 1200.00
        },
        {
          _id: '3',
          title: 'Carrelage Villa Rousselot',
          address: '23 avenue des Champs, 75008 Paris',
          client: { name: 'Elise Rousselot', _id: '3' },
          status: 'termine',
          progress: 100,
          manager: 'Jean Michel',
          startDate: '2024-05-15',
          endDate: '2024-06-15',
          costEstimate: 12000.00,
          costActual: 11800.00
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Filtrage
  const clients = [...new Set(chantiers.map(c => c.client?.name).filter(Boolean))]
  const managers = [...new Set(chantiers.map(c => c.manager).filter(Boolean))]
  const statuses = ['en_cours', 'en_attente', 'termine', 'annule']

  const filtered = chantiers.filter(c => {
    if (searchQuery && !(c.title||'').toLowerCase().includes(searchQuery.toLowerCase()) && 
        !(c.client?.name||'').toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedClient !== 'all' && c.client?.name !== selectedClient) return false
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false
    if (selectedManager !== 'all' && c.manager !== selectedManager) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const StatusBadge = ({ status }) => {
    const config = {
      en_cours: { bg: 'bg-blue-500', text: 'text-white', label: 'En cours' },
      en_attente: { bg: 'bg-orange-500', text: 'text-white', label: 'En attente' },
      termine: { bg: 'bg-green-500', text: 'text-white', label: 'Terminé' },
      annule: { bg: 'bg-red-500', text: 'text-white', label: 'Annulé' }
    }
    const c = config[status] || config.en_cours
    return <span className={`px-3 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedItems.map(c => c._id))
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

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce chantier?')) return
    try {
      await api.delete(`/chantiers/${id}`)
      setChantiers(chantiers.filter(c => c._id !== id))
      alert('Chantier supprimé')
    } catch (err) {
      console.error('Erreur suppression:', err)
      // En démo, supprimer quand même
      setChantiers(chantiers.filter(c => c._id !== id))
      alert('Chantier supprimé (mode démo)')
    }
  }

  const handleBulkDelete = () => {
    if (!confirm(`Supprimer ${selectedItems.length} chantiers?`)) return
    setChantiers(chantiers.filter(c => !selectedItems.includes(c._id)))
    setSelectedItems([])
    alert(`${selectedItems.length} chantiers supprimés`)
  }

  const handleExport = (format) => {
    const items = selectedItems.length > 0 
      ? chantiers.filter(c => selectedItems.includes(c._id))
      : filtered
    
    if (format === 'PDF') {
      alert(`Export PDF de ${items.length} chantiers (fonctionnalité à implémenter)`)
    } else if (format === 'Excel') {
      // Créer un CSV simple
      const headers = ['Nom', 'Client', 'Statut', 'Progression', 'Manager', 'Coût estimé', 'Coût actuel']
      const rows = items.map(c => [
        c.title,
        c.client?.name || '',
        c.status,
        c.progress + '%',
        c.manager || '',
        c.costEstimate,
        c.costActual
      ])
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chantiers_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      alert('Export Excel téléchargé!')
    }
  }

  const handleDuplicate = (chantier) => {
    const newChantier = {
      ...chantier,
      _id: Date.now().toString(),
      title: chantier.title + ' (copie)',
      progress: 0,
      status: 'en_attente'
    }
    setChantiers([newChantier, ...chantiers])
    alert('Chantier dupliqué!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          🏗️ Gestion des Chantiers
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
          <button 
            onClick={() => alert('Formulaire création chantier à implémenter')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            + Nouveau chantier
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid md:grid-cols-5 gap-3">
          <input 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Rechercher chantier ou client..." 
            value={searchQuery} 
            onChange={e=>setSearchQuery(e.target.value)} 
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
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="en_attente">En attente</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>

          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedManager}
            onChange={e => setSelectedManager(e.target.value)}
          >
            <option value="all">Tous les gestionnaires</option>
            {managers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <button 
            onClick={() => {
              setSelectedClient('all')
              setSelectedStatus('all')
              setSelectedManager('all')
              setSearchQuery('')
            }}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Réinitialiser
          </button>
        </div>

        {/* Options affichage */}
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
            </select>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded">
              <span className="text-sm font-medium text-blue-700">{selectedItems.length} sélectionnés</span>
              <button 
                onClick={() => handleExport('Excel')}
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
      {error && <div className="p-4 bg-yellow-50 text-yellow-800 rounded">Mode démo activé (API non disponible)</div>}

      {/* Vue liste */}
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
                  />
                </th>
                <th className="px-4 py-3">Chantier</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Progression</th>
                <th className="px-4 py-3">Gestionnaire</th>
                <th className="px-4 py-3">Coût estimé</th>
                <th className="px-4 py-3">Coût actuel</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(c => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox"
                      checked={selectedItems.includes(c._id)}
                      onChange={() => handleSelectItem(c._id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3">{c.client?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.address}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${c.progress}%`}}
                        />
                      </div>
                      <span className="text-xs font-medium">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.manager || '-'}</td>
                  <td className="px-4 py-3 font-bold">{c.costEstimate?.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-600">{c.costActual?.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 relative">
                      <Link 
                        to={`/chantiers/${c._id}`}
                        className="p-2 hover:bg-gray-100 rounded" 
                        title="Voir détail"
                      >
                        👁️
                      </Link>
                      <button 
                        onClick={() => alert('Édition à implémenter')}
                        className="p-2 hover:bg-gray-100 rounded" 
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => setShowContextMenu(showContextMenu === c._id ? null : c._id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        ⋮
                      </button>
                      {showContextMenu === c._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-48">
                          <button 
                            onClick={() => {handleDuplicate(c); setShowContextMenu(null)}}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                          >
                            📄 Dupliquer
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">
                            📧 Envoyer rapport
                          </button>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">
                            📦 Archiver
                          </button>
                          <button 
                            onClick={() => {handleDelete(c._id); setShowContextMenu(null)}}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    Aucun chantier trouvé
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
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  ←
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
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
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
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
          {paginatedItems.map(c => (
            <div key={c._id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{c.title}</div>
                  <div className="text-sm text-gray-600">{c.client?.name}</div>
                </div>
                <input 
                  type="checkbox"
                  checked={selectedItems.includes(c._id)}
                  onChange={() => handleSelectItem(c._id)}
                />
              </div>
              <div className="space-y-2 mb-3">
                <StatusBadge status={c.status} />
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${c.progress}%`}}
                    />
                  </div>
                  <span className="text-xs font-medium">{c.progress}%</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{c.costEstimate?.toFixed(2)} €</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-gray-500">{c.manager}</span>
                <div className="flex gap-1">
                  <Link to={`/chantiers/${c._id}`} className="p-1 hover:bg-gray-100 rounded text-sm">👁️</Link>
                  <button onClick={() => handleDuplicate(c)} className="p-1 hover:bg-gray-100 rounded text-sm">📄</button>
                  <button onClick={() => handleDelete(c._id)} className="p-1 hover:bg-gray-100 rounded text-sm">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
