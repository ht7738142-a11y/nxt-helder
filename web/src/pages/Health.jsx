import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Health(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ (async()=>{ try{ const res = await api.get('/health'); setData(res.data) }catch(e){ setData({error: e.message}) } finally{ setLoading(false) } })() }, [])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Santé du système</h1>
      {loading && <div>Vérification…</div>}
      {data && (
        <div className="bg-white border rounded p-4">
          <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
