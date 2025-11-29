import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Portal(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ (async()=>{ try{ const res = await api.get('/portal'); setData(res.data) }catch(e){ setData({error: e?.response?.data?.error || e.message}) } finally{ setLoading(false) } })() }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Portail client</h1>
      {loading && <div>Chargement…</div>}
      {data && (
        <div className="bg-white border rounded p-4">
          <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
