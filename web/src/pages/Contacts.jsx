import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'
import { useNavigate } from 'react-router-dom'

// Liste des profils du bâtiment
export const PROFILS_BATIMENT = [
  "Architecte",
  "Ingénieur",
  "Maçon",
  "Charpentier",
  "Couvreur",
  "Électricien",
  "Plombier",
  "Peintre",
  "Menuisier",
  "Carreleur",
  "Plâtrier",
  "Conducteur de travaux",
  "Bureau d'étude",
  "Fournisseur",
  "Sous-traitant",
  "Client",
  "Prospect"
]

export default function Contacts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProfil, setSelectedProfil] = useState('')
  const [viewContact, setViewContact] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { 
    (async() => { 
      try {
        const { data } = await api.get('/clients')
        setItems(normalizeListResponse(data))
      } finally {
        setLoading(false)
      }
    })() 
  }, [])

  // Filtrage combiné : recherche + profil
  const filtered = items.filter(contact => {
    const matchSearch = !search || 
      (contact.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (contact.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (contact.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (contact.phone || '').includes(search)
    
    const matchProfil = !selectedProfil || contact.profil === selectedProfil
    
    return matchSearch && matchProfil
  })

  const handleView = (contact) => {
    setViewContact(contact)
  }

  const handleEdit = (contactId) => {
    navigate(`/contacts/edit/${contactId}`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce contact ?')) return
    try {
      await api.delete(`/clients/${id}`)
      setItems(items.filter(c => c._id !== id))
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message))
    }
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button 
          onClick={() => navigate('/contacts/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Nouveau contact
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3 flex-wrap">
          {/* Recherche */}
          <input 
            type="text"
            className="flex-1 min-w-[250px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Rechercher un contact…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          
          {/* Filtre par profil */}
          <select
            value={selectedProfil}
            onChange={e => setSelectedProfil(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Tous les profils</option>
            {PROFILS_BATIMENT.map(profil => (
              <option key={profil} value={profil}>{profil}</option>
            ))}
          </select>

          {/* Bouton Filtrer */}
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Filtrer
          </button>
        </div>
        
        {/* Indicateurs de filtres actifs */}
        {(search || selectedProfil) && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Recherche: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-blue-900">×</button>
              </span>
            )}
            {selectedProfil && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Profil: {selectedProfil}
                <button onClick={() => setSelectedProfil('')} className="hover:text-green-900">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}

      {/* Tableau des contacts */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Profil</th>
                <th className="px-4 py-3">Société</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(contact => (
                <tr key={contact._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{contact.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      contact.profil ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {contact.profil || 'Non défini'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.company || '-'}</td>
                  <td className="px-4 py-3 text-blue-600">{contact.email || '-'}</td>
                  <td className="px-4 py-3">{contact.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{contact.address || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(contact)}
                        className="p-2 hover:bg-blue-50 rounded transition" 
                        title="Voir"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => handleEdit(contact._id)}
                        className="p-2 hover:bg-green-50 rounded transition" 
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(contact._id)}
                        className="p-2 hover:bg-red-50 rounded transition" 
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucun contact trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistiques en bas */}
      {!loading && (
        <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-4 rounded-lg shadow">
          <div>
            <span className="font-medium">{filtered.length}</span> contact{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {items.length !== filtered.length && (
              <span className="text-gray-400 ml-2">sur {items.length} au total</span>
            )}
          </div>
          {selectedProfil && (
            <div className="text-blue-600 font-medium">
              Profil: {selectedProfil}
            </div>
          )}
        </div>
      )}

      {/* Modal de visualisation */}
      {viewContact && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewContact(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête du modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{viewContact.name || 'Contact'}</h2>
                  {viewContact.profil && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      {viewContact.profil}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setViewContact(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Société</label>
                  <p className="mt-1 text-lg text-gray-800">{viewContact.company || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Profil</label>
                  <p className="mt-1 text-lg text-gray-800">{viewContact.profil || 'Non défini'}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📞 Coordonnées</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="mt-1 text-blue-600">
                      {viewContact.email ? (
                        <a href={`mailto:${viewContact.email}`} className="hover:underline">
                          {viewContact.email}
                        </a>
                      ) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Téléphone</label>
                    <p className="mt-1 text-gray-800">
                      {viewContact.phone ? (
                        <a href={`tel:${viewContact.phone}`} className="hover:underline">
                          {viewContact.phone}
                        </a>
                      ) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              {viewContact.address && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Adresse</h3>
                  <p className="text-gray-700">{viewContact.address}</p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="border-t pt-4 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setViewContact(null)
                    handleEdit(viewContact._id)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => setViewContact(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
