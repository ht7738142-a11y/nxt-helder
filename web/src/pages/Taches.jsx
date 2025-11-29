import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function Taches(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ try{ const { data } = await api.get('/taches'); setItems(normalizeListResponse(data)) }catch(e){ setError(e?.response?.data?.error || e.message) } finally{ setLoading(false) } })() }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tâches</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="overflow-auto bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="p-2 text-left">Titre</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Statut</th><th className="p-2 text-left">Début</th><th className="p-2 text-left">Fin</th></tr></thead>
          <tbody>
            {items.map(t=> (
              <tr key={t._id} className="border-t"><td className="p-2">{t.title}</td><td className="p-2">{t.type}</td><td className="p-2">{t.status}</td><td className="p-2">{t.start?new Date(t.start).toLocaleString():''}</td><td className="p-2">{t.end?new Date(t.end).toLocaleString():''}</td></tr>
            ))}
            {(!loading && !error && items.length===0) && (<tr><td className="p-3 text-gray-500" colSpan={5}>Aucune tâche</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
