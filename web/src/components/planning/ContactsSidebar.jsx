import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { PROFESSIONS, getProfession, getFullName } from '../../constants/professions';
import Avatar from '../Avatar';

export default function ContactsSidebar({ onContactDrag, selectedChantier, onSelectChantier }) {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [chantiers, setChantiers] = useState([]);
  const [chantierId, setChantierId] = useState(selectedChantier || '');
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    loadContacts();
    loadChantiers();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [search, selectedProfile, contacts]);

  // Charger l'équipe quand le chantier change
  useEffect(() => {
    if (chantierId) loadTeam(chantierId);
  }, [chantierId]);

  async function loadContacts() {
    try {
      const { data } = await api.get('/contacts');
      setContacts(data);
    } catch (e) {
      console.error('Error loading contacts:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadChantiers() {
    try {
      const { data } = await api.get('/chantiers');
      setChantiers(data);
    } catch (e) {
      console.error('Error loading chantiers:', e);
    }
  }

  async function loadTeam(id) {
    try {
      setTeamLoading(true);
      const { data } = await api.get(`/chantiers/${id}/team`);
      setTeam(data || []);
    } catch (e) {
      console.error('Error loading team:', e);
      setTeam([]);
    } finally {
      setTeamLoading(false);
    }
  }

  const teamIds = new Set(team.map(t => t.contact?._id || t.contact));

  async function addToTeam(contact) {
    if (!chantierId) return;
    if (teamIds.has(contact._id)) return;
    try {
      const profile = contact.profile || '';
      const { data } = await api.post(`/chantiers/${chantierId}/team`, { contact: contact._id, profile });
      setTeam(data || []);
    } catch (e) {
      alert('Erreur ajout équipe: ' + (e?.response?.data?.error || e.message));
    }
  }

  async function removeFromTeam(contactId) {
    if (!chantierId) return;
    try {
      await api.delete(`/chantiers/${chantierId}/team/${contactId}`);
      setTeam(prev => prev.filter(t => (t.contact?._id || t.contact) !== contactId));
    } catch (e) {
      alert('Erreur retrait équipe: ' + (e?.response?.data?.error || e.message));
    }
  }

  function filterContacts() {
    let filtered = contacts;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedProfile) {
      filtered = filtered.filter(c => c.profile === selectedProfile);
    }

    setFilteredContacts(filtered);
  }

  function handleDragStart(e, contact) {
    e.dataTransfer.setData('contact', JSON.stringify(contact));
    if (chantierId) {
      e.dataTransfer.setData('chantier', chantierId);
    }
    e.dataTransfer.effectAllowed = 'copy';
    if (onContactDrag) {
      onContactDrag(contact);
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <h2 className="text-lg font-bold text-gray-800">📍 Sélection du chantier</h2>

        {/* Sélection chantier */}
        <select
          value={chantierId}
          onChange={e => {
            setChantierId(e.target.value);
            onSelectChantier?.(e.target.value);
          }}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">-- Choisir un chantier --</option>
          {chantiers.map(ch => (
            <option key={ch._id} value={ch._id}>{ch.name || ch.title || 'Sans nom'}</option>
          ))}
        </select>

        {/* Équipe du chantier */}
        {chantierId && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">👥 Équipe du chantier</h3>
            <div className="max-h-28 overflow-y-auto space-y-2">
              {teamLoading ? (
                <div className="text-xs text-gray-500">Chargement équipe...</div>
              ) : team.length === 0 ? (
                <div className="text-xs text-gray-500">Aucun membre pour ce chantier</div>
              ) : (
                team.map((t) => (
                  <div key={t.contact?._id || t.contact} className="flex items-center justify-between text-xs bg-gray-50 border rounded px-2 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar contact={t.contact} size="sm" />
                      <span className="truncate">{getFullName(t.contact?.firstName, t.contact?.lastName)}</span>
                    </div>
                    <button
                      onClick={() => removeFromTeam(t.contact?._id || t.contact)}
                      className="px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Retirer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recherche et filtres visibles seulement après choix du chantier */}
        {chantierId && (
          <>
            <h3 className="text-sm font-semibold text-gray-700">👥 Contacts</h3>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedProfile}
              onChange={e => setSelectedProfile(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tous les profils</option>
              {PROFESSIONS.map(prof => (
                <option key={prof.value} value={prof.value}>
                  {prof.icon} {prof.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Chargement...</div>
        ) : !chantierId ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-sm">Sélectionnez d'abord un chantier pour afficher les contacts</div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm">Aucun contact trouvé</div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map(contact => {
              const prof = getProfession(contact.profile);
              return (
                <div
                  key={contact._id}
                  draggable
                  onDragStart={e => handleDragStart(e, contact)}
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-move transition group"
                  title={`Glisser pour assigner ${getFullName(contact.firstName, contact.lastName)}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar contact={contact} size="sm" showIcon />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {getFullName(contact.firstName, contact.lastName)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>{prof.icon}</span>
                        <span className="truncate">{prof.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!teamIds.has(contact._id) ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); addToTeam(contact); }}
                          className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Ajouter à l'équipe
                        </button>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">Membre ✓</span>
                      )}
                    </div>
                  </div>

                  {/* Hover details */}
                  <div className="hidden group-hover:block mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
                    {contact.phone && (
                      <div className="text-gray-600">📞 {contact.phone}</div>
                    )}
                    {contact.email && (
                      <div className="text-gray-600 truncate">📧 {contact.email}</div>
                    )}
                    {contact.company && (
                      <div className="text-gray-600 truncate">🏢 {contact.company}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>{chantierId ? filteredContacts.length : 0} contact{(chantierId ? filteredContacts.length : 0) > 1 ? 's' : ''}</span>
          <span className="text-gray-400">{chantierId ? 'Glisser-déposer pour assigner' : 'Choisir un chantier'}</span>
        </div>
      </div>
    </div>
  );
}
