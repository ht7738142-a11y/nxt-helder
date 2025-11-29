import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'

export default function Planning(){
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{ 
    (async()=>{ 
      try {
        setLoading(true)
        const start = new Date(); start.setDate(1)
        const end = new Date(); end.setMonth(end.getMonth()+1); end.setDate(0)
        const { data } = await api.get(`/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`)
        setEvents(Array.isArray(data)?data:(data?.events||[]))
      } catch(e){ setError(e.message) }
      finally { setLoading(false) }
    })() 
  }, [])

  const stats = useMemo(()=>({
    total: events.length,
    taches: events.filter(e=>e.source==='tache').length,
    chantiers: events.filter(e=>e.source==='chantier').length,
    conges: events.filter(e=>e.source==='conge').length,
  }), [events])

  if (loading) return <div className="p-4">Chargement du calendrier…</div>
  if (error) return <div className="p-4 text-red-600">Erreur: {error}</div>

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Événements du mois</h2>
        <ul className="divide-y">
          {events.map(ev=> (
            <li key={ev.id} className="py-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-gray-500">{new Date(ev.start).toLocaleString()} → {new Date(ev.end).toLocaleString()}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${ev.source==='conge'?'bg-amber-50':ev.source==='chantier'?'bg-indigo-50':'bg-green-50'}`}>{ev.source}</span>
              </div>
            </li>
          ))}
          {events.length===0 && <li className="py-4 text-gray-500 text-sm">Aucun événement sur la période</li>}
        </ul>
      </div>
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Résumé</h2>
        <ul className="text-sm list-disc pl-5">
          <li>Total événements: {stats.total}</li>
          <li>Tâches: {stats.taches}</li>
          <li>Chantiers: {stats.chantiers}</li>
          <li>Congés: {stats.conges}</li>
        </ul>
      </div>
    </div>
  )
}
