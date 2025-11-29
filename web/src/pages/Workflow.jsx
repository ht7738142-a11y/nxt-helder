import React, { useState } from 'react'
import { api } from '../api'

export default function Workflow(){
  const [entityType, setEntityType] = useState('devis')
  const [entityId, setEntityId] = useState('')
  const [amount, setAmount] = useState('')
  const [wf, setWf] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createWf(e){
    e.preventDefault()
    try{
      setLoading(true); setError('')
      const { data } = await api.post('/workflow/create', { entityType, entityId, amount: Number(amount||0) })
      setWf(data)
    }catch(e){ setError(e?.response?.data?.error || e.message) }
    finally{ setLoading(false) }
  }

  async function act(action){
    if (!wf?._id) return
    try{
      setLoading(true); setError('')
      const url = action==='approve' ? `/workflow/${wf._id}/approve` : `/workflow/${wf._id}/reject`
      const { data } = await api.put(url, action==='approve'? { comment: 'OK' } : { reason: 'Refus UI' })
      setWf(data)
    }catch(e){ setError(e?.response?.data?.error || e.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Workflow d'approbation</h1>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Créer un workflow</h2>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={createWf} className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Type d'entité</label>
            <select className="w-full border rounded px-3 py-2" value={entityType} onChange={e=>setEntityType(e.target.value)}>
              <option value="devis">Devis</option>
              <option value="facture">Facture</option>
              <option value="depense">Dépense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">ID entité</label>
            <input className="w-full border rounded px-3 py-2" value={entityId} onChange={e=>setEntityId(e.target.value)} placeholder="ID MongoDB (24 chars)" />
          </div>
          <div>
            <label className="block text-sm mb-1">Montant (€)</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button disabled={loading} className="px-4 py-2 rounded bg-teal-600 text-white">{loading?'Création…':'Créer'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Statut</h2>
        {!wf && <div className="text-sm text-gray-500">Crée un workflow pour voir le statut.</div>}
        {wf && (
          <div className="space-y-3">
            <div className="text-sm">ID: <span className="font-mono">{wf._id}</span></div>
            <div className="text-sm">Statut: <span className="font-semibold">{wf.status}</span> · Niveau courant: {wf.currentLevel}</div>
            <div>
              <div className="font-medium">Approbateurs requis</div>
              <ul className="text-sm list-disc pl-5">
                {(wf.requiredApprovers||[]).map((a,i)=> (
                  <li key={i}>{a.role} (niveau {a.level}) — {a.status || 'pending'}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>act('approve')} className="px-3 py-2 rounded border">Approuver niveau</button>
              <button onClick={()=>act('reject')} className="px-3 py-2 rounded border">Rejeter</button>
            </div>
            <div>
              <div className="font-medium">Historique</div>
              <ul className="text-sm list-disc pl-5">
                {(wf.history||[]).map((h,i)=> (
                  <li key={i}>{h.action} par {h.user} {h.comment?`(${h.comment})`:''} — {h.createdAt ? new Date(h.createdAt).toLocaleString(): ''}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
