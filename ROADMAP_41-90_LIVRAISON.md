# NXT Hélder Pro — Livraison Points 41-90 (50 points)

## ✅ Points 41-60 — CLIENTS AVANCÉS

### Modèle Client étendu
- **41. Multi-contacts**: `contacts[]` avec name/email/phone/role
- **42. Multi-adresses**: `addresses[]` avec label/street/city/zip/country
- **43. Vérif TVA intracom**: champ `vat` existant (validation manuelle ou API externe à intégrer)
- **44. Conditions paiement**: `paymentTerms` (Net 30, Net 60, etc.)
- **45. Documents légaux**: `documents[]` avec name/path/type/size
- **46. Historique interactions**: `history.interactions[]` avec date/type/note/user
- **47. Segments**: `segment` enum (pro, pme, artisan, particulier)
- **48. Notes internes**: champ `notes`
- **49. Archivage**: champ `archived` boolean
- **50. Crédit limit**: champ `creditLimit`

### Endpoints à implémenter (services/controllers)
- `POST /api/clients/:id/contacts` - Ajouter un contact
- `POST /api/clients/:id/addresses` - Ajouter une adresse
- `POST /api/clients/:id/documents` - Upload document (multer)
- `POST /api/clients/:id/interactions` - Ajouter interaction
- `PUT /api/clients/:id/archive` - Archiver client
- `GET /api/clients/import-csv` - Template CSV
- `POST /api/clients/import-csv` - Import bulk (util csv.js créé)
- `GET /api/clients/export` - Export CSV tous clients
- `GET /api/clients/stats` - Stats: CA par client, segments, top clients
- `GET /api/clients/:id/ca` - Chiffre d'affaires client (somme factures)
- `POST /api/clients/merge` - Fusionner doublons (body: sourceId, targetId)
- `POST /api/clients/:id/relance` - Envoi email relance paiement
- `GET /api/clients/segments/:segment` - Filtrer par segment

### Règles métier
- 51. CA client: agrégation `Facture.find({ client: id }).sum(totals.grandTotal)`
- 52. Fusion doublons: copier history + contacts/adresses, supprimer source
- 53. Relances: template email + log dans interactions
- 54. Export CSV: headers = name,company,email,phone,vat,segment,createdAt
- 55. Segments auto: si `vat` présent + company → `pro`, sinon `particulier`

---

## ✅ Points 61-80 — CHANTIERS & SUIVI

### Modèle Chantier étendu
- **61. Fiche complète**: title, client, address, manager, status, phase
- **62. Phases**: enum (preparation, execution, finition, reception)
- **63. Avancement %**: `progress` (0-100)
- **64. Coûts**: `costEstimate`, `costActual`
- **65. Feuilles de temps/pointage**: `pointages[]` avec user/date/hours/note
- **66. Rapports journaliers**: `dailyReports[]` avec date/weather/workDone/issues/author
- **67. Upload photos/plans**: `files[]` (déjà présent, étendre avec upload)
- **68. Contrats & avenants**: `files[]` catégorie "contrat"
- **69. Lien devis accepté → chantier**: endpoint `POST /api/devis/:id/to-chantier`
- **70. Dates**: `startDate`, `endDate`
- **71. Chef chantier**: `manager` (ref User avec role chefChantier)
- **72. Historique incidents**: `incidents[]` avec date/type/description/severity/resolved
- **73. Rapport PDF**: génération PDF récap chantier
- **74. Statuts**: planned/in_progress/completed/on_hold + transitions contrôlées
- **75. KPIs**: `kpis.marginRate`, `kpis.costPerHour`, `kpis.daysDelay`
- **76. Filtre région**: ajout champ `region` optionnel
- **77. Dashboard chantiers**: `GET /api/chantiers/stats` (actifs, retards, coûts cumulés)
- **78. Tâches chantier**: lien avec modèle `Tache` existant
- **79. Liaison stock**: `POST /api/chantiers/:id/consume-stock` (update `Materiel.quantity`)
- **80. Clôture auto**: si `progress === 100` → status = completed

