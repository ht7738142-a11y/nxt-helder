import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

export default function ChantierDetail(){
  const { id } = useParams()
  const [chantier, setChantier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('gestion-interne')
  const [expandedSections, setExpandedSections] = useState({
    infos: true,
    materiaux: false,
    soustraitants: false,
    avenants: false,
    facturation: false
  })

  useEffect(()=>{ 
    (async()=>{ 
      try {
        const { data } = await api.get(`/chantiers/${id}`)
        setChantier(data)
      } catch(err) {
        // Utiliser données mock si API échoue
        console.log('Utilisation données mock pour chantier:', id)
        setChantier({
          _id: id,
          title: 'Gros oeuvre Villa Dupont',
          address: 'rue des moines, 87, 93003 Paris France',
          client: { name: 'Dupuis SPRL', _id: '1' },
          status: 'en_cours',
          progress: 45,
          costEstimate: 15765.25,
          costActual: 7419.04
        })
      } finally {
        setLoading(false)
      }
    })() 
  }, [id])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}))
  }

  if (loading) return <div className="p-8 text-center">Chargement…</div>
  if (!chantier) return <div className="p-8 text-center text-red-600">Chantier non trouvé</div>

  // Calculs rentabilité
  const ventes = {
    devisBase: 15765.25,
    avenants: 0,
    totalVentes: 15765.25
  }
  const depenses = {
    coutMateriaux: 1131.25,
    coutSousTraitance: 6287.79,
    coutOeuvre: 0,
    avrifLaboChantier: 0,
    totalDepenses: 7419.04
  }
  const margeProvisoire = {
    totalDevis: 15765.25,
    totalDepenses: 7463.10,
    totalMargeProvisoire: 8298.23,
    totalMargeProvisionPourcent: 52.67
  }
  const totalFactures = {
    facturesPayeesTVAC: 4969.70,
    facturesImpayeesTVAC: 0,
    totalFacturesTVAC: 4969.70,
    resteFacturerHTVA: 11035.66
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded">←</button>
        <h1 className="text-2xl font-bold text-gray-800">Gestion de chantier - {chantier.title}</h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b">
        <button 
          onClick={() => setActiveTab('gestion-interne')}
          className={`px-4 py-2 font-medium ${activeTab === 'gestion-interne' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Gestion interne
        </button>
        <button 
          onClick={() => setActiveTab('gestion-soustraitant')}
          className={`px-4 py-2 font-medium ${activeTab === 'gestion-soustraitant' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Gestion sous-traitant
        </button>
        <button 
          onClick={() => setActiveTab('suivi-chantier')}
          className={`px-4 py-2 font-medium ${activeTab === 'suivi-chantier' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Suivi du chantier
        </button>
      </div>

      {activeTab === 'gestion-interne' && (
        <div className="space-y-4">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <button 
              onClick={() => toggleSection('infos')}
              className="w-full bg-blue-600 text-white px-6 py-3 text-left font-semibold flex items-center justify-between"
            >
              <span>Informations générales</span>
              <span>{expandedSections.infos ? '▼' : '▶'}</span>
            </button>
            {expandedSections.infos && (
              <div className="p-6 space-y-6">
                {/* Chantier */}
                <div>
                  <h3 className="font-semibold mb-3">Chantier</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Nom</th>
                        <th className="px-4 py-2 text-left">Chantier</th>
                        <th className="px-4 py-2 text-left">Adresse</th>
                        <th className="px-4 py-2 text-left">Client</th>
                        <th className="px-4 py-2 text-left">Gestionnaire</th>
                        <th className="px-4 py-2 text-left">Début prévu</th>
                        <th className="px-4 py-2 text-left">Fin de chantier prévue</th>
                        <th className="px-4 py-2 text-left">Fin estimée</th>
                        <th className="px-4 py-2 text-left">Identifiant comptable</th>
                        <th className="px-4 py-2 text-left">Com.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{chantier.title}</td>
                        <td className="px-4 py-3">Gros oeuvre Villa Dupont</td>
                        <td className="px-4 py-3">{chantier.address}</td>
                        <td className="px-4 py-3">{chantier.client?.name}</td>
                        <td className="px-4 py-3">Jean Michel</td>
                        <td className="px-4 py-3">03/06/2024</td>
                        <td className="px-4 py-3">01/07/2024</td>
                        <td className="px-4 py-3">09/07/2024</td>
                        <td className="px-4 py-3">47131</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">💬</button>
                            <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                            <button className="p-1 hover:bg-gray-100 rounded">📄</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Devis */}
                <div>
                  <h3 className="font-semibold mb-3">Devis</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Num.</th>
                        <th className="px-4 py-2 text-left">Référence</th>
                        <th className="px-4 py-2 text-left">Client</th>
                        <th className="px-4 py-2 text-left">Responsable</th>
                        <th className="px-4 py-2 text-left">Date d'acceptation</th>
                        <th className="px-4 py-2 text-left">Montant</th>
                        <th className="px-4 py-2 text-left">Com.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">21/05/2024</td>
                        <td className="px-4 py-3">83</td>
                        <td className="px-4 py-3">Gros oeuvre Villa Dupont</td>
                        <td className="px-4 py-3">Dupuis SPRL</td>
                        <td className="px-4 py-3">Marie Sprumont</td>
                        <td className="px-4 py-3">31/05/2024</td>
                        <td className="px-4 py-3 font-bold">15 765,25 €</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">💬</button>
                            <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                            <button className="p-1 hover:bg-gray-100 rounded">🔄</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Rentabilité */}
                <div>
                  <h3 className="font-semibold mb-3">Rentabilité</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {/* VENTES */}
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold mb-3">VENTES</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Devis de base</span>
                          <span>{ventes.devisBase.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avenants</span>
                          <span>{ventes.avenants.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total ventes</span>
                          <span>{ventes.totalVentes.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>

                    {/* DÉPENSES */}
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold mb-3">DÉPENSES</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Coût matériaux</span>
                          <span>{depenses.coutMateriaux.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût sous-traitance</span>
                          <span>{depenses.coutSousTraitance.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût d'oeuvre</span>
                          <span>{depenses.coutOeuvre.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avrif./labo/chantier</span>
                          <span>{depenses.avrifLaboChantier.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total DÉPENSES</span>
                          <span>{depenses.totalDepenses.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>

                    {/* MARGE PROVISOIRE */}
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold mb-3">MARGE PROVISOIRE</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total devis</span>
                          <span>{margeProvisoire.totalDevis.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total dépenses</span>
                          <span>{margeProvisoire.totalDepenses.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                          <span>Total MARGE PROVISOIRE</span>
                          <span>{margeProvisoire.totalMargeProvisoire.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-600">
                          <span>Total MARGE PROVISION %</span>
                          <span>{margeProvisoire.totalMargeProvisionPourcent.toFixed(2)} %</span>
                        </div>
                      </div>
                    </div>

                    {/* TOTAL FACTURES */}
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold mb-3">TOTAL FACTURES</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Factures payées TVAC</span>
                          <span>{totalFactures.facturesPayeesTVAC.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Factures impayées TVAC</span>
                          <span>{totalFactures.facturesImpayeesTVAC.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total FACTURES TVAC</span>
                          <span>{totalFactures.totalFacturesTVAC.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Reste à facturer HTVA</span>
                          <span>{totalFactures.resteFacturerHTVA.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fiches techniques */}
                <div>
                  <h3 className="font-semibold mb-3">Fiches techniques</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Nombre de fiches techniques</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Aucune donnée disponible dans le tableau
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Commandes matériaux */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <button 
              onClick={() => toggleSection('materiaux')}
              className="w-full bg-blue-600 text-white px-6 py-3 text-left font-semibold flex items-center justify-between"
            >
              <span>Commandes matériaux</span>
              <span>{expandedSections.materiaux ? '▼' : '▶'}</span>
            </button>
            {expandedSections.materiaux && (
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold mb-3">Demandes/propositions de prix</h4>
                  <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="Rechercher..." className="flex-1 border rounded px-3 py-2 text-sm" />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">Nouveau</button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Num.</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Fournisseur</th>
                        <th className="px-4 py-2 text-left">Référence</th>
                        <th className="px-4 py-2 text-left">Type de commande</th>
                        <th className="px-4 py-2 text-left">Date de livraison</th>
                        <th className="px-4 py-2 text-left">Montant</th>
                        <th className="px-4 py-2 text-left">Remarque interne</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                          Aucune donnée disponible
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Commandes sous-traitants */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <button 
              onClick={() => toggleSection('soustraitants')}
              className="w-full bg-blue-600 text-white px-6 py-3 text-left font-semibold flex items-center justify-between"
            >
              <span>Commandes sous-traitants</span>
              <span>{expandedSections.soustraitants ? '▼' : '▶'}</span>
            </button>
            {expandedSections.soustraitants && (
              <div className="p-6">
                <p className="text-sm text-gray-600">Contenu commandes sous-traitants...</p>
              </div>
            )}
          </div>

          {/* Avenants */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <button 
              onClick={() => toggleSection('avenants')}
              className="w-full bg-blue-600 text-white px-6 py-3 text-left font-semibold flex items-center justify-between"
            >
              <span>Avenants</span>
              <span>{expandedSections.avenants ? '▼' : '▶'}</span>
            </button>
            {expandedSections.avenants && (
              <div className="p-6">
                <p className="text-sm text-gray-600">Contenu avenants...</p>
              </div>
            )}
          </div>

          {/* Facturation */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <button 
              onClick={() => toggleSection('facturation')}
              className="w-full bg-blue-600 text-white px-6 py-3 text-left font-semibold flex items-center justify-between"
            >
              <span>Facturation</span>
              <span>{expandedSections.facturation ? '▼' : '▶'}</span>
            </button>
            {expandedSections.facturation && (
              <div className="p-6 space-y-6">
                {/* Avancements */}
                <div>
                  <h4 className="font-semibold mb-3">Avancements</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Num.</th>
                        <th className="px-4 py-2 text-left">Référence</th>
                        <th className="px-4 py-2 text-left">Montant HT</th>
                        <th className="px-4 py-2 text-left">Montant HT révisé</th>
                        <th className="px-4 py-2 text-left">% global avancé</th>
                        <th className="px-4 py-2 text-left">Reste à facturer HT</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          Aucune donnée disponible
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Factures clients */}
                <div>
                  <h4 className="font-semibold mb-3">Factures clients</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Num.</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Référence</th>
                        <th className="px-4 py-2 text-left">Montant HT</th>
                        <th className="px-4 py-2 text-left">TVAC</th>
                        <th className="px-4 py-2 text-left">Échéance</th>
                        <th className="px-4 py-2 text-left">Paiement</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">21/05/2024</td>
                        <td className="px-4 py-3">31</td>
                        <td className="px-4 py-3">Acompte</td>
                        <td className="px-4 py-3">Facture d'acompte #1</td>
                        <td className="px-4 py-3">4 728,58 €</td>
                        <td className="px-4 py-3">4 969,70 €</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">Payé</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium">Payé</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gestion-soustraitant' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Contenu Gestion sous-traitant...</p>
        </div>
      )}

      {activeTab === 'suivi-chantier' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Contenu Suivi du chantier...</p>
        </div>
      )}
    </div>
  )
}
