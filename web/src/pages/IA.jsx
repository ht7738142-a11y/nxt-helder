import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'

export default function IA(){
  // Chat
  const [chatInput, setChatInput] = useState('Créer un devis pour client Dupont')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [chatError, setChatError] = useState('')

  // Sélecteurs
  const [chantiers, setChantiers] = useState([])
  const [devis, setDevis] = useState([])
  const [selectedChantier, setSelectedChantier] = useState('')
  const [selectedDevis, setSelectedDevis] = useState('')

  // Résultats ML
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError, setMlError] = useState('')
  const [mlResult, setMlResult] = useState(null)

  useEffect(()=>{
    (async()=>{
      try {
        const [{ data: d1 }, { data: d2 }] = await Promise.all([
          api.get('/chantiers'),
          api.get('/devis')
        ])
        setChantiers(normalizeListResponse(d1))
        setDevis(normalizeListResponse(d2))
      } catch(e){ /* silencieux */ }
    })()
  }, [])

  async function sendChat(e){
    e?.preventDefault?.()
    setChatError('')
    setChatLoading(true)
    try{
      const { data } = await api.post('/ai-advanced/chat', { message: chatInput })
      setChatHistory(h => [...h, { role: 'user', content: chatInput }, { role: 'ai', content: data?.reply || JSON.stringify(data) }])
      setChatInput('')
    } catch(e){ setChatError(e?.response?.data?.error || e.message) }
    finally{ setChatLoading(false) }
  }

  async function runML(action){
    if (!selectedChantier && (action==='anomalies' || action==='predict')){
      setMlError('Sélectionne un chantier'); return
    }
    if (!selectedDevis && action==='score'){
      setMlError('Sélectionne un devis'); return
    }
    setMlError(''); setMlLoading(true); setMlResult(null)
    try{
      let url = ''
      if (action==='anomalies') url = `/ai-advanced/ml/anomalies/${selectedChantier}`
      if (action==='predict') url = `/ai-advanced/ml/predict-costs/${selectedChantier}`
      if (action==='score') url = `/ai-advanced/ml/score-devis/${selectedDevis}`
      const { data } = await api.get(url)
      setMlResult(data)
    } catch(e){ setMlError(e?.response?.data?.error || e.message) }
    finally{ setMlLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">IA</h1>

      {/* Chat Assistant */}
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Assistant IA</h2>
        {chatError && <div className="mb-2 text-sm text-red-600">{chatError}</div>}
        <form onSubmit={sendChat} className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Pose une question (ex: Génère un devis...)" />
          <button disabled={chatLoading} className="px-4 py-2 rounded bg-teal-600 text-white">{chatLoading?'Envoi…':'Envoyer'}</button>
        </form>
        <div className="mt-3 space-y-2">
          {chatHistory.map((m, i)=> (
            <div key={i} className={`text-sm ${m.role==='ai'?'':'text-gray-700'}`}>
              <span className="font-medium mr-2">{m.role==='ai'?'Assistant':'Toi'}:</span>
              <span>{m.content}</span>
            </div>
          ))}
          {chatHistory.length===0 && <div className="text-sm text-gray-500">Aucun échange pour l’instant.</div>}
        </div>
      </div>

      {/* Anomalies / Prédictions / Score */}
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Analyses ML</h2>

        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm mb-1">Chantier</label>
            <select className="w-full border rounded px-3 py-2" value={selectedChantier} onChange={e=>setSelectedChantier(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {chantiers.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Devis</label>
            <select className="w-full border rounded px-3 py-2" value={selectedDevis} onChange={e=>setSelectedDevis(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {devis.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
            </select>
          </div>
        </div>

        {mlError && <div className="mb-2 text-sm text-red-600">{mlError}</div>}
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>runML('anomalies')} className="px-3 py-2 rounded border">Détecter anomalies (Chantier)</button>
          <button onClick={()=>runML('predict')} className="px-3 py-2 rounded border">Prédire coûts futurs (Chantier)</button>
          <button onClick={()=>runML('score')} className="px-3 py-2 rounded border">Score qualité devis</button>
        </div>

        {mlLoading && <div>Analyse en cours…</div>}
        {mlResult && (
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-80 border">{JSON.stringify(mlResult, null, 2)}</pre>
        )}
        {!mlLoading && !mlResult && <div className="text-sm text-gray-500">Aucun résultat pour le moment.</div>}
      </div>
    </div>
  )
}
