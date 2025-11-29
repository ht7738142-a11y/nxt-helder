import React, { useState } from 'react'
import { api } from '../api'

export default function Reporting(){
  const [type, setType] = useState('devis')
  const [loading, setLoading] = useState(false)
  async function exportReport(){
    try{ setLoading(true); const res = await api.get(`/reporting/export/${type}`, {responseType:'blob'}); const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href = url; a.download = `${type}_report.pdf`; a.click(); window.URL.revokeObjectURL(url) }
    catch(e){ alert(e?.response?.data?.error || e.message) } finally{ setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reporting</h1>
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Export rapport</h2>
        <div className="flex gap-3">
          <select className="border rounded px-3 py-2" value={type} onChange={e=>setType(e.target.value)}>
            <option value="devis">Devis</option>
            <option value="factures">Factures</option>
            <option value="chantiers">Chantiers</option>
          </select>
          <button disabled={loading} onClick={exportReport} className="px-4 py-2 rounded bg-teal-600 text-white">{loading?'Export…':'Exporter PDF'}</button>
        </div>
      </div>
    </div>
  )
}
