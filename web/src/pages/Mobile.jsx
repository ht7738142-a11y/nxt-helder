import React from 'react'

export default function Mobile(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mobile / Offline</h1>
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Synchronisation</h2>
        <p className="text-sm text-gray-600 mb-3">Endpoints API disponibles:</p>
        <ul className="text-sm list-disc pl-5">
          <li>POST /api/mobile-advanced/sync/offline (sync data)</li>
          <li>POST /api/mobile-advanced/sync/resolve-conflict (résolution conflit)</li>
          <li>GET /api/mobile-advanced/sync/delta (delta sync)</li>
          <li>GET /api/mobile-advanced/offline/:type (données offline)</li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">UI mobile native en développement (React Native). API backend prête.</p>
      </div>
    </div>
  )
}
