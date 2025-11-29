# 📋 Planning Simple - Guide d'utilisation

## 🎯 Vue d'ensemble

Le **Planning Simple** est une vue de planning sans colonnes d'heures, parfaite pour assigner des contacts à des jours spécifiques sur un chantier.

---

## ✨ Fonctionnalités

### 1. Sélection du chantier
- Menu déroulant en haut de la page
- Affiche : Nom du chantier + Client
- Une fois sélectionné, l'équipe du chantier s'affiche dans la sidebar

### 2. Sidebar Équipe
- Liste des contacts de l'équipe du chantier sélectionné
- Chaque contact affiche :
  - Avatar avec initiales
  - Nom complet
  - Profil/Profession (icône + label)
- **Draggable** : glisser-déposer dans la grille

### 3. Grille Planning
- **7 colonnes** : Lundi → Dimanche
- **Pas d'heures** : assignation par jour uniquement
- Header de chaque jour :
  - Nom du jour (Lun, Mar, etc.)
  - Numéro du jour
  - Avatars groupés des contacts assignés
- **Cellules** :
  - Zone de drop pour les contacts
  - Affiche les assignations avec avatar + nom + profil
  - Bouton retirer (× au hover)

### 4. Navigation
- **◀ Suivant / Précédent ▶** : changer de semaine
- **Aujourd'hui** : revenir à la semaine courante
- Affichage de la période : "Du X au Y"

---

## 🚀 Comment utiliser

### Étape 1 : Sélectionner un chantier
1. Ouvrir le menu **📋 Planning Chantier** dans la sidebar
2. Dans le menu déroulant en haut, choisir un chantier
3. L'équipe du chantier s'affiche dans la sidebar gauche

### Étape 2 : Assigner des contacts
1. **Prendre un contact** de la sidebar (maintenir le clic)
2. **Glisser** vers une cellule du jour souhaité
3. **Relâcher** → le contact est assigné automatiquement
4. Horaire par défaut : 8h-17h (modifiable via API)

### Étape 3 : Gérer les assignations
- **Voir** : les contacts assignés apparaissent dans chaque cellule
- **Retirer** : hover sur une assignation → clic sur ×
- **Naviguer** : changer de semaine avec ◀ ▶

---

## 📊 Exemple d'utilisation

### Scénario : Chantier "Maison Dupont"

1. Sélectionner "Maison Dupont" dans le menu
2. Sidebar affiche :
   - Jean Martin (Électricien)
   - Pierre Durand (Plombier)
   - Marie Leroux (Peintre)

3. Planning de la semaine :
   - **Lundi** : Glisser Jean Martin → assignation électricité
   - **Mardi** : Glisser Pierre Durand → assignation plomberie
   - **Mercredi-Jeudi** : Glisser Jean Martin (2 fois si besoin)
   - **Vendredi** : Glisser Marie Leroux → assignation peinture

4. Résultat :
   - Grille montre tous les contacts par jour
   - Avatars groupés en haut de chaque jour
   - Navigation facile entre les semaines

---

## 🎨 Interface

### Couleurs
- **Bleu** : jour courant (aujourd'hui)
- **Gris** : autres jours
- **Couleurs des contacts** : chaque contact a sa couleur (colorTag)

### Layout
- **Responsive** : adaptation mobile/tablette
- **Sidebar** : 288px (w-72)
- **Grille** : 7 colonnes égales

---

## 🔧 Backend API

### Endpoints utilisés

#### Chantiers
```
GET /api/chantiers
→ Liste de tous les chantiers

GET /api/chantiers/:id/team
→ Équipe (contacts) du chantier sélectionné
```

#### Assignments
```
GET /api/assignments?start=...&end=...&chantier=...
→ Assignments de la semaine pour le chantier

POST /api/assignments
→ Créer une assignation
Body: {
  chantier: "xxx",
  startDatetime: "2025-11-25T08:00:00Z",
  endDatetime: "2025-11-25T17:00:00Z",
  assignedContacts: ["contactId"],
  colorTag: "#3B82F6"
}

DELETE /api/assignments/:id
→ Supprimer une assignation
```

---

## 📋 Différences avec Planning Avancé

| Fonctionnalité | Planning Simple | Planning Avancé |
|----------------|-----------------|-----------------|
| **Colonnes** | Jours uniquement | Jours + Heures (6h-20h) |
| **Sélection chantier** | ✅ Obligatoire | ❌ Optionnel |
| **Sidebar** | Équipe du chantier | Tous les contacts |
| **Vues** | Semaine uniquement | Jour / Semaine / Mois |
| **Horaires** | 8h-17h automatique | Personnalisable |
| **Use case** | Assignation simple par jour | Gestion horaire précise |

---

## 🎯 Cas d'usage idéaux

### ✅ Utiliser Planning Simple pour :
- Planification rapide des chantiers
- Savoir qui travaille quel jour
- Vue d'ensemble hebdomadaire
- Petites équipes (5-10 personnes)
- Pas besoin de précision horaire

### ❌ Utiliser Planning Avancé pour :
- Gestion horaire détaillée
- Plusieurs chantiers simultanés
- Drag & drop entre chantiers
- Vues multiples (jour/mois)
- Grandes équipes avec rotations

---

## 🐛 Dépannage

### Sidebar vide
**Cause** : Aucun contact dans l'équipe du chantier
**Solution** :
1. Aller sur Planning Avancé
2. Sélectionner le chantier dans la sidebar
3. Ajouter des contacts à l'équipe
4. Revenir sur Planning Simple

### Contacts ne se draggent pas
**Cause** : Problème de drag & drop HTML5
**Solution** :
- Vérifier que `draggable` est sur l'élément
- Tester sur un autre navigateur
- Vérifier console pour erreurs

### Assignations ne s'affichent pas
**Cause** : Mauvais filtre par chantier
**Solution** :
- Vérifier que le chantier est bien sélectionné
- Vérifier l'URL de l'API dans la console (F12)
- S'assurer que les assignments ont le bon `chantier` ID

---

## 🚀 Prochaines améliorations possibles

### Court terme
- [ ] Filtrage des contacts par profil dans la sidebar
- [ ] Double-clic sur cellule pour assigner rapidement
- [ ] Duplication d'assignation (copier Lundi → Mardi)
- [ ] Notes par assignation

### Moyen terme
- [ ] Vue mensuelle simplifiée
- [ ] Export PDF de la semaine
- [ ] Impression optimisée
- [ ] Historique des assignations

### Long terme
- [ ] Récurrence (répéter toutes les semaines)
- [ ] Notifications (rappels)
- [ ] Conflits de disponibilité
- [ ] Intégration calendrier externe

---

## 📝 Résumé

**Planning Simple** est parfait pour :
- ✅ Assignation rapide par jour
- ✅ Vue d'ensemble hebdomadaire claire
- ✅ Gestion d'équipe par chantier
- ✅ Interface épurée sans heures

**URL** : `/planning-simple`  
**Icon** : 📋 Planning Chantier

**Le planning est opérationnel ! 🎉**

---

## 📞 Support

Pour toute question :
- 📧 Email : support@nxt-helder.com
- 📚 Doc complète : `/PLANNING_CONTACTS_GUIDE.md`

**Version** : 1.0.0 - Planning Simple  
**Date** : 29 Novembre 2025  
**Auteur** : Cascade AI Assistant
