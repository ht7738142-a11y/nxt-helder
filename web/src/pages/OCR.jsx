import React, { useState } from 'react'
import { api } from '../api'

export default function OCR(){
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  async function upload(e){
    e.preventDefault()
    if(!file) return alert('Sélectionne un fichier')
    try{
      setLoading(true); setError(''); setResult(null)
      const form = new FormData(); form.append('file', file)
      // Endpoint mock - à adapter selon backend réel
      const {data} = await api.post('/ocr/extract', form, {headers:{'Content-Type':'multipart/form-data'}})
      setResult(data)
    }catch(e){ setError(e?.response?.data?.error || e.message) }
    finally{ setLoading(false) }
  }
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OCR Factures fournisseurs</h1>
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Upload & Extraction</h2>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <form onSubmit={upload} className="space-y-3">
          <input type="file" onChange={e=>setFile(e.target.files?.[0])} accept="image/*,application/pdf" className="border rounded px-3 py-2 w-full" />
          <button disabled={loading} className="px-4 py-2 rounded bg-teal-600 text-white">{loading?'Extraction…':'Extraire données'}</button>
        </form>
      </div>
      {result && (
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2">Données extraites</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded border">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
