import React, { useEffect, useState } from 'react'
import { api, normalizeListResponse } from '../api'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const [devis, setDevis] = useState([])
  const [factures, setFactures] = useState([])
  const [chantiers, setChantiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        console.log('Dashboard: fetching data...')
        const [d, f, c] = await Promise.all([
          api.get('/devis'),
          api.get('/factures'),
          api.get('/chantiers')
        ])
        setDevis(normalizeListResponse(d.data))
        setFactures(normalizeListResponse(f.data))
        setChantiers(normalizeListResponse(c.data))
      } catch (err) {
        console.error('Dashboard: error loading:', err)
        setError(err.message)
      } finally { 
        setLoading(false)
      }
    })()
  }, [])

  const stats = {
    devisEnAttente: devis.filter(d => d.status === 'draft' || d.status === 'sent').length,
    facturesEnRetard: factures.filter(f => f.status === 'unpaid' && new Date(f.dueDate) < new Date()).length,
    chantiersActifs: chantiers.filter(c => c.status === 'en_cours').length,
    totalFacturable: devis.reduce((sum, d) => sum + (d.totals?.grandTotal || 0), 0)
  }

  const devisEnAttente = devis.filter(d => d.status === 'draft' || d.status === 'sent').slice(0, 5)
  const facturesRetard = factures.filter(f => f.status === 'unpaid').slice(0, 5)

  const labels = (devis || []).slice(0, 10).map(d => d?.title || 'Sans titre')
  const totals = (devis || []).slice(0, 10).map(d => d?.totals?.grandTotal || 0)

  const chartData = {
    labels: labels.length > 0 ? labels : ['Aucun devis'],
    datasets: [
      {
        label: 'Total devis (EUR)',
        data: totals.length > 0 ? totals : [0],
        backgroundColor: '#5C9D9D'
      }
    ]
  }

  const StatusBadge = ({ status }) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      unpaid: 'bg-red-500 text-white',
      paid: 'bg-green-500 text-white'
    }
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{status}</span>
  }

  if (loading) return <div className="p-8">Chargement du tableau de bord…</div>
  if (error) return <div className="p-8 text-red-600">Erreur: {error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Devis en attente</div>
          <div className="text-3xl font-bold text-blue-600">{stats.devisEnAttente}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Factures en retard</div>
          <div className="text-3xl font-bold text-red-600">{stats.facturesEnRetard}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Chantiers actifs</div>
          <div className="text-3xl font-bold text-green-600">{stats.chantiersActifs}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-1">Total facturable</div>
          <div className="text-3xl font-bold text-teal-600">{stats.totalFacturable.toFixed(2)} €</div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Devis en attente */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="font-semibold">Devis en attente</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-gray-600">
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Montant</th>
                  <th className="pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {devisEnAttente.map(d => (
                  <tr key={d._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{d.client?.name || '-'}</td>
                    <td className="py-3 font-medium">{(d.totals?.grandTotal || 0).toFixed(2)} €</td>
                    <td className="py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
                {devisEnAttente.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-gray-500 text-center">Aucun devis en attente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Factures en retard */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="font-semibold">Factures en retard</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-gray-600">
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Montant</th>
                  <th className="pb-2">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {facturesRetard.map(f => (
                  <tr key={f._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{f.client?.name || '-'}</td>
                    <td className="py-3 font-medium">{(f.totals?.grandTotal || 0).toFixed(2)} €</td>
                    <td className="py-3"><span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">À payer</span></td>
                  </tr>
                ))}
                {facturesRetard.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-gray-500 text-center">Aucune facture en retard</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">Totaux des 10 derniers devis</h2>
        {devis.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">Aucun devis trouvé</div>
        ) : (
          <Bar data={chartData} />
        )}
      </div>
    </div>
  )
}
