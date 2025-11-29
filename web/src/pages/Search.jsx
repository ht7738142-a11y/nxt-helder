import React, { useState } from 'react'
import { api } from '../api'

export default function Search(){
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  async function search(e){
    e?.preventDefault?.()
    if(!q.trim()) return
    try{ setLoading(true); const {data} = await api.get(`/search?q=${encodeURIComponent(q)}`); setResults(data) }
    catch(e){ alert(e?.response?.data?.error || e.message) } finally{ setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Recherche globale</h1>
      <form onSubmit={search} className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" placeholder="Rechercher clients, devis, chantiers…" value={q} onChange={e=>setQ(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 rounded bg-teal-600 text-white">{loading?'Recherche…':'Rechercher'}</button>
      </form>
      {results && (
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2">Résultats ({results.total || 0})</h2>
          {(results.clients?.length||0)>0 && <div><div className="font-medium">Clients</div><ul className="list-disc pl-5 text-sm">{results.clients.map(c=><li key={c._id}>{c.name}</li>)}</ul></div>}
          {(results.devis?.length||0)>0 && <div><div className="font-medium">Devis</div><ul className="list-disc pl-5 text-sm">{results.devis.map(d=><li key={d._id}>{d.title}</li>)}</ul></div>}
          {(results.chantiers?.length||0)>0 && <div><div className="font-medium">Chantiers</div><ul className="list-disc pl-5 text-sm">{results.chantiers.map(ch=><li key={ch._id}>{ch.title}</li>)}</ul></div>}
          {!results.clients?.length && !results.devis?.length && !results.chantiers?.length && <div className="text-sm text-gray-500">Aucun résultat</div>}
        </div>
      )}
    </div>
  )
}
