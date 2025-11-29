import React, { useEffect, useState, useMemo } from 'react'
import { api } from '../api'
import * as XLSX from 'xlsx'

const UNIT_OPTIONS = ["FF", "km", "m³", "heure", "m", "pièce", "unité", "m²"]

export default function Metres() {
  const [cctb, setCctb] = useState([])
  const [sheets, setSheets] = useState([])
  const [sheet, setSheet] = useState('')
  const [q, setQ] = useState('')
  const [lines, setLines] = useState([])
  const [catalogueCollapsed, setCatalogueCollapsed] = useState({})
  const [headerExpanded, setHeaderExpanded] = useState(false)
  const [targetProjectId, setTargetProjectId] = useState('')
  const [projects] = useState([{ id: '1', name: 'Projet Alpha' }])
  
  // En-têtes Excel
  const [xhProject, setXhProject] = useState('')
  const [xhLocation, setXhLocation] = useState('')
  const [xhOwner, setXhOwner] = useState('')
  const [xhDesigner, setXhDesigner] = useState('')
  const [xhCompany, setXhCompany] = useState('')
  const [xhLotNo, setXhLotNo] = useState('')
  const [xhLotLabel, setXhLotLabel] = useState('')
  const [xhAuthor, setXhAuthor] = useState('')

  const storageKey = 'helder.metres.lines'

  useEffect(() => {
    loadCctb('', '')
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setLines(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(lines))
    } catch {}
  }, [lines])

  async function loadCctb(searchQ, targetSheet) {
    try {
      let url = 'cctb'
      const params = []
      if (searchQ) params.push(`q=${encodeURIComponent(searchQ)}`)
      if (targetSheet) params.push(`sheet=${encodeURIComponent(targetSheet)}`)
      if (params.length) url += `?${params.join('&')}`
      const { data } = await api.get(url)
      setCctb(data.items || [])
      if (data.sheets) {
        setSheets(data.sheets)
        if (typeof targetSheet !== 'undefined') setSheet(targetSheet || '')
      }
    } catch (err) {
      console.error('Erreur CCTB:', err)
    }
  }

  // Recharger le CCTB quand la recherche ou la feuille change (avec debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      loadCctb(q, sheet)
    }, 300)
    return () => clearTimeout(t)
  }, [q, sheet])

  // Calcul des quantités avec formules dimensionnelles
  function computeSousTotal(line) {
    const L = Number(line.longueur) || 0
    const l = Number(line.largeur) || 0
    const h = Number(line.hauteur) || 0
    const q = Number(line.quantite) || 0
    
    // Formule selon l'unité
    if (!L && !l && !h) return q // Quantité simple
    if (L && !l && !h) return L * q // Longueur
    if (L && l && !h) return L * l * q // Surface
    if (L && l && h) return L * l * h * q // Volume
    return q
  }
  
  function computeTotalBloc(idx) {
    const line = displayLines[idx]
    if (!line.code) return null // Pas de total pour les lignes vides
    
    let total = computeSousTotal(line)
    // Ajouter les lignes vides qui suivent
    for (let i = idx + 1; i < displayLines.length && !displayLines[i].code; i++) {
      total += computeSousTotal(displayLines[i])
    }
    return total
  }

  const filtered = useMemo(() => {
    // Les résultats sont déjà filtrés côté serveur selon q et sheet
    return cctb
  }, [cctb])

  const grouped = useMemo(() => {
    if (filtered.length === 0) return []
    const map = new Map()
    for (const it of filtered) {
      const key = String(it.chapitre || 'Sans chapitre')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(it)
    }
    return Array.from(map.entries()).map(([chap, items]) => ({ chap, items }))
  }, [filtered])

  const displayLines = useMemo(() => {
    // Grouper par poste (code) + lignes vides qui suivent
    const groups = []
    const orphans = []
    let current = null
    
    for (const l of lines) {
      if (l.code) {
        if (current) groups.push(current)
        current = { lead: l, tails: [] }
      } else if (current) {
        current.tails.push(l)
      } else {
        orphans.push(l)
      }
    }
    if (current) groups.push(current)

    // Trier par code
    const collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' })
    groups.sort((a, b) => collator.compare(a.lead.code || '', b.lead.code || ''))

    // Aplatir
    const flat = []
    for (const g of groups) {
      flat.push(g.lead, ...g.tails)
    }
    flat.push(...orphans)
    return flat
  }, [lines])

  // Plus besoin de blockTotals séparé, on calcule à la volée

  function addFromCCTB(item) {
    const newLine = {
      id: `post-${Date.now()}`,
      code: item.code,
      libelle: item.libelle,
      unite: item.unite || '',
      quantite: 1,
      longueur: 0,
      largeur: 0,
      hauteur: 0
    }
    setLines(prev => [...prev, newLine])
  }

  function addBlankLine() {
    const blank = {
      id: `blank-${Date.now()}`,
      libelle: '',
      unite: '',
      quantite: 1,
      longueur: 0,
      largeur: 0,
      hauteur: 0
    }
    setLines(prev => [...prev, blank])
  }

  function deleteLine(id) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function updateLine(id, field, value) {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    ))
  }

  function clearAll() {
    if (!confirm('Vider toutes les lignes?')) return
    setLines([])
  }
  
  function deleteSelectedPosts() {
    if (!confirm('Supprimer les postes sélectionnés?')) return
    // À implémenter si besoin de sélection
    alert('Fonction à venir')
  }
  
  function sendToDecomptes() {
    if (!targetProjectId) {
      alert('Sélectionnez un projet cible')
      return
    }
    alert(`Envoi vers le projet: ${projects.find(p => p.id === targetProjectId)?.name}`)
  }

  async function exportXLSX() {
    const headers = [
      "N° article",
      "Désignation",
      "Longueur",
      "Largeur",
      "Hauteur",
      "Épaisseur",
      "Nombre",
      "Quantité",
      "Unité",
      "Sous total",
      "Total (unité)"
    ]

    const rows = displayLines.map((l, idx) => {
      const sousTotal = computeSousTotal(l)
      const isPost = !!l.code
      const totalBloc = isPost ? computeTotalBloc(idx) : null
      
      return [
        l.code || "",
        l.libelle || "",
        typeof l.longueur === 'number' ? l.longueur : null,
        typeof l.largeur === 'number' ? l.largeur : null,
        typeof l.hauteur === 'number' ? l.hauteur : null,
        typeof l.epaisseur === 'number' ? l.epaisseur : null,
        typeof l.nombre === 'number' ? l.nombre : null,
        Number(l.quantite) || 0,
        l.unite || "",
        sousTotal,
        totalBloc
      ]
    })

    const headerLines = [
      `PROJET : ${xhProject || ""}`,
      `LIEU : ${xhLocation || ""}`,
      `MAÎTRE D'OUVRAGE : ${xhOwner || ""}`,
      `MAÎTRE D'ŒUVRE : ${xhDesigner || ""}`,
      `ENTREPRISE : ${xhCompany || ""}`,
      `DOCUMENT : MÉTRÉ DÉTAILLÉ`,
      `LOT N° : ${xhLotNo || ""}${xhLotLabel ? " – " + xhLotLabel : ""}`,
      `DATE : ${new Date().toLocaleDateString("fr-FR")}`,
      `RÉDIGÉ PAR : ${xhAuthor || ""}`
    ]

    const aoa = []
    for (const line of headerLines) aoa.push([line])
    aoa.push([])
    aoa.push(headers)
    for (const r of rows) aoa.push(r)

    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Métré")
    
    const fileName = `Metre_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">📐 Métré</h1>

      {/* En-têtes export */}
      <details className="bg-white rounded-lg shadow" open={headerExpanded}>
        <summary className="px-4 py-3 cursor-pointer font-semibold hover:bg-gray-50" onClick={(e) => { e.preventDefault(); setHeaderExpanded(!headerExpanded) }}>
          ▸ Détails en-tête Excel
        </summary>
        <div className="p-4 border-t">
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <input className="border rounded px-3 py-2" placeholder="Projet" value={xhProject} onChange={e => setXhProject(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Lieu" value={xhLocation} onChange={e => setXhLocation(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Maître d'ouvrage" value={xhOwner} onChange={e => setXhOwner(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Maître d'œuvre" value={xhDesigner} onChange={e => setXhDesigner(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Entreprise" value={xhCompany} onChange={e => setXhCompany(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Lot N°" value={xhLotNo} onChange={e => setXhLotNo(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Libellé lot" value={xhLotLabel} onChange={e => setXhLotLabel(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Rédigé par" value={xhAuthor} onChange={e => setXhAuthor(e.target.value)} />
          </div>
        </div>
      </details>

      {/* Catalogue CCTB */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Rechercher dans le CCTB</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Code, libellé, chapitre</label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <div className="w-48">
              <label className="block text-xs text-gray-600 mb-1">Feuille</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={sheet}
                onChange={e => { const ns = e.target.value; setSheet(ns); loadCctb(q, ns) }}
              >
                <option value="">Toutes</option>
                {sheets.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            {filtered.length > 0 ? `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}` : q ? 'Aucun résultat' : ''}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">N° article</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                    {q ? 'Aucun résultat.' : ''}
                  </td>
                </tr>
              )}
              {filtered.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-sm">{item.code}</td>
                  <td className="px-3 py-2">{item.libelle}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => addFromCCTB(item)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      + Ajouter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lignes du métré */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Lignes du métré</h3>
          <div className="flex items-center gap-3 mb-3">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={targetProjectId}
              onChange={e => setTargetProjectId(e.target.value)}
            >
              <option value="">Projet cible (Décomptes)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={sendToDecomptes} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Envoyer vers Décomptes
            </button>
            <button onClick={clearAll} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              Tout effacer
            </button>
            <button onClick={deleteSelectedPosts} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
              Supprimer poste sélectionné
            </button>
            <button onClick={addBlankLine} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              Ajouter ligne vierge
            </button>
            <button onClick={exportXLSX} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              Exporter Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-2 text-left w-24">N° article</th>
                <th className="px-2 py-2 text-left">Désignation</th>
                <th className="px-2 py-2 text-center w-20">Longueur</th>
                <th className="px-2 py-2 text-center w-20">Largeur</th>
                <th className="px-2 py-2 text-center w-20">Hauteur</th>
                <th className="px-2 py-2 text-center w-20">Quantité</th>
                <th className="px-2 py-2 text-center w-24">Unité</th>
                <th className="px-2 py-2 text-right w-24">Sous total</th>
                <th className="px-2 py-2 text-right w-24">Total (unité)</th>
              </tr>
            </thead>
            <tbody>
              {displayLines.map((line, idx) => {
                const sousTotal = computeSousTotal(line)
                const isPost = !!line.code
                const totalBloc = isPost ? computeTotalBloc(idx) : null
                
                return (
                  <tr key={line.id} className={`border-b hover:bg-gray-50 ${isPost ? 'bg-blue-50' : ''}`}>
                    <td className="px-2 py-2 font-mono text-sm">{line.code || ''}</td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full bg-transparent focus:bg-white border-0 focus:border focus:border-blue-500 rounded px-1"
                        value={line.libelle || ''}
                        onChange={e => updateLine(line.id, 'libelle', e.target.value)}
                        placeholder="Désignation..."
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full text-center bg-transparent focus:bg-white border-0 focus:border focus:border-blue-500 rounded"
                        value={line.longueur || ''}
                        onChange={e => updateLine(line.id, 'longueur', e.target.value ? Number(e.target.value) : 0)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full text-center bg-transparent focus:bg-white border-0 focus:border focus:border-blue-500 rounded"
                        value={line.largeur || ''}
                        onChange={e => updateLine(line.id, 'largeur', e.target.value ? Number(e.target.value) : 0)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full text-center bg-transparent focus:bg-white border-0 focus:border focus:border-blue-500 rounded"
                        value={line.hauteur || ''}
                        onChange={e => updateLine(line.id, 'hauteur', e.target.value ? Number(e.target.value) : 0)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full text-center bg-transparent focus:bg-white border-0 focus:border focus:border-blue-500 rounded"
                        value={line.quantite || ''}
                        onChange={e => updateLine(line.id, 'quantite', Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full text-center bg-transparent text-xs"
                        value={line.unite || ''}
                        onChange={e => updateLine(line.id, 'unite', e.target.value)}
                      >
                        <option value="">-</option>
                        {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-sm">
                      {sousTotal.toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-blue-600">
                      {totalBloc !== null ? totalBloc.toFixed(2) : ''}
                    </td>
                  </tr>
                )
              })}
              {displayLines.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Aucune ligne. Recherchez un item et ajoutez-le.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
