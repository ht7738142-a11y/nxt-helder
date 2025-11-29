import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PROFESSIONS, getProfession, getFullName } from '../constants/professions';
import Avatar from '../components/Avatar';

export default function ContactsNew() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewContact, setViewContact] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [search, selectedProfile, contacts]);

  async function loadContacts() {
    try {
      setLoading(true);
      const { data } = await api.get('/contacts');
      setContacts(data);
    } catch (e) {
      console.error('Error loading contacts:', e);
    } finally {
      setLoading(false);
    }
  }

  function filterContacts() {
    let filtered = contacts;

    // Filtre par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower) ||
        c.company?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.includes(search)
      );
    }

    // Filtre par profil
    if (selectedProfile) {
      filtered = filtered.filter(c => c.profile === selectedProfile);
    }

    setFilteredContacts(filtered);
    setCurrentPage(1);
  }

  async function handleDelete(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  }

  function openCreateModal() {
    setEditContact({
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      profile: '',
      notes: ''
    });
    setShowModal(true);
  }

  function openEditModal(contact) {
    setEditContact({ ...contact });
    setShowModal(true);
  }

  async function handleSaveContact() {
    try {
      if (editContact._id) {
        // Update
        const { data } = await api.put(`/contacts/${editContact._id}`, editContact);
        setContacts(contacts.map(c => c._id === data._id ? data : c));
      } else {
        // Create
        const { data } = await api.post('/contacts', editContact);
        setContacts([data, ...contacts]);
      }
      setShowModal(false);
      setEditContact(null);
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
          <p className="text-gray-600 text-sm mt-1">Gérez vos contacts du bâtiment</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-md transition flex items-center gap-2"
        >
          <span className="text-lg">+</span> Nouveau contact
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher par nom, société, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[250px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedProfile}
            onChange={e => setSelectedProfile(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Tous les profils</option>
            {PROFESSIONS.map(prof => (
              <option key={prof.value} value={prof.value}>
                {prof.icon} {prof.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtres actifs */}
        {(search || selectedProfile) && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                🔍 "{search}"
                <button onClick={() => setSearch('')} className="hover:text-blue-900 font-bold">×</button>
              </span>
            )}
            {selectedProfile && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {getProfession(selectedProfile).icon} {getProfession(selectedProfile).label}
                <button onClick={() => setSelectedProfile('')} className="hover:text-green-900 font-bold">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {loading && <div className="text-center p-8">Chargement...</div>}

      {/* Tableau des contacts */}
      {!loading && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <tr className="text-left text-gray-700 font-semibold">
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Profil</th>
                  <th className="px-4 py-3">Société</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map(contact => {
                  const prof = getProfession(contact.profile);
                  return (
                    <tr key={contact._id} className="border-b hover:bg-blue-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar contact={contact} size="md" showIcon />
                          <div>
                            <div className="font-medium text-gray-900">
                              {getFullName(contact.firstName, contact.lastName)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          <span>{prof.icon}</span>
                          <span>{prof.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{contact.company || '-'}</td>
                      <td className="px-4 py-3 text-blue-600">{contact.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{contact.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewContact(contact)}
                            className="p-2 hover:bg-blue-100 rounded transition"
                            title="Voir"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openEditModal(contact)}
                            className="p-2 hover:bg-green-100 rounded transition"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id)}
                            className="p-2 hover:bg-red-100 rounded transition"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedContacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <div>Aucun contact trouvé</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredContacts.length)} sur {filteredContacts.length} contacts
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Voir Contact */}
      {viewContact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewContact(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar contact={viewContact} size="xl" showIcon />
                  <div>
                    <h2 className="text-2xl font-bold">{getFullName(viewContact.firstName, viewContact.lastName)}</h2>
                    <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      {getProfession(viewContact.profile).icon} {getProfession(viewContact.profile).label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewContact(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {viewContact.company && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Société</label>
                  <p className="mt-1 text-lg text-gray-800">{viewContact.company}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-semibold text-gray-600">📧 Email</label>
                  <p className="mt-1 text-blue-600">
                    {viewContact.email ? <a href={`mailto:${viewContact.email}`} className="hover:underline">{viewContact.email}</a> : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">📞 Téléphone</label>
                  <p className="mt-1 text-gray-800">
                    {viewContact.phone ? <a href={`tel:${viewContact.phone}`} className="hover:underline">{viewContact.phone}</a> : '-'}
                  </p>
                </div>
              </div>

              {viewContact.address && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-600">📍 Adresse</label>
                  <p className="mt-1 text-gray-700">{viewContact.address}</p>
                </div>
              )}

              {viewContact.notes && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-600">📝 Notes</label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{viewContact.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setViewContact(null);
                    openEditModal(viewContact);
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

      {/* Modal Créer/Modifier Contact */}
      {showModal && editContact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editContact._id ? '✏️ Modifier le contact' : '➕ Nouveau contact'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={editContact.firstName}
                    onChange={e => setEditContact({ ...editContact, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={editContact.lastName}
                    onChange={e => setEditContact({ ...editContact, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profil</label>
                <select
                  value={editContact.profile}
                  onChange={e => setEditContact({ ...editContact, profile: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Sélectionner un profil --</option>
                  {PROFESSIONS.map(prof => (
                    <option key={prof.value} value={prof.value}>
                      {prof.icon} {prof.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
                <input
                  type="text"
                  value={editContact.company}
                  onChange={e => setEditContact({ ...editContact, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editContact.email}
                    onChange={e => setEditContact({ ...editContact, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={editContact.phone}
                    onChange={e => setEditContact({ ...editContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={editContact.address}
                  onChange={e => setEditContact({ ...editContact, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editContact.notes}
                  onChange={e => setEditContact({ ...editContact, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveContact}
                  disabled={!editContact.firstName || !editContact.lastName}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editContact._id ? '💾 Enregistrer' : '✅ Créer'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
