import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { getFullName } from '../../constants/professions';
import Avatar, { AvatarGroup } from '../Avatar';

export default function AssignmentModal({ assignment, onSave, onClose }) {
  const [formData, setFormData] = useState({
    chantier: '',
    startDatetime: '',
    endDatetime: '',
    assignedContacts: [],
    note: '',
    colorTag: '#3B82F6'
  });
  const [chantiers, setChantiers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContactsPicker, setShowContactsPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (assignment) {
      setFormData({
        chantier: assignment.chantier?._id || assignment.chantier || '',
        startDatetime: formatDatetimeLocal(assignment.startDatetime),
        endDatetime: formatDatetimeLocal(assignment.endDatetime),
        assignedContacts: assignment.assignedContacts?.map(c => c._id || c) || [],
        note: assignment.note || '',
        colorTag: assignment.colorTag || '#3B82F6'
      });
    }
  }, [assignment]);

  async function loadData() {
    try {
      const [chantiersRes, contactsRes] = await Promise.all([
        api.get('/chantiers'),
        api.get('/contacts')
      ]);
      setChantiers(chantiersRes.data);
      setContacts(contactsRes.data);
      setAvailableContacts(contactsRes.data);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }

  function formatDatetimeLocal(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        startDatetime: new Date(formData.startDatetime).toISOString(),
        endDatetime: new Date(formData.endDatetime).toISOString()
      };

      if (assignment?._id) {
        await api.put(`/assignments/${assignment._id}`, payload);
      } else {
        await api.post('/assignments', payload);
      }

      onSave?.();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }

  function toggleContact(contactId) {
    setFormData(prev => ({
      ...prev,
      assignedContacts: prev.assignedContacts.includes(contactId)
        ? prev.assignedContacts.filter(id => id !== contactId)
        : [...prev.assignedContacts, contactId]
    }));
  }

  const selectedContacts = contacts.filter(c => formData.assignedContacts.includes(c._id));

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#A855F7'
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {assignment?._id ? '✏️ Modifier l\'assignment' : '➕ Nouvelle assignment'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Chantier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chantier *
            </label>
            <select
              value={formData.chantier}
              onChange={e => setFormData({ ...formData, chantier: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">-- Sélectionner un chantier --</option>
              {chantiers.map(ch => (
                <option key={ch._id} value={ch._id}>
                  {ch.name || ch.title || 'Sans nom'}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Début *
              </label>
              <input
                type="datetime-local"
                value={formData.startDatetime}
                onChange={e => setFormData({ ...formData, startDatetime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fin *
              </label>
              <input
                type="datetime-local"
                value={formData.endDatetime}
                onChange={e => setFormData({ ...formData, endDatetime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Contacts assignés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contacts assignés
            </label>
            
            {selectedContacts.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedContacts.map(contact => (
                  <div
                    key={contact._id}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <Avatar contact={contact} size="sm" />
                    <span>{getFullName(contact.firstName, contact.lastName)}</span>
                    <button
                      type="button"
                      onClick={() => toggleContact(contact._id)}
                      className="hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowContactsPicker(!showContactsPicker)}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600"
            >
              {showContactsPicker ? '▲ Masquer les contacts' : '▼ Ajouter des contacts'}
            </button>

            {showContactsPicker && (
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg p-2 space-y-1">
                {availableContacts.map(contact => (
                  <label
                    key={contact._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedContacts.includes(contact._id)}
                      onChange={() => toggleContact(contact._id)}
                      className="w-4 h-4"
                    />
                    <Avatar contact={contact} size="sm" showIcon />
                    <span className="text-sm">{getFullName(contact.firstName, contact.lastName)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, colorTag: color })}
                  className={`w-10 h-10 rounded-full border-4 transition ${
                    formData.colorTag === color ? 'border-gray-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire / Note
            </label>
            <textarea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ajouter un commentaire..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.chantier || !formData.startDatetime || !formData.endDatetime}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Enregistrement...' : (assignment?._id ? '💾 Enregistrer' : '✅ Créer')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
