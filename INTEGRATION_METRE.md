# 📐 INTÉGRATION MODULE MÉTRÉ

## ✅ CE QUI VA ÊTRE CRÉÉ

J'ai analysé l'ancien module Métré et je vais le recréer IDENTIQUE dans NXT Hélder.

### Fonctionnalités complètes:

#### 1. **CCTB (Catalogue)**
- Import depuis `/api/cctb`
- Recherche intelligente (code + libellé)
- Groupage par chapitres
- Support multi-feuilles Excel

#### 2. **Lignes de métré**
- **Postes** (avec code CCTB)
- **Lignes vierges** (sous chaque poste)
- **Dimensions**: Longueur, Largeur, Hauteur, Épaisseur, Nombre
- **Sign**: + ou -
- **Quantité**: calculée automatiquement
- **Prix unitaire**
- **Marché**: Q.P ou Q.F

#### 3. **Calculs automatiques**
```javascript
Quantité effective = Sign × (L × l × h × e × N) × Quantité
Total bloc = Somme(poste + lignes vierges suivantes)
```

#### 4. **Interface**
- Tableau avec colonnes:
  - Code | Désignation | L | l | h | e | N | Qt | Unité | Marché | Sous-total | Total
- Actions par ligne: ✏️ 📄 🗑️
- Sélection multiple
- Collapse/Expand par chapitre
- Tri automatique par code

#### 5. **Export Excel professionnel**
- En-têtes personnalisables:
  - Projet, Lieu, Maître d'ouvrage, Maître d'œuvre, Entreprise
  - Lot N°, Date, Rédigé par
- Styles colorés par niveau de code
- Fusion cellules
- Filtres automatiques
- Format: `Métré_[date].xlsx`

#### 6. **Persistence**
- LocalStorage auto-save
- Récupération au reload

#### 7. **Import CCTB**
- Recherche temps réel
- Ajout 1 clic
- Copie toutes les infos (code, libellé, unité)

---

## 📂 FICHIERS À CRÉER

### 1. Frontend (React)
`web/src/pages/Metres.jsx` - ~800 lignes

### 2. Backend (Express)
`server/routes/cctb.js` - API CCTB

### 3. Data
`server/data/cctb.json` - Catalogue (à importer)

---

## 🚀 PLAN D'IMPLÉMENTATION

### ÉTAPE 1: API CCTB (15 min)
Créer endpoint GET `/api/cctb`:
- Charge fichier Excel/JSON
- Parse et normalise
- Retourne items filtrés
- Support recherche `?q=...`
- Support feuille `?sheet=...`

### ÉTAPE 2: Page Metres.jsx (45 min)
**Structure**:
```jsx
- État: lines, cctb, selected, collapsed
- Fonctions: addLine, deleteLine, updateLine, computeTotal
- UI sections:
  1. En-tête export (projet, lieu, etc.)
  2. Catalogue CCTB (recherche + liste)
  3. Tableau métré (lignes avec dimensions)
  4. Actions (Export Excel, Sauvegarder)
```

### ÉTAPE 3: Export Excel (20 min)
- Library: `xlsx` (déjà installée?)
- Génération AoA (Array of Arrays)
- Styles et fusion cellules
- Download automatique

### ÉTAPE 4: Tests (10 min)
- Ajouter poste depuis CCTB
- Ajouter lignes vierges
- Modifier dimensions
- Calculer totaux
- Exporter Excel

---

## 💾 FORMAT DONNÉES

### Ligne de métré
```typescript
{
  id: string
  code?: string           // Code CCTB (si poste)
  libelle: string        // Désignation
  unite?: string         // m², m³, ml, etc.
  longueur?: number      // L
  largeur?: number       // l  
  hauteur?: number       // h
  epaisseur?: number     // e
  nombre?: number        // N
  quantite: number       // Qt de base
  prixUnitaire: number   // P.U
  marche?: 'Q.P' | 'Q.F' // Marché
  sign?: '+' | '-'       // Signe
}
```

### Item CCTB
```typescript
{
  code: string           // 01.02.03
  libelle: string        // Béton C25/30
  unite: string          // m³
  chapitre?: string      // 01 - Gros œuvre
}
```

---

## 🎨 INTERFACE UTILISATEUR

