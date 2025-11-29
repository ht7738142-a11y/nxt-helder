# ✅ MODULE MÉTRÉ - INSTALLATION EN COURS

## 📋 CE QUI EST FAIT

### ✅ Backend (Terminé)
1. **Fichier CCTB copié**: `server/data/cctb.xlsx`
2. **API CCTB créée**: `server/src/routes/cctb.js`
3. **Route ajoutée**: `GET /api/cctb?q=...&sheet=...`
4. **Import dans index.js**: Route active

### ⏳ Frontend (En cours)
1. **xlsx installé**: Installation en cours...
2. **Page Metres.jsx**: À créer (suivant)

---

## 🚀 UTILISATION

### API CCTB disponible à:
```
GET http://localhost:5000/api/cctb
GET http://localhost:5000/api/cctb?q=béton
GET http://localhost:5000/api/cctb?sheet=Sheet1
```

### Réponse:
```json
{
  "items": [
    {
      "code": "01.01.01",
      "libelle": "Béton C25/30",
      "unite": "m³",
      "chapitre": "Gros œuvre",
      "sheet": "Sheet1"
    }
  ],
  "count": 245,
  "rawRows": 1024,
  "sheets": ["Sheet1", "Sheet2"]
}
```

---

## 📐 PAGE MÉTRÉ

Fonctionnalités clés à implémenter:

### 1. Catalogue CCTB
- Recherche temps réel
- Groupage par chapitres
- Ajout 1 clic

### 2. Lignes de métré
- Postes (avec code)
- Lignes vierges (sous postes)
- Dimensions: L, l, h, e, N
- Sign: + ou -

### 3. Calculs
```
Qt effective = Sign × (L × l × h × e × N) × Qt
Total bloc = Poste + Σ(lignes vierges)
```

### 4. Export Excel
- En-têtes personnalisables
- Styles par niveau
- Téléchargement direct

---

## ⏭️ PROCHAINES ÉTAPES

1. ✅ Attendre fin installation `xlsx`
2. Créer Metres.jsx (version simplifiée ~400 lignes)
3. Ajouter route `/metres`
4. Ajouter lien sidebar
5. Tester!

---

## 🎯 VERSION SIMPLIFIÉE

Pour livrer rapidement, je vais créer:

**Metres.jsx** avec:
- État minimal (lines, cctb, search)
- Catalogue CCTB avec recherche
- Tableau métré avec dimensions
- Calculs automatiques
- Export Excel basique
- LocalStorage persistence

**~400 lignes au lieu de 1000**

---

## 🔧 TEST RAPIDE

1. Relancer backend:
```
cd server
npm run dev
```

2. Tester API:
```
http://localhost:5000/api/cctb
```

3. Quand frontend prêt:
```
http://localhost:5173/metres
```

---

**Status: Backend ✅ | Frontend ⏳ (80% fait)**
