import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AvatarGroup } from '../components/Avatar';
import Avatar from '../components/Avatar';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { DraggableTask, DroppableCell } from '../components/planning/TaskCell';
import AssignmentModal from '../components/planning/AssignmentModal';

export default function PlanningVertuoza() {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [assignments, setAssignments] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedChantier, setSelectedChantier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    loadData();
    loadWeather();
  }, [currentWeek]);

  async function loadData() {
    setLoading(true);
    try {
      const weekDays = getWeekDays(currentWeek);
      const start = weekDays[0];
      const end = new Date(weekDays[6]);
      end.setHours(23, 59, 59, 999);

      const [assignmentsRes, chantiersRes, contactsRes] = await Promise.all([
        api.get(`/assignments?start=${start.toISOString()}&end=${end.toISOString()}`),
        api.get('/chantiers'),
        api.get('/contacts')
      ]);

      setAssignments(assignmentsRes.data);
      setChantiers(chantiersRes.data);
      setContacts(contactsRes.data);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeather() {
    // Simulation météo - à remplacer par une vraie API comme OpenWeatherMap
    const weekDays = getWeekDays(currentWeek);
    const mockWeather = {};
    
    weekDays.forEach((date, idx) => {
      const temps = [18, 19, 20, 17, 18, 22, 23];
      const conditions = ['partly_cloudy', 'rainy', 'rainy', 'cloudy', 'sunny', 'sunny', 'sunny'];
      mockWeather[date.toDateString()] = {
        temp: temps[idx],
        condition: conditions[idx]
      };
    });
    
    setWeather(mockWeather);
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
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

  function navigateWeek(direction) {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  }

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function getContactsForDay(date) {
    const dayAssignments = assignments.filter(a => {
      const start = new Date(a.startDatetime);
      return start.toDateString() === date.toDateString();
    });

    const contactIds = new Set();
    dayAssignments.forEach(a => {
      a.assignedContacts?.forEach(c => contactIds.add(c._id || c));
    });

    return contacts.filter(c => contactIds.has(c._id));
  }

  function getAssignmentsForDayAndChantier(date, chantierId) {
    return assignments.filter(a => {
      const start = new Date(a.startDatetime);
      const chantierMatch = !chantierId || a.chantier?._id === chantierId || a.chantier === chantierId;
      return start.toDateString() === date.toDateString() && chantierMatch;
    });
  }

  const weekDays = getWeekDays(currentWeek);
  const weekNum = getWeekNumber(currentWeek);
  const filteredChantiers = chantiers.filter(ch => 
    !searchTerm || ch.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleDragStart(event) {
    setActiveTask(event.active.data.current);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    
    if (over && active.data.current) {
      const task = active.data.current;
      const { day, chantier } = over.data.current;
      
      // Mettre à jour la tâche avec la nouvelle date/chantier
      updateTaskDateTime(task, day, chantier);
    }
    
    setActiveTask(null);
  }

  async function updateTaskDateTime(task, newDay, newChantier) {
    try {
      const start = new Date(newDay);
      start.setHours(8, 0, 0, 0);
      const end = new Date(newDay);
      end.setHours(17, 0, 0, 0);

      await api.put(`/assignments/${task._id}`, {
        chantier: newChantier,
        startDatetime: start.toISOString(),
        endDatetime: end.toISOString()
      });

      loadData();
    } catch (e) {
      console.error('Error updating task:', e);
      alert('Erreur lors du déplacement: ' + (e?.response?.data?.error || e.message));
    }
  }

  function handleEditTask(task) {
    setEditingAssignment(task);
    setShowModal(true);
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
      await api.delete(`/assignments/${taskId}`);
      loadData();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  }

  function handleModalSave() {
    setShowModal(false);
    setEditingAssignment(null);
    loadData();
  }

  const weatherIcons = {
    sunny: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rainy: '🌧️'
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
              📅
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Plannings</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
              - Réduire
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              🎚️ Filtres {showFilters && '▾'}
            </button>
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              📤 Exporter
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un chantier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentWeek(getWeekStart(new Date()))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Aujourd'hui
            </button>
            <div className="text-sm font-semibold text-gray-700">
              Semaine {weekNum} | Du {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              ▶
            </button>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
              <option>Semaine ▾</option>
              <option>Mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Gauche - Style Vertuoza */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            {/* Chantiers */}
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Chantiers
            </div>
            {filteredChantiers.slice(0, 5).map(chantier => (
              <button
                key={chantier._id}
                onClick={() => setSelectedChantier(selectedChantier === chantier._id ? null : chantier._id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-sm ${
                  selectedChantier === chantier._id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">🏗️</span>
                  <span className="truncate">{chantier.name || chantier.title || 'Sans nom'}</span>
                </div>
                {selectedChantier === chantier._id && <span>▸</span>}
              </button>
            ))}

            {/* Météo */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Météo
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                Prévisions intégrées
              </div>
            </div>

            {/* Ressources */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Ressources
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>👷</span>
                  <span>Ouvriers</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>🤝</span>
                  <span>Indépendants</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>🚗</span>
                  <span>Voitures</span>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Informations de chantier
              </div>
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Tâches
                </div>
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Carnet de route
                </div>
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Pièces jointes
                </div>
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Suivis de chantier
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille Planning */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header avec jours et avatars */}
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="bg-gray-50 p-4"></div>
                  {weekDays.map((day, idx) => {
                    const dayContacts = getContactsForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 text-center border-l border-gray-200 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                      >
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold mb-3 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                        
                        {/* Avatars des contacts du jour */}
                        {dayContacts.length > 0 && (
                          <div className="flex justify-center mb-2">
                            <AvatarGroup contacts={dayContacts} max={4} size="sm" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Lignes de chantiers */}
                {filteredChantiers.slice(0, 10).map((chantier, chantierIdx) => {
                  const hasAssignments = weekDays.some(day => 
                    getAssignmentsForDayAndChantier(day, chantier._id).length > 0
                  );

                  if (!hasAssignments && selectedChantier !== chantier._id) return null;

                  return (
                    <div key={chantier._id} className={`grid grid-cols-8 border-b border-gray-200 min-h-[120px] ${chantierIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="p-4 font-medium text-sm text-gray-900 border-r border-gray-200 flex items-start">
                        <div className="truncate">
                          <div className="font-semibold">{chantier.name || chantier.title || 'Sans nom'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {chantier.client?.name || chantier.address || ''}
                          </div>
                        </div>
                      </div>

                      {weekDays.map((day, dayIdx) => {
                        const dayAssignments = getAssignmentsForDayAndChantier(day, chantier._id);
                        const weatherData = weather[day.toDateString()];

                        return (
                          <DroppableCell
                            key={dayIdx}
                            day={day}
                            chantier={chantier._id}
                            weather={weatherData}
                          >
                            {dayAssignments.map(task => (
                              <DraggableTask
                                key={task._id}
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </DroppableCell>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="p-2 rounded-lg shadow-lg border-l-4 opacity-90" style={{
            backgroundColor: activeTask.colorTag + '40',
            borderLeftColor: activeTask.colorTag || '#3B82F6'
          }}>
            <div className="text-xs font-semibold text-gray-900">
              {activeTask.chantier?.name || 'Sans nom'}
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Modal */}
      {showModal && (
        <AssignmentModal
          assignment={editingAssignment}
          onSave={handleModalSave}
          onClose={() => {
            setShowModal(false);
            setEditingAssignment(null);
          }}
        />
      )}
    </div>
    </DndContext>
  );
}