### Layout
```
┌────────────────────────────────────────────────┐
│ 📐 MÉTRÉ                                       │
├────────────────────────────────────────────────┤
│ [En-têtes export: Projet, Lieu, etc.]         │
├────────────────────────────────────────────────┤
│ CATALOGUE CCTB                                 │
│ ┌──────────────────────────────────┐           │
│ │ Recherche: [__________________]  │           │
│ │ Feuille: [Toutes ▼]             │           │
│ │                                  │           │
│ │ ▼ 01 - Gros œuvre (23)          │           │
│ │   01.01.01 - Béton C25/30 (m³)  │ [+]       │
│ │   01.01.02 - Armatures HA (kg)  │ [+]       │
│ └──────────────────────────────────┘           │
├────────────────────────────────────────────────┤
│ TABLEAU MÉTRÉ                                  │
│ ┌─┬──────┬─────────┬──┬──┬──┬──┬──┬────┬────┐ │
│ │✓│Code  │Désgn.   │L │l │h │e │N │Qt  │Tot.│ │
│ ├─┼──────┼─────────┼──┼──┼──┼──┼──┼────┼────┤ │
│ │✓│01.01 │Béton... │5 │3 │0.│1 │2 │ 1  │30.0│ │
│ │ │      │Semelle  │2 │1 │0.│1 │4 │ 1  │ 8.0│ │
│ │ │      │         │  │  │  │  │  │    │38.0│ │
│ └─┴──────┴─────────┴──┴──┴──┴──┴──┴────┴────┘ │
├────────────────────────────────────────────────┤
│ [📊 Export Excel] [💾 Sauvegarder] [🗑️ Vider]  │
└────────────────────────────────────────────────┘
```

### Couleurs Excel
- **Niveau 0** (01): Vert foncé #5C9D9D + texte blanc
- **Niveau 1** (01.01): Rose #FFAAAA
- **Niveau 2+** (01.01.01): Vert clair #C6E0B4
- **En-tête tableau**: Bleu #B4C6E7

---

## ⚡ FONCTIONNALITÉS AVANCÉES

### Calcul intelligent
```javascript
// Facteur dimensions
const dimsFactor = (l) => {
  let f = 1
  if (l.longueur) f *= l.longueur
  if (l.largeur) f *= l.largeur  
  if (l.hauteur) f *= l.hauteur
  if (l.epaisseur) f *= l.epaisseur
  if (l.nombre) f *= l.nombre
  return f
}

// Quantité effective
const qte = (l) => {
  const sign = l.sign === '-' ? -1 : 1
  return sign * dimsFactor(l) * (l.quantite || 1)
}

// Total bloc (poste + lignes vierges)
const blockTotal = (lines, postIndex) => {
  let total = qte(lines[postIndex])
  let i = postIndex + 1
  while (i < lines.length && !lines[i].code) {
    total += qte(lines[i])
    i++
  }
  return total
}
```

### Tri automatique
```javascript
// Tri par code CCTB (01.01 avant 01.02, etc.)
const sortedLines = lines.sort((a, b) => {
  if (!a.code) return 1
  if (!b.code) return -1
  return new Intl.Collator('fr', {
    numeric: true,
    sensitivity: 'base'
  }).compare(a.code, b.code)
})
```

### Ajout ligne vierge
```javascript
// Ajoute sous le poste sélectionné
const addBlankLine = (postId) => {
  const idx = lines.findIndex(l => l.id === postId)
  const post = lines[idx]
  
  const blank = {
    id: `blank-${Date.now()}`,
    libelle: '',
    unite: post.unite,
    quantite: 1,
    prixUnitaire: post.prixUnitaire,
    sign: '+'
  }
  
  // Insérer après le poste
  const newLines = [...lines]
  newLines.splice(idx + 1, 0, blank)
  setLines(newLines)
}
```

---

## 📦 DÉPENDANCES

### À installer
```bash
npm install xlsx
```

### Imports
```javascript
import * as XLSX from 'xlsx'
import { api } from '../api'
```

---

## 🔌 API BACKEND

### GET /api/cctb
```javascript
router.get('/cctb', async (req, res) => {
  const { q, sheet } = req.query
  
  // Charger fichier CCTB
  const cctb = await loadCCTB(sheet)
  
  // Filtrer
  let items = cctb
  if (q) {
    const term = q.toLowerCase()
    items = items.filter(item => 
      item.code?.toLowerCase().includes(term) ||
      item.libelle?.toLowerCase().includes(term)
    )
  }
  
  res.json({
    items: items.slice(0, 500),
    count: items.length,
    sheets: getAllSheets()
  })
})
```

---

## 🎯 RÉSULTAT ATTENDU

Une page Métré **identique** à l'ancienne avec:
- ✅ Import CCTB fonctionnel
- ✅ Gestion lignes postes + vierges
- ✅ Calculs automatiques L×l×h
- ✅ Totaux par bloc
- ✅ Export Excel professionnel
- ✅ Styles et couleurs
- ✅ Persistence localStorage
- ✅ Interface intuitive

---

## 📝 PROCHAINES ÉTAPES

1. Tu me donnes le **GO** ✅
2. Je crée l'API CCTB (15 min)
3. Je crée Metres.jsx complet (45 min)
4. J'ajoute route + sidebar (5 min)
5. On teste ensemble (10 min)

**TOTAL: ~1h15 pour module complet**

---

## ❓ QUESTION

**Tu as un fichier CCTB (Excel/CSV/JSON)?**  
Si oui, envoie-moi un petit échantillon pour que je configure l'import correctement.

Si non, je crée un CCTB de démo avec ~50 items pour tester.

**Prêt à démarrer?** 🚀
