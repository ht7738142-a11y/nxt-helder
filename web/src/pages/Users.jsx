import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function Users(){
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ try{ const { data } = await api.get('/users'); setItems(normalizeListResponse(data)) } catch(e){ setError(e?.response?.data?.error || e.message) } finally{ setLoading(false) } })() }, [])
  const filtered = items.filter(u => (u.name||'').toLowerCase().includes(q.toLowerCase()) || (u.email||'').toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2 w-80" placeholder="Rechercher" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="overflow-auto bg-white border rounded">
        {loading && <div className="p-3 text-sm">Chargement…</div>}
        {error && <div className="p-3 text-sm text-red-600">{error}</div>}
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
              </tr>
            ))}
            {(!loading && !error && filtered.length===0) && (<tr><td className="p-3 text-gray-500" colSpan={3}>Aucun utilisateur</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