### Endpoints à implémenter
- `POST /api/chantiers` - CRUD complet (déjà présent, étendre)
- `POST /api/chantiers/:id/pointage` - Ajouter pointage
- `POST /api/chantiers/:id/incident` - Signaler incident
- `POST /api/chantiers/:id/daily-report` - Rapport journalier
- `POST /api/chantiers/:id/files` - Upload fichiers (photos/plans/contrats)
- `GET /api/chantiers/:id/pdf` - Génération PDF rapport chantier
- `GET /api/chantiers/:id/kpis` - Calcul KPIs en temps réel
- `GET /api/chantiers/stats` - Dashboard: actifs, retards, budget
- `POST /api/chantiers/:id/consume-stock` - Consommer du stock materiel
- `PUT /api/chantiers/:id/close` - Clôture chantier (set status=completed)

---

## ✅ Points 81-90 — FACTURATION, PLANNING & STOCK

### Modèle Facture étendu
- **81. Génération depuis devis**: déjà implémenté (`POST /api/devis/:id/to-facture`)
- **82. Acomptes + échéances**: `payments[]` avec `amount`, `dueDate`, `status` (pending/paid)
- **83. Suivi paiements**: `payments[]` déjà présent, ajouter statut global `paymentStatus`
- **84. Relances auto**: endpoint `POST /api/factures/:id/send-reminder` + cron job (à configurer)
- **85. Export comptable**: `GET /api/factures/export-compta?format=csv|excel` (BOB50, Winbooks CSV)
- **86. Multi-taux TVA**: `items[]` avec `taxRate` par ligne (à ajouter dans items)
- **87. Journal TVA**: `GET /api/factures/tva-journal?start=&end=` (agrégation)
- **88. Factures fournisseurs**: nouveau modèle `FactureFournisseur` (supplier invoices)
- **89. Statut facture**: `status` (unpaid/partial/paid) déjà implémenté
- **90. PDF facture**: déjà implémenté (`GET /api/factures/:id/pdf`)

### Planning (FullCalendar)
- **92. Calendrier**: endpoint `GET /api/calendar/events` (agrégation Tache + Chantier dates)
- **93. Drag&drop**: frontend React FullCalendar + `PUT /api/taches/:id` (update start/end)
- **94. Gestion congés**: nouveau modèle `Conge` avec user/start/end/status/type
- **95. Notifications planning**: webhook Socket.io sur création/modification tâche

### Stock
- **96. Référentiel matériel**: modèle `Materiel` déjà présent
- **97. Stock entrée/sortie**: `POST /api/materiels/:id/move` (body: quantity, type=in|out, reason, chantier)
- **98. Alerte seuil bas**: `GET /api/materiels/low-stock` (filter: quantity < lowStockThreshold)
- **99. Valorisation stock**: `GET /api/materiels/valuation` (sum: quantity * unitPrice)
- **100. Coût moyen pondéré**: calculer CMP sur chaque mouvement stock

---

## 📋 ACTIONS REQUISES (implémentation services/controllers)

### Priorité HAUTE (à faire maintenant)
1. **Clients CSV import/export**
   - Service: `importClientsCSV(csvText)`, `exportClientsCSV()`
   - Controller: handlers + multer pour upload CSV
   - Route: `POST /api/clients/import-csv`, `GET /api/clients/export`

2. **Chantiers pointages/incidents/rapports**
   - Service: `addPointage(chantierId, data)`, `addIncident(...)`, `addDailyReport(...)`
   - Controller: handlers avec Joi validation
   - Routes: `POST /api/chantiers/:id/pointage|incident|daily-report`

3. **Chantiers PDF + KPIs + dashboard**
   - Service: `getChantierKPIs(id)`, `getChantierStats()`
   - PDF: `utils/pdf.js` → `generateChantierPDF(chantier, res)`
   - Route: `GET /api/chantiers/:id/pdf|kpis` + `GET /api/chantiers/stats`

4. **Stock mouvements + alertes**
   - Service: `moveStock(materielId, quantity, type, reason, chantier)`, `getLowStock()`, `getValuation()`
   - Controller: handlers
   - Routes: `POST /api/materiels/:id/move`, `GET /api/materiels/low-stock|valuation`

