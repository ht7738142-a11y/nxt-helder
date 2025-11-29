import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function Depenses(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ try{ const { data } = await api.get('/depenses'); setItems(normalizeListResponse(data)) } catch(e){ setError(e?.response?.data?.error || e.message) } finally{ setLoading(false) } })() }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dépenses</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="overflow-auto bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Catégorie</th>
              <th className="p-2 text-left">Montant</th>
              <th className="p-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d,i)=> (
              <tr key={d._id || i} className="border-t">
                <td className="p-2">{d.date ? new Date(d.date).toLocaleDateString() : ''}</td>
                <td className="p-2">{d.category || '-'}</td>
                <td className="p-2">{d.amount} {d.currency || 'EUR'}</td>
                <td className="p-2">{d.note||''}</td>
              </tr>
            ))}
            {(!loading && !error && items.length===0) && (<tr><td className="p-3 text-gray-500" colSpan={4}>Aucune dépense</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
