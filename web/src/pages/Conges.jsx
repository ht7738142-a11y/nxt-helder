import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'

export default function Conges(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ startDate: '', endDate: '', type: 'conge', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load(){
    try {
      setLoading(true)
      const { data } = await api.get('/conges')
      setItems(Array.isArray(data)?data:[])
    } catch(e){ setError(e.message) } finally { setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const stats = useMemo(()=>({
    total: items.length,
    pending: items.filter(i=>i.status==='pending').length,
    approved: items.filter(i=>i.status==='approved').length,
    rejected: items.filter(i=>i.status==='rejected').length,
  }), [items])

  async function createConge(e){
    e.preventDefault()
    try{
      setSubmitting(true)
      const payload = {
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || new Date(Date.now()+86400000).toISOString(),
        type: form.type || 'conge',
        reason: form.reason || ''
      }
      await api.post('/conges', payload)
      setForm({ startDate: '', endDate: '', type: 'conge', reason: '' })
      await load()
    } catch(e){ alert(e?.response?.data?.error || e.message) }
    finally{ setSubmitting(false) }
  }

  async function act(id, action){
    try{
      if(action==='approve') await api.put(`/conges/${id}/approve`)
      if(action==='reject') await api.put(`/conges/${id}/reject`)
      await load()
    } catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  if (loading) return <div className="p-4">Chargement des congés…</div>
  if (error) return <div className="p-4 text-red-600">Erreur: {error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Congés</h1>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Nouvelle demande</h2>
        <form onSubmit={createConge} className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Début</label>
            <input type="datetime-local" className="w-full border rounded px-3 py-2" value={form.startDate}
              onChange={e=>setForm({...form, startDate: e.target.value ? new Date(e.target.value).toISOString(): ''})} />
          </div>
          <div>
            <label className="block text-sm mb-1">Fin</label>
            <input type="datetime-local" className="w-full border rounded px-3 py-2" value={form.endDate}
              onChange={e=>setForm({...form, endDate: e.target.value ? new Date(e.target.value).toISOString(): ''})} />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select className="w-full border rounded px-3 py-2" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
              <option value="conge">Congé</option>
              <option value="maladie">Maladie</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Raison</label>
            <input className="w-full border rounded px-3 py-2" value={form.reason} onChange={e=>setForm({...form, reason: e.target.value})} />
          </div>
          <div className="md:col-span-4">
            <button disabled={submitting} className="px-4 py-2 rounded bg-teal-600 text-white">{submitting?'Envoi…':'Créer la demande'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Demandes</h2>
        <div className="text-sm text-gray-600 mb-3">Total: {stats.total} · En attente: {stats.pending} · Approuvées: {stats.approved} · Rejetées: {stats.rejected}</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Employé</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Période</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id} className="border-t">
                  <td className="p-2">{c.user?.name || '-'}</td>
                  <td className="p-2">{c.type}</td>
                  <td className="p-2">{new Date(c.startDate).toLocaleString()} → {new Date(c.endDate).toLocaleString()}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2 flex gap-2">
                    {c.status==='pending' && (
                      <>
                        <button className="px-3 py-1 rounded border" onClick={()=>act(c._id,'approve')}>Approuver</button>
                        <button className="px-3 py-1 rounded border" onClick={()=>act(c._id,'reject')}>Rejeter</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {items.length===0 && (
                <tr><td className="p-3 text-gray-500" colSpan={5}>Aucune demande</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
