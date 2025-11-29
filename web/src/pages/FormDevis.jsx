import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import VoiceInput from '../components/VoiceInput'
import { parseVoiceCommand } from '../services/speechHelper'

export default function FormDevis() {
  const [clients, setClients] = useState([])
  const [title, setTitle] = useState('Nouveau devis')
  const [client, setClient] = useState('')
  const [responsible, setResponsible] = useState('')
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0])
  const [quoteNumber, setQuoteNumber] = useState('')
  const [validityDays, setValidityDays] = useState(15)
  const [paymentTerms, setPaymentTerms] = useState('15 jours')
  const [currency, setCurrency] = useState('EUR')
  const [taxRate, setTaxRate] = useState(0.21)
  const [items, setItems] = useState([blankItem()])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/clients')
      setClients(data)
      if (data?.[0]?._id) setClient(data[0]._id)
    })()
  }, [])

  function blankItem(){ return { description: '', quantity: 0, unit: 'm', unitPrice: 0 } }

  function setItem(i, k, v){ setItems(prev => prev.map((it, idx) => idx===i ? { ...it, [k]: v } : it)) }
  function addItem(){ setItems(prev => [...prev, blankItem()]) }
  function removeItem(i){ setItems(prev => prev.filter((_, idx) => idx!==i)) }

  const totals = useMemo(() => {
    const withTotal = items.map(it => ({...it, total: (Number(it.quantity)||0)*(Number(it.unitPrice)||0)}))
    const subtotal = withTotal.reduce((a,b)=>a+(b.total||0),0)
    const tax = subtotal * Number(taxRate || 0)
    const grandTotal = subtotal + tax
    return { withTotal, subtotal, tax, grandTotal }
  }, [items, taxRate])

  // Voice input -> parse and autofill
  function onVoice(i, text){
    const parsed = parseVoiceCommand(text)
    if (parsed.description) setItem(i, 'description', (items[i].description ? items[i].description+' ' : '') + parsed.description)
    if (parsed.quantity != null) setItem(i, 'quantity', parsed.quantity)
    if (parsed.unit) setItem(i, 'unit', parsed.unit)
    if (parsed.unitPrice != null) setItem(i, 'unitPrice', parsed.unitPrice)
    if (parsed.client){
      const found = clients.find(c => (c.name||'').toLowerCase().includes(parsed.client.toLowerCase()))
      if (found?._id) setClient(found._id)
    }
  }

  // Conversion kg ↔ litres (densité par défaut 1)
  const [kg, setKg] = useState('')
  const [density, setDensity] = useState(1)
  const liters = useMemo(()=>{
    const n = Number(kg)||0
    const d = Number(density)||1
    return d ? (n/d).toFixed(3) : n.toFixed(3)
  }, [kg, density])

  async function submit(e){
    e.preventDefault(); setError(''); setOk('')
    try{
      const payload = { title, client, currency, items: totals.withTotal, totals: { taxRate } }
      const { data } = await api.post('/devis', payload)
      setOk('Devis créé')
      setTitle('Nouveau devis')
      setItems([blankItem()])
    }catch(e){ setError(e?.response?.data?.error || e.message) }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Création d'un nouveau devis</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}
      {ok && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{ok}</div>}

      <form onSubmit={submit} className="space-y-6">
        {/* Informations du devis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Informations du devis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable du devis *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={responsible} 
                onChange={e=>setResponsible(e.target.value)} 
                placeholder="Nom du responsable"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={client} 
                onChange={e=>setClient(e.target.value)}
                required
              >
                <option value="">Sélectionnez un client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du devis *</label>
              <input 
                type="date"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={quoteDate} 
                onChange={e=>setQuoteDate(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro du devis *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={quoteNumber} 
                onChange={e=>setQuoteNumber(e.target.value)} 
                placeholder="Ex: 82"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée de validité de l'offre</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  className="w-24 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={validityDays} 
                  onChange={e=>setValidityDays(e.target.value)} 
                />
                <span className="text-gray-600">Jours</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux TVA par défaut *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={taxRate * 100} 
                onChange={e=>setTaxRate(Number(e.target.value) / 100)} 
                placeholder="Ex: 5.5 % (TVA Française)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={paymentTerms} 
                onChange={e=>setPaymentTerms(e.target.value)} 
                placeholder="Ex: 15 jours Après date de facturation"
              />
            </div>
          </div>
        </div>

        {/* Encodage devis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Encodage devis</h2>
            <button 
              type="button" 
              onClick={addItem} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              + Ajouter une ligne
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Article</th>
                  <th className="text-left px-4 py-3">Catégorie</th>
                  <th className="text-left px-4 py-3">Description *</th>
                  <th className="text-left px-4 py-3">Qt *</th>
                  <th className="text-left px-4 py-3">Unité *</th>
                  <th className="text-left px-4 py-3">PU *</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">TVA</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((it, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <select className="w-24 border rounded px-2 py-1 text-xs">
                        <option>Article</option>
                        <option>Service</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-32 border rounded px-2 py-1 text-xs" placeholder="Article" />
                    </td>
                    <td className="px-4 py-3">
                      <select className="w-32 border rounded px-2 py-1 text-xs">
                        <option>Gros-oeuvre</option>
                        <option>Maçonnerie</option>
                        <option>Autre</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <input 
                          className="w-full border rounded px-2 py-1" 
                          value={it.description} 
                          onChange={e=>setItem(i,'description',e.target.value)} 
                          placeholder="Description" 
                          required
                        />
                        <VoiceInput onText={(txt)=>onVoice(i, txt)} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        step="0.001" 
                        className="w-20 border rounded px-2 py-1" 
                        value={it.quantity} 
                        onChange={e=>setItem(i,'quantity',e.target.value)} 
                        required
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        className="w-16 border rounded px-2 py-1" 
                        value={it.unit} 
                        onChange={e=>setItem(i,'unit',e.target.value)} 
                        required
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-24 border rounded px-2 py-1" 
                        value={it.unitPrice} 
                        onChange={e=>setItem(i,'unitPrice',e.target.value)} 
                        required
                      />
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {(Number(it.quantity||0)*Number(it.unitPrice||0)).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{(taxRate * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        type="button" 
                        className="p-2 hover:bg-red-50 rounded text-red-600" 
                        onClick={()=>removeItem(i)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Totaux */}
            <div className="bg-gray-900 text-white px-4 py-4 flex justify-end">
              <div className="space-y-2 text-right">
                <div className="text-lg">Total HT: <span className="font-bold">{totals.subtotal.toFixed(2)} {currency}</span></div>
                <div className="text-lg">TVA ({(taxRate * 100).toFixed(1)}%): <span className="font-bold">{totals.tax.toFixed(2)} {currency}</span></div>
                <div className="text-2xl">Total TTC: <span className="font-bold">{totals.grandTotal.toFixed(2)} {currency}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Enregistrer le devis
          </button>
        </div>
      </form>
    </div>
  )
}
