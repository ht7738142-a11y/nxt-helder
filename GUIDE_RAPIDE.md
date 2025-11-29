# 🚀 GUIDE RAPIDE - NXT HÉLDER PRO

## ✅ STATUT: APP PRÊTE!

Le serveur est démarré et les données de démo sont chargées! 🎉

---

## 🌐 ACCÈS À L'APP

### Backend API
- **URL principale**: http://localhost:5000
- **Documentation Swagger**: http://localhost:5000/api/docs
- **Health check**: http://localhost:5000/api/health
- **GraphQL**: http://localhost:5000/api/graphql

---

## 🔐 CONNEXION DÉMO

### Utilisateurs créés
```
Admin:
  Email: admin@nxt.com
  Password: admin123
  
Commercial:
  Email: sales@nxt.com
  Password: sales123
```

---

## 📊 DONNÉES DE DÉMO CHARGÉES

### Clients (2)
- Dupont SARL
- Martin & Co

### Devis (3)
- Rénovation bureaux (Dupont SARL)
- Chantier voirie (Martin & Co)
- Équipements techniques (Dupont SARL)

### Factures (1)
- F2025-001 (basée sur devis Rénovation bureaux)

### Chantiers (2)
- Chantier A (en cours, 35% complété)
- Chantier B (planifié)

### Matériels (2)
- Câble 3G2.5 (120m en stock)
- Peinture blanche (20L en stock)

### Tâches (2)
- Pose câbles (en cours)
- Réunion client (à venir)

---

## 🧪 TESTER L'API (PowerShell)

### 1) Login et récupérer le token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body (@{email="admin@nxt.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.accessToken
```

### 2) Voir les devis
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/devis" -Headers @{Authorization="Bearer $token"}
```

### 3) Voir les clients
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/clients" -Headers @{Authorization="Bearer $token"}
```

### 4) Dashboard direction
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/direction" -Headers @{Authorization="Bearer $token"}
```

### 5) Stats devis
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/devis/stats" -Headers @{Authorization="Bearer $token"}
```

### 6) Créer un nouveau devis
```powershell
$clients = Invoke-RestMethod -Uri "http://localhost:5000/api/clients" -Headers @{Authorization="Bearer $token"}
$clientId = $clients[0]._id

$newDevis = @{
    title = "Nouveau devis test"
    client = $clientId
    items = @(
        @{
            description = "Test item"
            quantity = 10
            unit = "pièce"
            unitPrice = 50
            total = 500
        }
    )
    totals = @{
        subtotal = 500
        taxRate = 0.21
        tax = 105
        grandTotal = 605
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/devis" -Method Post -Headers @{Authorization="Bearer $token"} -Body $newDevis -ContentType "application/json"
```

---

## 🎯 ENDPOINTS PRINCIPAUX

### Core
- `GET /api/devis` - Liste devis
- `GET /api/clients` - Liste clients
- `GET /api/chantiers` - Liste chantiers
- `GET /api/factures` - Liste factures
- `GET /api/materiels` - Liste matériels

### Extended
- `GET /api/devis/stats` - Statistiques devis
- `GET /api/clients-ext/stats` - Statistiques clients
- `GET /api/chantiers-ext/:id/kpis` - KPIs chantier
- `GET /api/materiels-ext/low-stock` - Stock bas

### Dashboard & Analytics
- `GET /api/dashboard/direction` - Dashboard direction
- `GET /api/dashboard/kpis` - KPIs globaux
- `GET /api/ai/profitability` - Analyse rentabilité

### IA Avancée
- `POST /api/ai-advanced/chat` - Assistant IA
- `GET /api/ai-advanced/ml/recommendations` - Recommandations ML
- `GET /api/ai-advanced/ml/score-devis/:id` - Score qualité devis

### BI & Analytics
- `POST /api/bi/olap/cube` - Cube OLAP
- `GET /api/bi/forecast/growth` - Prévisions croissance
- `GET /api/bi/recommendations/strategic` - Recommandations stratégiques

### GraphQL
- `POST /api/graphql` - Query GraphQL

---

## 📱 UTILISER SWAGGER UI

1. Ouvre http://localhost:5000/api/docs dans ton navigateur
2. Clique sur "Authorize" (cadenas en haut à droite)
3. Utilise le endpoint `/api/auth/login` pour te connecter
4. Copie le `accessToken` de la réponse
5. Colle-le dans "Authorize" avec le préfixe `Bearer `
6. Teste tous les endpoints interactivement!

---

## 🔍 EXPLORER AVEC GRAPHQL

Ouvre http://localhost:5000/api/graphql (si GraphiQL est activé en dev)

Exemple query:
```graphql
{
  clients(limit: 5) {
    id
    name
    email
  }
  devisList(status: "draft") {
    id
    title
    total
    client {
      name
    }
  }
}
```

---

## 📥 EXPORT DE DONNÉES

### Export Excel
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/bi/export/factures/excel" -Headers @{Authorization="Bearer $token"} -OutFile "factures.xlsx"
```

### Export PDF devis
```powershell
$devis = Invoke-RestMethod -Uri "http://localhost:5000/api/devis" -Headers @{Authorization="Bearer $token"}
$devisId = $devis[0]._id
Invoke-WebRequest -Uri "http://localhost:5000/api/devis/$devisId/pdf" -Headers @{Authorization="Bearer $token"} -OutFile "devis.pdf"
```

---

## 🛠️ COMMANDES UTILES

### Arrêter le serveur
```powershell
# Ctrl+C dans le terminal où npm run dev tourne
```

### Redémarrer avec nouveau seed
```powershell
npm run seed
npm run dev
```

### Voir les logs
Le serveur affiche les logs en temps réel dans le terminal

---

## 🎉 PRÊT À EXPLORER!

Tout est configuré et prêt à l'emploi:
- ✅ Serveur démarré sur port 5000
- ✅ Base de données seeded avec données de démo
- ✅ 2 utilisateurs (admin + commercial)
- ✅ 2 clients, 3 devis, 1 facture, 2 chantiers
- ✅ 160+ endpoints API disponibles
- ✅ Documentation Swagger interactive
- ✅ GraphQL API ready

**Bon test! 🚀**
