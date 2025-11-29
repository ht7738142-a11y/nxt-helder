# 📋 Guide Complet - Système de Contacts et Planning Avancé

## 🎯 Vue d'ensemble

Ce système complet transforme votre application NXT Helder avec :

- ✅ **Module Contacts avancé** avec 22 professions du bâtiment
- ✅ **Système de Planning puissant** avec vues Jour/Semaine/Mois
- ✅ **Drag & Drop** complet pour assigner les contacts
- ✅ **Multi-assignation** : plusieurs contacts par tâche
- ✅ **Gestion horaire** précise (6h → 20h)
- ✅ **Interface moderne** style Vertuoza

---

## 📦 Structure des fichiers créés

### Backend (Node.js/Express/MongoDB)

```
server/src/
├── models/
│   ├── Contact.js          # Modèle Contact (firstName, lastName, profile, etc.)
│   └── Assignment.js       # Modèle Assignment (planning tasks)
├── services/
│   ├── contactsService.js  # Logique métier Contacts
│   └── assignmentsService.js # Logique métier Planning
├── controllers/
│   ├── contactsController.js  # API Contacts
│   └── assignmentsController.js # API Assignments
└── routes/
    ├── contacts.js         # Routes /api/contacts
    └── assignments.js      # Routes /api/assignments
```

### Frontend (React/Vite/TailwindCSS)

```
web/src/
├── constants/
│   └── professions.js      # 22 professions avec icônes et couleurs
├── components/
│   ├── Avatar.jsx          # Avatar avec initiales + icône profession
│   └── planning/
│       ├── ContactsSidebar.jsx    # Sidebar avec recherche et drag
│       └── AssignmentModal.jsx    # Modal créer/modifier assignment
└── pages/
    ├── ContactsNew.jsx     # Page Contacts complète (remplace Clients)
    └── PlanningAdvanced.jsx # Système de planning complet
```

---

## 🔌 API Backend

### Contacts

```
GET    /api/contacts                  # Liste tous les contacts
GET    /api/contacts?profile=macon    # Filtre par profil
GET    /api/contacts?search=jean      # Recherche
GET    /api/contacts/:id              # Détails d'un contact
POST   /api/contacts                  # Créer un contact
PUT    /api/contacts/:id              # Modifier un contact
DELETE /api/contacts/:id              # Supprimer un contact
GET    /api/contacts/stats            # Statistiques
GET    /api/contacts/search?q=...     # Recherche textuelle
```

### Assignments (Planning)

```
GET    /api/assignments?start=...&end=...  # Liste par période
GET    /api/assignments/:id                # Détails assignment
POST   /api/assignments                    # Créer assignment
PUT    /api/assignments/:id                # Modifier assignment
DELETE /api/assignments/:id                # Supprimer assignment
POST   /api/assignments/:id/contacts       # Ajouter un contact
DELETE /api/assignments/:id/contacts/:cid  # Retirer un contact
GET    /api/assignments/conflicts?...      # Vérifier conflits
GET    /api/assignments/stats?...          # Statistiques
```

---

## 👥 Professions disponibles (22)

Chaque profession a :
- **value** : clé unique
- **label** : nom affiché
- **icon** : emoji
- **color** : couleur hex

Liste complète :
1. Architecte 🏛️
2. Ingénieur ⚙️
3. Maçon 🔨
4. Charpentier 🪚
5. Couvreur 🏠
6. Électricien ⚡
7. Plombier 🔧
8. Peintre 🎨
9. Menuisier 📐
10. Carreleur ⬜
11. Plâtrier 🧱
12. Chauffagiste 🔥
13. Chef de chantier 👷
14. Conducteur de travaux 📋
15. Bureau d'étude 📊
16. Géomètre 🗺️
17. Jardinier 🌱
18. Fournisseur 📦
19. Sous-traitant 🤝
20. Client 👤
21. Prospect 🎯
22. Autre •

---

## 🎨 Fonctionnalités - Page Contacts

