import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function PlanningGantt(){
  const [chantiers, setChantiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(21)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Générer les jours de la semaine
  const getWeekDays = (weekNumber) => {
    const days = []
    const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const startDate = new Date(2025, 4, 19) // 19 Mai 2025 (Semaine 21)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + ((weekNumber - 21) * 7) + i)
      days.push({
        day: daysOfWeek[i],
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        fullDate: date
      })
    }
    return days
  }

  const weekDays = getWeekDays(currentWeek)

  // Filtrer chantiers
  const filtered = chantiers.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Avatars assignés (mock data)
  const getAssignees = (chantierId) => {
    const assignees = [
      { id: 1, name: 'Marie S', initials: 'MS', color: 'bg-blue-500' },
      { id: 2, name: 'Jean M', initials: 'JM', color: 'bg-green-500' },
      { id: 3, name: 'Nicolas D', initials: 'ND', color: 'bg-purple-500' }
    ]
    // Retourner 1-3 assignés aléatoirement
    const count = Math.floor(Math.random() * 3) + 1
    return assignees.slice(0, count)
  }

  // Vérifier si chantier actif ce jour
  const isActiveOnDay = (chantier, day) => {
    if (!chantier.startDate) return false
    const start = new Date(chantier.startDate)
    const end = chantier.endDate ? new Date(chantier.endDate) : new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000)
    return day.fullDate >= start && day.fullDate <= end
  }

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📅 Plannings
        </h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
            Filtres ▼
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
            Exporter ▼
          </button>
          <select 
            className="border rounded-lg px-4 py-2 text-sm font-medium"
            value={currentWeek}
            onChange={e => setCurrentWeek(Number(e.target.value))}
          >
            <option value={20}>Semaine 20</option>
            <option value={21}>Semaine 21</option>
            <option value={22}>Semaine 22</option>
            <option value={23}>Semaine 23</option>
            <option value={24}>Semaine 24</option>
          </select>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Rechercher un chantier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ◀
            </button>
            <span className="text-sm font-medium">
              Semaine {currentWeek} - {weekDays[0].date}
            </span>
            <button 
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="p-8 text-center">Chargement…</div>}

      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b-2">
              <tr>
                <th className="px-4 py-3 text-left w-80 bg-gray-50">
                  <div className="font-semibold text-gray-700">Aujourd'hui</div>
                </th>
                {weekDays.map((day, i) => (
                  <th key={i} className="px-4 py-3 text-center min-w-[140px] bg-gray-50">
                    <div className="text-xs text-gray-600">{day.day} {day.date}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {/* Icônes journée (mock) */}
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                        21
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                        22
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                        23
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const assignees = getAssignees(c._id)
                return (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">▶</button>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{c.title}</div>
                          <div className="text-xs text-gray-500">{c.client?.name || 'Client'}</div>
                        </div>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Options">
                          ⋮
                        </button>
                      </div>
                      {/* Assignés */}
                      <div className="flex items-center gap-1 mt-2">
                        {assignees.map(a => (
                          <div 
                            key={a.id}
                            className={`w-8 h-8 rounded-full ${a.color} text-white text-xs flex items-center justify-center font-medium`}
                            title={a.name}
                          >
                            {a.initials}
                          </div>
                        ))}
                        {assignees.length > 2 && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center font-medium">
                            +1
                          </div>
                        )}
                      </div>
                    </td>
                    {weekDays.map((day, i) => {
                      const isActive = isActiveOnDay(c, day)
                      return (
                        <td key={i} className="px-2 py-3 relative">
                          {isActive && (
                            <div className="relative">
                              {/* Barre de planning */}
                              {i === 0 && (
                                <div 
                                  className="absolute inset-y-2 bg-orange-300 rounded"
                                  style={{
                                    left: '0',
                                    right: '-100%',
                                    width: '300%'
                                  }}
                                >
                                  <div className="flex items-center h-full px-2">
                                    {assignees.map(a => (
                                      <div 
                                        key={a.id}
                                        className={`w-6 h-6 rounded-full ${a.color} text-white text-xs flex items-center justify-center font-medium mr-1`}
                                      >
                                        {a.initials}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Aucun chantier trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
