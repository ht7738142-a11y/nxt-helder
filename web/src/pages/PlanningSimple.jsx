import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { getFullName, getProfession } from '../constants/professions';
import Avatar, { AvatarGroup } from '../components/Avatar';

export default function PlanningSimple() {
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chantiers, setChantiers] = useState([]);
  const [selectedChantier, setSelectedChantier] = useState('');
  const [team, setTeam] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChantiers();
  }, []);

  useEffect(() => {
    if (selectedChantier) {
      loadTeam();
      loadAssignments();
    }
  }, [selectedChantier, currentDate, view]);

  async function loadChantiers() {
    try {
      const { data } = await api.get('/chantiers');
      setChantiers(data);
    } catch (e) {
      console.error('Error loading chantiers:', e);
    }
  }

  async function loadTeam() {
    try {
      const { data } = await api.get(`/chantiers/${selectedChantier}/team`);
      setTeam(data || []);
    } catch (e) {
      console.error('Error loading team:', e);
    }
  }

  async function loadAssignments() {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      const { data } = await api.get(`/assignments?start=${start.toISOString()}&end=${end.toISOString()}&chantier=${selectedChantier}`);
      setAssignments(data);
    } catch (e) {
      console.error('Error loading assignments:', e);
    } finally {
      setLoading(false);
    }
  }

  function getDateRange() {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(weekStart) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function navigateDate(direction) {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  }

  function handleDrop(e, date) {
    e.preventDefault();
    try {
      const contactData = e.dataTransfer.getData('contact');
      if (contactData) {
        const contact = JSON.parse(contactData);
        handleAssignContact(contact, date);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  }

  async function handleAssignContact(contact, date) {
    if (!selectedChantier) {
      alert('Veuillez sélectionner un chantier');
      return;
    }

    try {
      const startDatetime = new Date(date);
      startDatetime.setHours(8, 0, 0, 0);
      const endDatetime = new Date(date);
      endDatetime.setHours(17, 0, 0, 0);

      await api.post('/assignments', {
        chantier: selectedChantier,
        startDatetime: startDatetime.toISOString(),
        endDatetime: endDatetime.toISOString(),
        assignedContacts: [contact._id || contact],
        colorTag: contact.colorTag || '#3B82F6'
      });

      loadAssignments();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  }

  async function handleRemoveContact(assignmentId) {
    if (!confirm('⚠️ Retirer ce contact du planning ?\n\nCette action supprimera l\'assignation pour ce jour.')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      loadAssignments();
    } catch (e) {
      alert('❌ Erreur lors du retrait: ' + (e?.response?.data?.error || e.message));
    }
  }

  function getAssignmentsForDay(date) {
    return assignments.filter(a => {
      const start = new Date(a.startDatetime);
      return start.toDateString() === date.toDateString();
    });
  }

  function handleDragStart(e, contact) {
    e.dataTransfer.setData('contact', JSON.stringify(contact));
    e.dataTransfer.effectAllowed = 'copy';
  }

  const weekStart = getWeekStart(currentDate);
  const weekDays = getWeekDays(weekStart);
  const weekNum = getWeekNumber(currentDate);
  const selectedChantierData = chantiers.find(ch => ch._id === selectedChantier);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">📅 Planning</h1>
            
            {/* Boutons de vue */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-1.5 text-sm font-medium transition ${
                  view === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-1.5 text-sm font-medium transition ${
                  view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-4 py-1.5 text-sm font-medium transition ${
                  view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Mois
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded hover:bg-gray-100 transition"
              title="Précédent"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm font-medium"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded hover:bg-gray-100 transition"
              title="Suivant"
            >
              ▶
            </button>
            <div className="text-sm font-semibold text-gray-700">
              {view === 'week' && `Semaine ${weekNum} | `}
              {view === 'day' ? currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) :
               view === 'week' ? `Du ${weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` :
               currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Sélection chantier */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Chantier :</label>
          <select
            value={selectedChantier}
            onChange={e => setSelectedChantier(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Sélectionner un chantier --</option>
            {chantiers.map(ch => (
              <option key={ch._id} value={ch._id}>
                {ch.name || ch.title || 'Sans nom'} - {ch.client?.name || ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Contacts */}
        {selectedChantier && (
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-2">👥 Équipe</h2>
              <p className="text-xs text-gray-500">
                {selectedChantierData?.name || selectedChantierData?.title}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {team.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  Aucun contact pour ce chantier
                </div>
              ) : (
                team.map(t => {
                  const contact = t.contact;
                  const prof = getProfession(contact?.profile);
                  return (
                    <div
                      key={contact?._id}
                      draggable
                      onDragStart={e => handleDragStart(e, contact)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-move transition"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar contact={contact} size="md" showIcon />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {getFullName(contact?.firstName, contact?.lastName)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{prof.icon}</span>
                            <span>{prof.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              {team.length} contact{team.length > 1 ? 's' : ''} · Glisser-déposer dans le planning
            </div>
          </div>
        )}

        {/* Planning Grid */}
        <div className="flex-1 overflow-auto">
          {!selectedChantier ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <div className="text-lg font-medium">Sélectionnez un chantier pour commencer</div>
                <div className="text-sm mt-2">Utilisez le menu déroulant ci-dessus</div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : view === 'day' ? (
            <DayView date={currentDate} assignments={assignments} onDrop={handleDrop} onRemove={handleRemoveContact} />
          ) : view === 'month' ? (
            <MonthView currentDate={currentDate} assignments={assignments} onDrop={handleDrop} onRemove={handleRemoveContact} />
          ) : (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header jours */}
                <div className="grid grid-cols-7 border-b">
                  {weekDays.map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayAssignments = getAssignmentsForDay(day);
                    const uniqueContacts = [];
                    dayAssignments.forEach(a => {
                      a.assignedContacts?.forEach(c => {
                        if (!uniqueContacts.find(uc => uc._id === c._id)) {
                          uniqueContacts.push(c);
                        }
                      });
                    });

                    return (
                      <div
                        key={idx}
                        className={`p-4 text-center border-r last:border-r-0 ${
                          isToday ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className={`text-xl font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </div>
                        {uniqueContacts.length > 0 && (
                          <div className="flex justify-center">
                            <AvatarGroup contacts={uniqueContacts} max={3} size="sm" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cellules de dépôt */}
                <div className="grid grid-cols-7">
                  {weekDays.map((day, idx) => {
                    const dayAssignments = getAssignmentsForDay(day);
                    return (
                      <div
                        key={idx}
                        className="border-r last:border-r-0 min-h-[400px] p-3 hover:bg-blue-50 transition"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, day)}
                      >
                        <div className="space-y-2">
                          {dayAssignments.map(assignment => (
                            <div
                              key={assignment._id}
                              className="p-2 rounded-lg shadow-sm border-l-4 group relative"
                              style={{
                                backgroundColor: assignment.colorTag + '20',
                                borderLeftColor: assignment.colorTag || '#3B82F6'
                              }}
                            >
                              {assignment.assignedContacts?.map(contact => (
                                <div key={contact._id} className="flex items-center gap-2 mb-1 last:mb-0 group/item hover:bg-white rounded px-1 -mx-1">
                                  <Avatar contact={contact} size="sm" showIcon />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 truncate">
                                      {getFullName(contact.firstName, contact.lastName)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {getProfession(contact.profile).icon} {getProfession(contact.profile).label}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveContact(assignment._id)}
                                    className="opacity-0 group-hover/item:opacity-100 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition"
                                    title="Retirer ce contact"
                                  >
                                    Retirer
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Vue Jour
function DayView({ date, assignments, onDrop, onRemove }) {
  const dayAssignments = assignments.filter(a => {
    const start = new Date(a.startDatetime);
    return start.toDateString() === date.toDateString();
  });

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-2xl font-bold">
            {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div
          className="p-6 min-h-[500px]"
          onDragOver={e => e.preventDefault()}
          onDrop={e => onDrop(e, date)}
        >
          {dayAssignments.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-3">📋</div>
              <div>Aucun contact assigné pour ce jour</div>
              <div className="text-sm mt-2">Glissez-déposez des contacts depuis la sidebar</div>
            </div>
          ) : (
            <div className="space-y-3">
              {dayAssignments.map(assignment => (
                <div
                  key={assignment._id}
                  className="p-4 rounded-lg shadow-sm border-l-4 group relative"
                  style={{
                    backgroundColor: assignment.colorTag + '20',
                    borderLeftColor: assignment.colorTag || '#3B82F6'
                  }}
                >
                  {assignment.assignedContacts?.map(contact => (
                    <div key={contact._id} className="flex items-center gap-3 mb-2 last:mb-0 group/item hover:bg-gray-50 rounded-lg p-2 -m-2 transition">
                      <Avatar contact={contact} size="md" showIcon />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {getFullName(contact.firstName, contact.lastName)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getProfession(contact.profile).icon} {getProfession(contact.profile).label}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(assignment._id)}
                        className="opacity-0 group-hover/item:opacity-100 px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-sm transition"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Vue Mois
function MonthView({ currentDate, assignments, onDrop, onRemove }) {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  function getAssignmentsForDay(date) {
    if (!date) return [];
    return assignments.filter(a => {
      const start = new Date(a.startDatetime);
      return start.toDateString() === date.toDateString();
    });
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-7">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50 border-b">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, idx) => {
            const dayAssignments = getAssignmentsForDay(date);
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 border-b border-r ${
                  !date ? 'bg-gray-50' : date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                }`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => date && onDrop(e, date)}
              >
                {date && (
                  <>
                    <div className="text-sm font-semibold text-gray-700 mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayAssignments.map(assignment => (
                        assignment.assignedContacts?.map(contact => (
                          <div
                            key={contact._id}
                            className="text-xs p-1 rounded truncate group relative"
                            style={{ backgroundColor: assignment.colorTag + '30' }}
                          >
                            <div className="flex items-center gap-1">
                              <Avatar contact={contact} size="sm" />
                              <span className="truncate flex-1">{getFullName(contact.firstName, contact.lastName)}</span>
                              <button
                                onClick={() => onRemove(assignment._id)}
                                className="opacity-0 group-hover:opacity-100 px-1 text-red-600 hover:text-red-800 font-bold"
                                title="Retirer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
