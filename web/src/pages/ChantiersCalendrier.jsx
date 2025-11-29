import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function ChantiersCalendrier(){
  const [chantiers, setChantiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState('all')
  const [selectedManager, setSelectedManager] = useState('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(()=>{ 
    (async()=>{ 
      try {
        const { data } = await api.get('/chantiers')
        setChantiers(data)
      } finally {
        setLoading(false)
      }
    })() 
  }, [])

  // Générer calendrier mois
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysCount = lastDay.getDate()
    
    const days = []
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Filtrer chantiers
  const filtered = chantiers.filter(c => {
    if (selectedClient !== 'all' && c.client?._id !== selectedClient) return false
    if (selectedManager !== 'all' && c.responsible !== selectedManager) return false
    return true
  })

  // Clients uniques
  const clients = [...new Set(chantiers.map(c => c.client).filter(Boolean))]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestion de chantiers</h1>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
        <select 
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
        >
          <option value="all">Tous les clients</option>
          {clients.map(c => c && (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        
        <select 
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedManager}
          onChange={e => setSelectedManager(e.target.value)}
        >
          <option value="all">Tous les gestionnaires</option>
        </select>

        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Filtrer
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">📋</button>
          <button className="p-2 hover:bg-gray-100 rounded">🗓️</button>
          <button className="p-2 hover:bg-gray-100 rounded">📊</button>
          <button className="p-2 hover:bg-gray-100 rounded">⚙️</button>
        </div>
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}

      {!loading && (
        <div className="grid md:grid-cols-[300px,1fr] gap-4">
          {/* Liste chantiers */}
          <div className="bg-white rounded-lg shadow p-4">
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filtered.map(c => (
                <div key={c._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded border text-sm">
                  <span className="text-lg">🏗️</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.title}</div>
                    <div className="text-xs text-gray-500 truncate">{c.client?.name}</div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded text-xs">📎</button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm">
                  Aucun chantier trouvé
                </div>
              )}
            </div>
          </div>

          {/* Calendrier */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">←</button>
              <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}

              {days.map(day => {
                // Trouver chantiers pour ce jour
                const chantiersDay = filtered.filter(c => {
                  if (!c.startDate) return false
                  const start = new Date(c.startDate)
                  return start.toDateString() === day.toDateString()
                })

                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div 
                    key={day.toISOString()} 
                    className={`border rounded p-2 min-h-[80px] ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                  >
                    <div className="text-xs font-medium mb-1">{day.getDate()}</div>
                    <div className="space-y-1">
                      {chantiersDay.map(c => (
                        <div 
                          key={c._id}
                          className="text-xs px-2 py-1 rounded truncate"
                          style={{
                            backgroundColor: c.status === 'en_cours' ? '#e0f2fe' : 
                                           c.status === 'termine' ? '#dcfce7' : '#f3f4f6',
                            color: c.status === 'en_cours' ? '#0369a1' : 
                                   c.status === 'termine' ? '#15803d' : '#374151'
                          }}
                          title={c.title}
                        >
                          {c.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