### Affichage
- ✅ Tableau moderne avec avatars colorés
- ✅ Icône de profession sur chaque avatar
- ✅ Badge coloré pour le profil
- ✅ Pagination (10 contacts par page)
- ✅ Responsive

### Filtres
- 🔍 **Recherche** : nom, prénom, société, email, téléphone
- 🎯 **Profil** : dropdown avec les 22 professions
- 🏷️ **Badges actifs** : voir les filtres appliqués

### Actions
- 👁️ **Voir** : modal détaillé avec toutes les infos
- ✏️ **Modifier** : formulaire complet
- 🗑️ **Supprimer** : avec confirmation
- ➕ **Créer** : formulaire avec tous les champs

### Champs Contact
- Prénom * (requis)
- Nom * (requis)
- Profil (22 choix)
- Société
- Email
- Téléphone
- Adresse
- Notes

---

## 📅 Fonctionnalités - Page Planning

### Vues disponibles

#### 1️⃣ Vue Jour
- Colonne unique avec heures 6h → 20h
- Blocs d'assignments détaillés
- Drag & drop pour assigner

#### 2️⃣ Vue Semaine (principale)
- Grille 7 jours × 15 heures
- Lundi → Dimanche
- Cellules interactives

#### 3️⃣ Vue Mois
- Calendrier mensuel complet
- Aperçu des assignments par jour
- Clic pour voir détails

### Sidebar Contacts
- 📱 **Draggable** : glisser-déposer dans le planning
- 🔍 **Recherche** : par nom/société
- 🎯 **Filtre** : par profil
- 👁️ **Hover** : voir téléphone, email, société

### Créer/Modifier Assignment
- **Chantier** : sélection (requis)
- **Date/Heure début** : datetime picker (requis)
- **Date/Heure fin** : datetime picker (requis)
- **Contacts** : multi-sélection avec avatars
- **Couleur** : 10 couleurs prédéfinies
- **Note** : commentaire libre

### Drag & Drop
✅ Glisser un contact de la sidebar → cellule planning
✅ Ouverture automatique du modal avec date/heure pré-remplies
✅ Validation des plages horaires

### Interactions
- **Double-clic** sur un bloc → éditer
- **Hover** sur un bloc → voir détails
- **Bouton supprimer** (visible au hover)
- **Avatars groupés** : voir tous les contacts assignés

---

## 🚀 Comment utiliser

### 1. Démarrer l'application

```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder
.\START-APP.PS1
```

Ou manuellement :
```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd web
npm run dev
```

### 2. Se connecter
- URL : `http://localhost:5173/login`
- Email : `admin@nxt.com`
- Password : `admin123`

### 3. Créer des contacts
1. Aller sur **Contacts** (menu sidebar)
2. Cliquer **+ Nouveau contact**
3. Remplir le formulaire
4. Sélectionner un **profil** (profession)
5. Enregistrer

### 4. Utiliser le Planning
1. Aller sur **Planning** (menu sidebar)
2. **Vue Semaine** active par défaut
3. **Glisser un contact** depuis la sidebar
4. **Déposer dans une cellule** (jour + heure)
5. Le modal s'ouvre → **sélectionner le chantier**
6. **Enregistrer**

### 5. Modifier un assignment
1. **Double-cliquer** sur un bloc dans le planning
2. Modifier dates, contacts, couleur, note
3. Enregistrer

---

## 🎨 Design & UX

### Couleurs principales
- **Bleu** : #3B82F6 (boutons, liens)
- **Gris** : #6B7280 (textes secondaires)
- **Vert** : #10B981 (succès)
- **Rouge** : #EF4444 (erreurs)

### Avatars
- Cercles colorés avec initiales
- Icône profession en badge
- Couleur auto-générée par nom
- Tailles : sm, md, lg, xl

### Responsive
- Desktop : sidebar 320px
- Tablette : sidebar rétractable
- Mobile : menu hamburger

---

## 🔧 Personnalisation

### Ajouter une profession

Éditer `web/src/constants/professions.js` :

```javascript
export const PROFESSIONS = [
  // ... existantes
  { 
    value: "nouvelle_prof", 
    label: "Nouvelle Profession", 
    icon: "🎯", 
    color: "#FF6B6B" 
  }
]
```