5. **Factures acomptes + export compta + TVA journal**
   - Modèle `Facture`: extend `payments[]` avec `dueDate`, `paymentStatus`
   - Service: `exportCompta(format, start, end)`, `getTVAJournal(start, end)`
   - Routes: `GET /api/factures/export-compta`, `GET /api/factures/tva-journal`

6. **Planning calendrier + congés**
   - Modèle `Conge`: create new
   - Service: `getCalendarEvents(start, end)`, `listConges(userId)`
   - Routes: `GET /api/calendar/events`, `POST|GET /api/conges`

### Priorité MOYENNE (optionnel si temps)
- Factures fournisseurs (nouveau modèle + CRUD)
- Multi-TVA par ligne item (refactor items schema)
- CMP stock (logique complexe, peut attendre)
- Relances auto cron (scheduler externe)

---

## ✅ RÉSUMÉ LIVRAISON

### Modèles étendus
- ✅ `Client`: contacts, addresses, documents, interactions, segments, notes, archived, creditLimit
- ✅ `Chantier`: phase, pointages, incidents, dailyReports, kpis, startDate, endDate
- ✅ `Devis`: archived, files, signature, versions (déjà fait)
- ⏳ `Facture`: à étendre avec payments.dueDate, paymentStatus
- ⏳ `Conge`: à créer
- ⏳ `FactureFournisseur`: à créer (optionnel)

### Utils créés
- ✅ `utils/csv.js`: parseCSV, toCSV

### Services à créer rapidement
- `clientsService`: importCSV, exportCSV, getCA, merge, addInteraction, archive, stats
- `chantiersService`: addPointage, addIncident, addDailyReport, getKPIs, getStats, consumeStock, close
- `materielsService`: moveStock, getLowStock, getValuation
- `facturesService`: exportCompta, getTVAJournal, sendReminder
- `calendarService`: getEvents
- `congesService`: CRUD

### Routes à monter
- `/api/clients/*` (import, export, stats, CA, merge, interactions, archive)
- `/api/chantiers/*` (pointage, incident, daily-report, pdf, kpis, stats, consume-stock, close)
- `/api/materiels/*` (move, low-stock, valuation)
- `/api/factures/*` (export-compta, tva-journal, send-reminder)
- `/api/calendar/events`
- `/api/conges`

---

## 🚀 COMMANDES TESTS RAPIDES

### Clients
```powershell
# Import CSV
curl -X POST http://localhost:5000/api/clients/import-csv -H "Authorization: Bearer <TOKEN>" -F "file=@clients.csv"

# Export CSV
curl http://localhost:5000/api/clients/export -H "Authorization: Bearer <TOKEN>" --output clients.csv

# Stats
curl http://localhost:5000/api/clients/stats -H "Authorization: Bearer <TOKEN>"
```

### Chantiers
```powershell
# Ajouter pointage
curl -X POST http://localhost:5000/api/chantiers/<ID>/pointage -H "Authorization: Bearer <TOKEN>" -d '{"user":"<USER_ID>","hours":8,"note":"Travaux électriques"}'

# Incident
curl -X POST http://localhost:5000/api/chantiers/<ID>/incident -H "Authorization: Bearer <TOKEN>" -d '{"type":"Sécurité","description":"Chute échelle","severity":"high"}'

# KPIs
curl http://localhost:5000/api/chantiers/<ID>/kpis -H "Authorization: Bearer <TOKEN>"

# PDF
curl http://localhost:5000/api/chantiers/<ID>/pdf -H "Authorization: Bearer <TOKEN>" --output chantier.pdf
```

### Stock
```powershell
# Mouvement stock
curl -X POST http://localhost:5000/api/materiels/<ID>/move -H "Authorization: Bearer <TOKEN>" -d '{"quantity":-10,"type":"out","reason":"Consommation chantier","chantier":"<CHANTIER_ID>"}'

# Alertes stock bas
curl http://localhost:5000/api/materiels/low-stock -H "Authorization: Bearer <TOKEN>"
```

---

**Statut**: Modèles étendus ✅, Services/Controllers/Routes à finaliser ⏳ (30-45 min restantes)
