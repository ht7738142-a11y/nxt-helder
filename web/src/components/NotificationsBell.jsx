import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function NotificationsBell(){
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  async function load(){
    try{
      setLoading(true)
      const { data } = await api.get('/notifications')
      setItems(Array.isArray(data)?data:(data?.items||[]))
    } catch(e){ setError(e.message) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="relative px-2 py-1 rounded border hover:bg-gray-50" title="Notifications">
        🔔
        {items?.length>0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-auto bg-white border rounded shadow-lg z-20">
          <div className="p-2 border-b flex items-center justify-between">
            <div className="font-semibold">Notifications</div>
            <button onClick={load} className="text-xs px-2 py-1 rounded border">Rafraîchir</button>
          </div>
          {loading && <div className="p-3 text-sm">Chargement…</div>}
          {error && <div className="p-3 text-sm text-red-600">{error}</div>}
          {!loading && items.length===0 && <div className="p-3 text-sm text-gray-500">Aucune notification</div>}
          <ul className="divide-y">
            {items.map((n, i)=> (
              <li key={n._id || i} className="p-3">
                <div className="font-medium text-sm">{n.title || n.type}</div>
                <div className="text-xs text-gray-600">{n.message || ''}</div>
                {n.dueAt && <div className="text-[11px] text-gray-500 mt-1">Échéance: {new Date(n.dueAt).toLocaleString()}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
