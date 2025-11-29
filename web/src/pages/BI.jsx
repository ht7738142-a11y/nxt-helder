import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function BI(){
  const [start, setStart] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10))
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forecast, setForecast] = useState(null)
  const [cube, setCube] = useState(null)

  async function load(){
    setError(''); setLoading(true)
    try{
      const [f, c] = await Promise.all([
        api.get(`/bi/forecast/growth?start=${start}&end=${end}`),
        api.get(`/bi/olap/cube?start=${start}&end=${end}`),
      ])
      setForecast(f.data)
      setCube(c.data)
    } catch(e){ setError(e?.response?.data?.error || e.message) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const chartData = useMemo(()=>{
    const points = Array.isArray(forecast?.points) ? forecast.points : []
    const labels = points.map(p=>p.period)
    const values = points.map(p=>Number(p.value||0))
    return {
      labels,
      datasets: [{ label: 'Prévision CA', data: values, borderColor: '#0f766e', backgroundColor: 'rgba(15,118,110,.2)' }]
    }
  }, [forecast])

  async function exportExcel(){
    try{
      const res = await api.post('/bi/export/excel/factures', { start, end }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = `factures_${start}_${end}.xlsx`; a.click(); window.URL.revokeObjectURL(url)
    } catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  async function exportPDF(){
    try{
      const res = await api.post('/bi/export/pdf/custom', { start, end, title: 'Rapport BI' }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = `rapport_bi_${start}_${end}.pdf`; a.click(); window.URL.revokeObjectURL(url)
    } catch(e){ alert(e?.response?.data?.error || e.message) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reporting & BI</h1>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Filtres</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Début</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={start} onChange={e=>setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Fin</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={end} onChange={e=>setEnd(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={load} className="px-4 py-2 rounded border">Actualiser</button>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={exportExcel} className="px-3 py-2 rounded border">Export Excel factures</button>
            <button onClick={exportPDF} className="px-3 py-2 rounded border">Export PDF</button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Prévision de croissance</h2>
        {loading && <div>Chargement…</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !error && <Line data={chartData} />}
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Cube OLAP (extrait)</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Dimension</th>
                <th className="p-2 text-left">Valeur</th>
                <th className="p-2 text-left">Mesure</th>
              </tr>
            </thead>
            <tbody>
              {(cube?.rows||[]).map((r, i)=> (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.dim || '-'}</td>
                  <td className="p-2">{r.key || '-'}</td>
                  <td className="p-2">{Number(r.value||0).toFixed(2)}</td>
                </tr>
              ))}
              {(!cube?.rows || cube.rows.length===0) && <tr><td className="p-3 text-gray-500" colSpan={3}>Aucune donnée</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