Puis éditer `server/src/models/Contact.js` :

```javascript
profile: { 
  type: String, 
  enum: [
    // ... existantes
    'nouvelle_prof'
  ]
}
```

### Modifier les heures planning

Éditer `web/src/pages/PlanningAdvanced.jsx` :

```javascript
// Changer 6-20h en 7-19h par exemple
const hours = Array.from({ length: 12 }, (_, i) => i + 7);
```

### Changer les couleurs

Éditer les couleurs dans :
- `web/src/constants/professions.js` (couleurs professions)
- `web/src/components/planning/AssignmentModal.jsx` (couleurs assignments)

---

## 📊 Modèles de données

### Contact
```javascript
{
  _id: ObjectId,
  firstName: String (requis),
  lastName: String (requis),
  company: String,
  email: String,
  phone: String,
  address: String,
  profile: String (enum 22 professions),
  colorTag: String (hex),
  notes: String,
  archived: Boolean,
  createdAt: Date,
  updatedAt: Date,
  // Virtuels
  fullName: String,
  initials: String
}
```

### Assignment
```javascript
{
  _id: ObjectId,
  chantier: ObjectId (ref Chantier, requis),
  startDatetime: Date (requis),
  endDatetime: Date (requis),
  assignedContacts: [ObjectId] (ref Contact),
  colorTag: String (hex),
  note: String,
  status: String (planned|in_progress|completed|cancelled),
  createdBy: ObjectId (ref User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ Tests recommandés

### Contacts
1. ✅ Créer un contact avec profil
2. ✅ Rechercher par nom
3. ✅ Filtrer par profil
4. ✅ Modifier un contact
5. ✅ Supprimer un contact
6. ✅ Pagination fonctionnelle

### Planning
1. ✅ Changer de vue (Jour/Semaine/Mois)
2. ✅ Naviguer entre dates
3. ✅ Glisser un contact dans une cellule
4. ✅ Créer une assignment
5. ✅ Assigner plusieurs contacts
6. ✅ Modifier une assignment
7. ✅ Supprimer une assignment
8. ✅ Voir détails au hover

---

## 🐛 Dépannage

### Le backend ne démarre pas
```powershell
cd server
npm install
npm run dev
```

### Le frontend ne démarre pas
```powershell
cd web
npm install
npm run dev
```

### Erreur 404 sur /api/contacts
Vérifier que `server/src/index.js` contient :
```javascript
import contactsRoutes from './routes/contacts.js';
app.use('/api/contacts', contactsRoutes);
```

### Erreur MongoDB
Vérifier que MongoDB tourne :
```powershell
# Windows
net start MongoDB
```

### Contacts ne s'affichent pas dans Planning
1. Vérifier que des contacts existent
2. Vérifier la console navigateur (F12)
3. Vérifier l'appel API `/api/contacts`

---

## 📝 TODO / Améliorations futures

- [ ] Notifications de conflits d'horaires
- [ ] Export PDF du planning
- [ ] Vue ressource (par contact)
- [ ] Glisser pour redimensionner les blocs
- [ ] Récurrence des assignments
- [ ] Intégration calendrier Google
- [ ] App mobile React Native
- [ ] Notifications push
- [ ] Statistiques avancées
- [ ] Import/Export contacts CSV

---

## 🎉 Résumé

Vous avez maintenant un système complet de :

✅ **Gestion de Contacts** professionnelle avec 22 professions du bâtiment
✅ **Planning avancé** avec drag & drop et multi-assignation
✅ **3 vues** (Jour/Semaine/Mois) entièrement fonctionnelles
✅ **UI moderne** inspirée de Vertuoza
✅ **Backend robuste** avec validation et gestion d'erreurs
✅ **Optimisé** pour la performance et l'UX

**L'application est prête à l'emploi ! 🚀**

---

## 📞 Support

Pour toute question ou amélioration, contactez l'équipe de développement.

**Version** : 2.0.0  
**Date** : 29 novembre 2025  
**Auteur** : Cascade AI Assistant
