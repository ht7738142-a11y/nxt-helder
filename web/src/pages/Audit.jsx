import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Audit(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ try{ const { data } = await api.get('/audit?limit=100'); setItems(Array.isArray(data)?data:(data?.items||[])) } catch(e){ setError(e?.response?.data?.error || e.message) } finally{ setLoading(false) } })() }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="overflow-auto bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Utilisateur</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Collection</th>
              <th className="p-2 text-left">DocID</th>
            </tr>
          </thead>
          <tbody>
            {(items||[]).map((a,i)=> (
              <tr key={a._id || i} className="border-t">
                <td className="p-2">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
                <td className="p-2">{a.user?.name || a.userId || '-'}</td>
                <td className="p-2">{a.action}</td>
                <td className="p-2">{a.collection}</td>
                <td className="p-2 font-mono text-xs">{a.documentId}</td>
              </tr>
            ))}
            {(!loading && !error && (!items || items.length===0)) && (
              <tr><td className="p-3 text-gray-500" colSpan={5}>Aucune entrée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
