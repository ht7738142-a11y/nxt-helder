import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded border">
      <h1 className="text-2xl font-semibold mb-4 text-teal-700">Bienvenue sur NXT Hélder</h1>
      <p className="text-gray-700 mb-4">Gérez vos clients et vos devis, exportez des PDF et envoyez des emails, avec conversion d’unités et statistiques.</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard" className="px-4 py-2 rounded bg-teal-600 text-white">Voir le Dashboard</Link>
        <Link to="/clients/new" className="px-4 py-2 rounded border">Créer un client</Link>
        <Link to="/devis/new" className="px-4 py-2 rounded border">Créer un devis</Link>
      </div>
    </div>
  )
}
