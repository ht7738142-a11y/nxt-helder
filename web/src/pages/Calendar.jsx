import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../api';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    color: '#3B82F6'
  });

  const colors = [
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Vert', value: '#10B981' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Rose', value: '#EC4899' }
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const { data } = await api.get('/calendar/events');
      setEvents(data || []);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      setEvents([]);
    }
  };

  // Navigation
  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get week days starting from Monday
  const getWeekDays = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      days.push(day);
    }
    
    return days;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  const getEventsForTimeSlot = (date, hour) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => {
      if (e.date !== dateString) return false;
      const eventHour = parseInt(e.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedEvent) {
        const { data } = await api.put(`/calendar/events/${selectedEvent._id}`, newEvent);
        setEvents(events.map(ev => ev._id === selectedEvent._id ? data : ev));
      } else {
        const { data } = await api.post('/calendar/events', newEvent);
        setEvents([...events, data]);
      }
      setShowAddModal(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      resetNewEvent();
    } catch (error) {
      console.error('Erreur événement:', error);
      const localEvent = { _id: Date.now().toString(), ...newEvent };
      if (isEditMode && selectedEvent) {
        setEvents(events.map(ev => ev._id === selectedEvent._id ? localEvent : ev));
      } else {
        setEvents([...events, localEvent]);
      }
      setShowAddModal(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      resetNewEvent();
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/calendar/events/${eventId}`);
      setEvents(events.filter(e => e._id !== eventId));
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      setEvents(events.filter(e => e._id !== eventId));
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      color: '#3B82F6'
    });
  };

  const openAddModal = (date, hour = null) => {
    setSelectedDate(date);
    setIsEditMode(false);
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      date: date.toISOString().split('T')[0],
      startTime: hour !== null ? `${hour.toString().padStart(2, '0')}:00` : '',
      endTime: hour !== null ? `${(hour + 1).toString().padStart(2, '0')}:00` : '',
      location: '',
      description: '',
      color: '#3B82F6'
    });
    setShowAddModal(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setNewEvent({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      description: event.description || '',
      color: event.color || '#3B82F6'
    });
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  const openDetailModal = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const dayNamesFull = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getViewTitle = () => {
    if (view === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const weekDays = getWeekDays(currentDate);
      const firstDay = weekDays[0];
      const lastDay = weekDays[6];
      if (firstDay.getMonth() === lastDay.getMonth()) {
        return `${monthNames[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
      } else {
        return `${monthNames[firstDay.getMonth()]} - ${monthNames[lastDay.getMonth()]} ${firstDay.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {getViewTitle()}
            </h1>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => openAddModal(new Date())}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel événement
            </button>
          </div>
        </div>

        {/* Vue sélecteur */}
        <div className="flex gap-2">
          {['month', 'week', 'day'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === v
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 p-6 overflow-auto">
        {view === 'month' && <MonthView 
          currentDate={currentDate}
          events={events}
          getDaysInMonth={getDaysInMonth}
          getEventsForDate={getEventsForDate}
          openAddModal={openAddModal}
          openDetailModal={openDetailModal}
          isToday={isToday}
          dayNames={dayNames}
        />}

        {view === 'week' && <WeekView 
          currentDate={currentDate}
          events={events}
          getWeekDays={getWeekDays}
          getEventsForTimeSlot={getEventsForTimeSlot}
          openAddModal={openAddModal}
          openDetailModal={openDetailModal}
          isToday={isToday}
          hours={hours}
          dayNamesFull={dayNamesFull}
        />}

        {view === 'day' && <DayView 
          currentDate={currentDate}
          events={events}
          getEventsForTimeSlot={getEventsForTimeSlot}
          openAddModal={openAddModal}
          openDetailModal={openDetailModal}
          hours={hours}
        />}
      </div>

      {/* Modal Détails événement */}
      {showDetailModal && selectedEvent && (
        <EventDetailModal 
          event={selectedEvent}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => openEditModal(selectedEvent)}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Modal Ajouter/Modifier événement */}
      {showAddModal && (
        <EventFormModal 
          isEditMode={isEditMode}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onSubmit={handleAddEvent}
          onClose={() => {
            setShowAddModal(false);
            setIsEditMode(false);
            setSelectedEvent(null);
            resetNewEvent();
          }}
          colors={colors}
        />
      )}
    </div>
  );
}

// Month View Component
function MonthView({ currentDate, events, getDaysInMonth, getEventsForDate, openAddModal, openDetailModal, isToday, dayNames }) {
  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Days header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-semibold text-gray-600 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const today = isToday(dayInfo.date);

          return (
            <div
              key={index}
              className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                !dayInfo.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              } hover:bg-gray-50 transition-colors cursor-pointer`}
              onClick={() => openAddModal(dayInfo.date)}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  today
                    ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                    : dayInfo.isCurrentMonth
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {dayInfo.day}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="text-xs px-2 py-1 rounded truncate text-white font-medium cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(event);
                    }}
                  >
                    {event.startTime} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({ currentDate, events, getWeekDays, getEventsForTimeSlot, openAddModal, openDetailModal, isToday, hours, dayNamesFull }) {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Days header */}
      <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="px-2 py-3 text-center text-xs font-semibold text-gray-600 bg-gray-50"></div>
        {weekDays.map((day, idx) => {
          const today = isToday(day);
          return (
            <div
              key={idx}
              className="px-2 py-3 text-center bg-gray-50"
            >
              <div className="text-xs font-semibold text-gray-600">
                {dayNamesFull[day.getDay()]}
              </div>
              <div className={`text-lg font-bold ${today ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      <div className="overflow-auto max-h-[600px]">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-200">
            <div className="px-2 py-2 text-xs text-gray-500 bg-gray-50 text-right">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day, idx) => {
              const eventsForSlot = getEventsForTimeSlot(day, hour);
              return (
                <div
                  key={idx}
                  className="border-l border-gray-200 p-1 min-h-[60px] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openAddModal(day, hour)}
                >
                  {eventsForSlot.map((event) => (
                    <div
                      key={event._id}
                      className="text-xs px-2 py-1 rounded mb-1 text-white font-medium cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(event);
                      }}
                    >
                      {event.startTime} {event.title}
                    </div>
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
function DayView({ currentDate, events, getEventsForTimeSlot, openAddModal, openDetailModal, hours }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      {/* Day header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {currentDate.getDate()}
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="overflow-auto max-h-[600px]">
        {hours.map((hour) => {
          const eventsForSlot = getEventsForTimeSlot(currentDate, hour);
          return (
            <div key={hour} className="flex border-b border-gray-200">
              <div className="w-20 px-2 py-2 text-xs text-gray-500 bg-gray-50 text-right flex-shrink-0">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div
                className="flex-1 p-2 min-h-[60px] hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => openAddModal(currentDate, hour)}
              >
                {eventsForSlot.map((event) => (
                  <div
                    key={event._id}
                    className="text-sm px-3 py-2 rounded mb-1 text-white font-medium cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(event);
                    }}
                  >
                    <div className="font-bold">{event.title}</div>
                    <div className="text-xs opacity-90">
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Event Detail Modal
function EventDetailModal({ event, onClose, onEdit, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }} />
                <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div className="font-medium">
              {new Date(event.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="font-medium">
              {event.startTime} - {event.endTime}
            </span>
          </div>

          {event.location && (
            <div className="flex items-start gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>{event.location}</div>
            </div>
          )}

          {event.description && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment supprimer cet événement ?')) {
                onDelete(event._id);
                onClose();
              }
            }}
            className="flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
          >
            Supprimer
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

// Event Form Modal
function EventFormModal({ isEditMode, newEvent, setNewEvent, onSubmit, onClose, colors }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Modifier l'événement" : 'Nouvel événement'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Titre de l'événement"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className="w-full px-4 py-3 text-lg border-0 border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 outline-none"
            required
          />

          <div className="flex items-center gap-2 text-gray-600">
            <CalendarIcon className="w-5 h-5" />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <input
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <input
              type="text"
              placeholder="Lieu"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    newEvent.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              {isEditMode ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
