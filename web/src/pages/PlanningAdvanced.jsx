import React, { useState, useEffect } from 'react';
import { api } from '../api';
import ContactsSidebar from '../components/planning/ContactsSidebar';
import AssignmentModal from '../components/planning/AssignmentModal';
import { AvatarGroup } from '../components/Avatar';

export default function PlanningAdvanced() {
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [draggedContact, setDraggedContact] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentDate, view]);

  async function loadData() {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const [assignmentsRes, chantiersRes] = await Promise.all([
        api.get(`/assignments?start=${start.toISOString()}&end=${end.toISOString()}`),
        api.get('/chantiers')
      ]);
      setAssignments(assignmentsRes.data);
      setChantiers(chantiersRes.data);
    } catch (e) {
      console.error('Error loading data:', e);
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
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
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

  function handleDropOnCell(date, hour, contact) {
    if (!contact) return;

    // Créer une nouvelle assignment
    const startDatetime = new Date(date);
    startDatetime.setHours(hour || 8, 0, 0, 0);
    
    const endDatetime = new Date(startDatetime);
    endDatetime.setHours((hour || 8) + 2, 0, 0, 0);

    setSelectedAssignment({
      startDatetime: startDatetime.toISOString(),
      endDatetime: endDatetime.toISOString(),
      assignedContacts: [contact]
    });
    setShowModal(true);
  }

  function handleCellDrop(e, date, hour) {
    e.preventDefault();
    try {
      const contactData = e.dataTransfer.getData('contact');
      if (contactData) {
        const contact = JSON.parse(contactData);
        handleDropOnCell(date, hour, contact);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  }

  function handleAssignmentClick(assignment) {
    setSelectedAssignment(assignment);
    setShowModal(true);
  }

  function handleModalSave() {
    setShowModal(false);
    setSelectedAssignment(null);
    loadData();
  }

  async function handleDeleteAssignment(assignmentId) {
    if (!confirm('Supprimer cette assignment ?')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      loadData();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">📅 Planning</h1>
          
          {/* View selector */}
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

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded hover:bg-gray-100 transition"
            title="Précédent"
          >
            ←
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
            →
          </button>
          <div className="text-lg font-semibold text-gray-800">
            {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedAssignment(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-md transition"
        >
          + Nouvelle assignment
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ContactsSidebar onContactDrag={setDraggedContact} />

        {/* Planning grid */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : view === 'week' ? (
            <WeekView
              currentDate={currentDate}
              assignments={assignments}
              onCellDrop={handleCellDrop}
              onAssignmentClick={handleAssignmentClick}
              onDeleteAssignment={handleDeleteAssignment}
            />
          ) : view === 'day' ? (
            <DayView
              currentDate={currentDate}
              assignments={assignments}
              onCellDrop={handleCellDrop}
              onAssignmentClick={handleAssignmentClick}
              onDeleteAssignment={handleDeleteAssignment}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              assignments={assignments}
              onAssignmentClick={handleAssignmentClick}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AssignmentModal
          assignment={selectedAssignment}
          onSave={handleModalSave}
          onClose={() => {
            setShowModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}

// Week View Component
function WeekView({ currentDate, assignments, onCellDrop, onAssignmentClick, onDeleteAssignment }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6h à 20h
  const days = [];
  
  const monday = new Date(currentDate);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push(date);
  }

  function getAssignmentsForCell(date, hour) {
    return assignments.filter(a => {
      const start = new Date(a.startDatetime);
      const end = new Date(a.endDatetime);
      const cellStart = new Date(date);
      cellStart.setHours(hour, 0, 0, 0);
      const cellEnd = new Date(date);
      cellEnd.setHours(hour + 1, 0, 0, 0);
      
      return start < cellEnd && end > cellStart;
    });
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 bg-gray-50 font-semibold text-gray-600 text-sm">Heure</div>
          {days.map((date, idx) => (
            <div
              key={idx}
              className={`p-3 text-center font-semibold border-l ${
                date.toDateString() === new Date().toDateString()
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-xs uppercase">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
              <div className="text-lg">{date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        {hours.map((hour, hourIdx) => (
          <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[80px]">
            <div className="p-2 bg-gray-50 text-gray-600 text-sm font-medium border-r flex items-start">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {days.map((date, dayIdx) => {
              const cellAssignments = getAssignmentsForCell(date, hour);
              return (
                <div
                  key={dayIdx}
                  className="border-l p-1 relative hover:bg-blue-50 transition"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => onCellDrop(e, date, hour)}
                >
                  {cellAssignments.map(assignment => (
                    <AssignmentBlock
                      key={assignment._id}
                      assignment={assignment}
                      onClick={() => onAssignmentClick(assignment)}
                      onDelete={() => onDeleteAssignment(assignment._id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ currentDate, assignments, onCellDrop, onAssignmentClick, onDeleteAssignment }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 6);
  
  function getAssignmentsForHour(hour) {
    return assignments.filter(a => {
      const start = new Date(a.startDatetime);
      const end = new Date(a.endDatetime);
      const hourStart = new Date(currentDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(currentDate);
      hourEnd.setHours(hour + 1, 0, 0, 0);
      
      return start < hourEnd && end > hourStart;
    });
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden max-w-4xl mx-auto">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        {hours.map(hour => {
          const hourAssignments = getAssignmentsForHour(hour);
          return (
            <div key={hour} className="border-b last:border-b-0 min-h-[100px] flex">
              <div className="w-20 p-3 bg-gray-50 text-gray-600 font-medium border-r flex items-start">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div
                className="flex-1 p-2 relative hover:bg-blue-50 transition"
                onDragOver={e => e.preventDefault()}
                onDrop={e => onCellDrop(e, currentDate, hour)}
              >
                {hourAssignments.map(assignment => (
                  <AssignmentBlock
                    key={assignment._id}
                    assignment={assignment}
                    onClick={() => onAssignmentClick(assignment)}
                    onDelete={() => onDeleteAssignment(assignment._id)}
                    large
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Month View Component
function MonthView({ currentDate, assignments, onAssignmentClick }) {
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
    <div className="p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50 border-b">
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
              >
                {date && (
                  <>
                    <div className="text-sm font-semibold text-gray-700 mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayAssignments.slice(0, 3).map(assignment => (
                        <div
                          key={assignment._id}
                          onClick={() => onAssignmentClick(assignment)}
                          className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80"
                          style={{ backgroundColor: assignment.colorTag + '40', color: assignment.colorTag }}
                        >
                          {assignment.chantier?.name || 'Sans nom'}
                        </div>
                      ))}
                      {dayAssignments.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">+{dayAssignments.length - 3} plus</div>
                      )}
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

// Assignment Block Component
function AssignmentBlock({ assignment, onClick, onDelete, large = false }) {
  const chantierName = assignment.chantier?.name || assignment.chantier?.title || 'Sans nom';
  const startTime = new Date(assignment.startDatetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(assignment.endDatetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`${large ? 'p-3 mb-2' : 'p-2 mb-1'} rounded cursor-pointer shadow-sm hover:shadow-md transition group relative`}
      style={{ backgroundColor: assignment.colorTag + '20', borderLeft: `4px solid ${assignment.colorTag}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${large ? 'text-base' : 'text-xs'} text-gray-900 truncate`}>
            {chantierName}
          </div>
          <div className={`${large ? 'text-sm' : 'text-xs'} text-gray-600`}>
            {startTime} - {endTime}
          </div>
          {assignment.assignedContacts?.length > 0 && (
            <div className="mt-1">
              <AvatarGroup contacts={assignment.assignedContacts} max={large ? 5 : 3} size="sm" />
            </div>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition text-red-600"
          title="Supprimer"
        >
          🗑️
        </button>
      </div>
      {assignment.note && large && (
        <div className="mt-2 text-xs text-gray-600 italic">{assignment.note}</div>
      )}
    </div>
  );
}
