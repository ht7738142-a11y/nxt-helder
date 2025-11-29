import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function BISegments(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ try{ const res = await api.get('/bi/segment/clients'); setData(res.data) }catch(e){ setError(e?.response?.data?.error || e.message) } finally{ setLoading(false) } })() }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Segmentation clients</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {data && (
        <div className="bg-white border rounded p-4">
          <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
