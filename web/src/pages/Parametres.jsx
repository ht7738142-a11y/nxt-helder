import React, { useState } from 'react'
import { api } from '../api'

export default function Parametres(){
  const [company, setCompany] = useState('NXT Hélder')
  const [vat, setVat] = useState('21')
  const [currency, setCurrency] = useState('EUR')
  const [qr, setQr] = useState('')
  const [otp, setOtp] = useState('')
  const [twoFAStatus, setTwoFAStatus] = useState('')

  function save(e){ e.preventDefault(); alert('Paramètres enregistrés (stockage local de démonstration).') }

  return (
    <div className="max-w-2xl bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Paramètres</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Entreprise</label>
          <input className="w-full border rounded px-3 py-2" value={company} onChange={e=>setCompany(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">TVA par défaut (%)</label>
            <input className="w-full border rounded px-3 py-2" value={vat} onChange={e=>setVat(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Devise</label>
            <select className="w-full border rounded px-3 py-2" value={currency} onChange={e=>setCurrency(e.target.value)}>
              <option>EUR</option>
              <option>CHF</option>
              <option>CAD</option>
            </select>
          </div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="border rounded" />
            <span>Activer le mode sombre automatiquement</span>
          </label>
        </div>
        <button className="bg-teal-600 text-white rounded px-4 py-2">Enregistrer</button>
      </form>
      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Sécurité: Authentification à deux facteurs (2FA)</h2>
        <div className="space-y-3">
          <button
            className="bg-indigo-600 text-white rounded px-4 py-2"
            onClick={async ()=>{
              try{
                setTwoFAStatus('')
                const { data } = await api.post('/auth/2fa/setup')
                setQr(data.qrDataUrl)
              }catch(e){ setTwoFAStatus(e?.response?.data?.error || 'Erreur setup 2FA') }
            }}>Générer QR</button>
          {qr && (
            <div>
              <img src={qr} alt="QR 2FA" className="w-44 h-44 border rounded" />
              <p className="text-xs text-gray-500 mt-1">Scannez avec Google Authenticator / Authy.</p>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Code OTP (6 chiffres)</label>
              <input inputMode="numeric" pattern="\\d{6}" maxLength={6} className="w-full border rounded px-3 py-2" value={otp} onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))} />
            </div>
            <button
              className="bg-emerald-600 text-white rounded px-4 py-2"
              onClick={async ()=>{
                try{
                  setTwoFAStatus('')
                  const { data } = await api.post('/auth/2fa/verify', { token: otp })
                  setTwoFAStatus(data.enabled ? '2FA activée' : 'Vérification échouée')
                }catch(e){ setTwoFAStatus(e?.response?.data?.error || 'Erreur vérification 2FA') }
              }}>Activer 2FA</button>
          </div>
          {twoFAStatus && <div className="text-sm text-gray-700">{twoFAStatus}</div>}
        </div>
      </div>
    </div>
  )
}
