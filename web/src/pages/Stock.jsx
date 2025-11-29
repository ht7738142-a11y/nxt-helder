import React, { useEffect, useMemo, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function Stock(){
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ 
    try{ const { data } = await api.get('/materiels'); setItems(normalizeListResponse(data)) }
    catch(e){ setError(e?.response?.data?.error || e.message) }
    finally{ setLoading(false) }
  })() }, [])
  const filtered = useMemo(()=>{
    let arr = items.filter(m => (m.name||'').toLowerCase().includes(q.toLowerCase()) || (m.sku||'').toLowerCase().includes(q.toLowerCase()))
    if (onlyLow) arr = arr.filter(m => Number(m.quantity||0) <= Number(m.lowStockThreshold||0))
    return arr
  }, [items, q, onlyLow])
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2 w-80" placeholder="Rechercher" value={q} onChange={e=>setQ(e.target.value)} />
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={onlyLow} onChange={e=>setOnlyLow(e.target.checked)} />
          Rupture/seuil bas uniquement
        </label>
      </div>
      <div className="overflow-auto bg-white border rounded">
        {loading && <div className="p-3 text-sm">Chargement…</div>}
        {error && <div className="p-3 text-sm text-red-600">{error}</div>}
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Article</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Qté</th>
              <th className="p-2 text-left">Unité</th>
              <th className="p-2 text-left">PU</th>
              <th className="p-2 text-left">Seuil</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const low = Number(m.quantity||0) <= Number(m.lowStockThreshold||0)
              return (
              <tr key={m._id} className={`border-t ${low?'bg-red-50':''}`}>
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.sku}</td>
                <td className="p-2">{m.quantity}</td>
                <td className="p-2">{m.unit}</td>
                <td className="p-2">{m.unitPrice}</td>
                <td className="p-2">{m.lowStockThreshold}</td>
              </tr>
              )})}
            {(!loading && !error && filtered.length===0) && (
              <tr><td className="p-3 text-gray-500" colSpan={6}>Aucun article</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
