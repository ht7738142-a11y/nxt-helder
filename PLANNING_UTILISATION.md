# 📅 Planning - Guide d'utilisation complet

## 🎯 Vue d'ensemble

Le planning NXT Helder permet de gérer les assignations de contacts aux chantiers par jour, semaine ou mois.

---

## ✨ Fonctionnalités principales

### 1. Sélection du chantier
- **Menu déroulant** en haut de la page
- Liste de tous les chantiers disponibles
- Affichage de l'équipe du chantier sélectionné dans la sidebar

### 2. Trois vues disponibles
- **📅 Jour** : Vue détaillée d'une journée
- **📅 Semaine** : Vue hebdomadaire (7 jours) avec numéro de semaine
- **📅 Mois** : Vue calendrier mensuel

### 3. Gestion des contacts
- ✅ **Ajouter** : Glisser-déposer depuis la sidebar
- ✅ **Retirer** : Bouton "Retirer" sur chaque assignation
- ✅ **Visualiser** : Avatars + noms + profils

---

## 📋 Comment utiliser

### Étape 1 : Sélectionner un chantier
1. Ouvrir le planning : Sidebar → **📅 Planning**
2. Sélectionner un chantier dans le menu déroulant
3. L'équipe du chantier s'affiche dans la sidebar gauche

### Étape 2 : Ajouter un contact
1. **Prendre un contact** de la sidebar (clic maintenu)
2. **Glisser** vers le jour souhaité dans la grille
3. **Relâcher** → le contact est assigné automatiquement
4. ✅ Le contact apparaît sous le jour avec son nom et profil

### Étape 3 : Retirer un contact
#### Option 1 : Bouton Retirer (Vue Semaine/Jour)
1. Trouver l'assignation du contact
2. Cliquer sur le bouton **"Retirer"** (fond rouge)
3. Confirmer dans la popup
4. ✅ Le contact est retiré du planning

#### Option 2 : Bouton × (Vue Mois)
1. Passer la souris sur l'assignation
2. Cliquer sur le **×** qui apparaît
3. Confirmer
4. ✅ Le contact est retiré

---

## 🎨 Interface détaillée

### Header
```
📅 Planning    [Jour] [Semaine] [Mois]    ◀ Aujourd'hui ▶    Semaine 48 | Du 25 nov au 1 déc

Chantier : [Électricité - Maison Dupont ▼]
```

### Sidebar (Équipe du chantier)
```
👥 Équipe
Électricité - Maison Dupont

[Avatar] Jean Martin
        ⚡ Électricien

[Avatar] Pierre Durand  
        🔧 Plombier

[Avatar] Marie Leroux
        🎨 Peintre

3 contacts · Glisser-déposer dans le planning
```

---

## 🗓️ Vue par vue

### Vue SEMAINE (par défaut)

#### Affichage
- **7 colonnes** : Lundi → Dimanche
- **Header** : Jour + Date + Avatars groupés
- **Cellules** :
  - Zone de drop (hover bleu)
  - Contact avec avatar + nom + profil
  - Bouton **"Retirer"** (fond rouge, toujours visible)

#### Fonctionnalités
- ✅ Drag & drop des contacts
- ✅ Numéro de semaine affiché
- ✅ Navigation semaine par semaine
- ✅ Retrait facile avec bouton visible

#### Exemple
```
Lun 25       Mar 26       Mer 27
[👤👤]       [👤]         [👤👤👤]

[Avatar] Jean Martin       [Avatar] Jean Martin
⚡ Électricien              ⚡ Électricien
[Retirer]                   [Retirer]
```

---

### Vue JOUR

#### Affichage
- **Une seule colonne** large et détaillée
- **Header** : Date complète (ex: "Lundi 25 novembre 2025")
- **Liste** : Tous les contacts du jour en grand format

#### Fonctionnalités
- ✅ Vue détaillée par jour
- ✅ Bouton "Retirer" bien visible
- ✅ Navigation jour par jour
- ✅ Idéal pour voir tous les détails

#### Exemple
```
Lundi 25 novembre 2025

[Avatar] Jean Martin
         ⚡ Électricien
         [Retirer]

[Avatar] Pierre Durand
         🔧 Plombier
         [Retirer]
```

---

### Vue MOIS

#### Affichage
- **Calendrier** complet du mois
- **7 colonnes** : Lun → Dim
- **Cellules** : Mini-cartes des contacts

#### Fonctionnalités
- ✅ Vue d'ensemble mensuelle
- ✅ Drag & drop sur n'importe quel jour
- ✅ Bouton × au hover pour retirer
- ✅ Aujourd'hui surligné en bleu

#### Exemple
```
Lun  Mar  Mer  Jeu  Ven  Sam  Dim
 25   26   27   28   29   30    1

[J.M]      [J.M]
          [P.D]
```

---

## 🔄 Retirer un contact (changement de programme)

### Pourquoi retirer ?
- 📅 Contact indisponible
- 🔧 Changement de planning
- ⚠️ Report du chantier
- 🔄 Réaffectation à un autre jour

### Comment retirer ?

#### Méthode 1 : Bouton "Retirer" (Recommandé)
1. **Vue Semaine ou Jour**
2. Trouver le contact dans la grille
3. Cliquer sur **"Retirer"** (bouton rouge)
4. Confirmer la popup :
   ```
   ⚠️ Retirer ce contact du planning ?
   
   Cette action supprimera l'assignation pour ce jour.
   
   [Annuler]  [OK]
   ```
5. ✅ Contact retiré instantanément

#### Méthode 2 : Bouton × (Vue Mois)
1. **Vue Mois**
2. Passer la souris sur le contact
3. Cliquer sur le **×** qui apparaît à droite
4. Confirmer
5. ✅ Contact retiré

#### Méthode 3 : Via l'équipe du chantier
1. Aller dans la **gestion des chantiers**
2. Éditer l'équipe
3. Retirer le contact de l'équipe
4. Les assignations futures sont conservées

---

## ⚙️ Paramètres et comportement

### Assignation automatique
- **Horaire par défaut** : 8h - 17h
- **Durée** : Journée complète
- **Couleur** : Celle du contact (colorTag)

### Confirmation de retrait
- **Message clair** avec icône ⚠️
- **Explication** de l'action
- **Annulation possible**

### Rafraîchissement
- **Automatique** après ajout/retrait
- **Pas de rechargement** de page
- **Mise à jour** instantanée

---

## 📱 Responsive

### Desktop (> 1024px)
- Sidebar visible : 288px
- Grille complète
- Tous les boutons visibles

### Tablet (768px - 1024px)
- Sidebar collapsible
- Grille scrollable
- Boutons adaptés

### Mobile (< 768px)
- Sidebar en drawer
- Vue Jour recommandée
- Boutons tactiles

---

## 🐛 Dépannage

### Le bouton "Retirer" n'apparaît pas
**Cause** : Vue Mois avec souris non hover  
**Solution** : Passer la souris sur le contact ou utiliser la vue Semaine

### Confirmation ne s'affiche pas
**Cause** : Popup bloquée par le navigateur  
**Solution** : Autoriser les popups pour le site

### Erreur lors du retrait
**Cause** : Problème réseau ou permissions  
**Solution** :
1. Vérifier la connexion
2. Rafraîchir la page
3. Se reconnecter si nécessaire

---

## 💡 Bonnes pratiques

### ✅ À faire
- **Sélectionner d'abord** le chantier
- **Confirmer** les retraits pour éviter les erreurs
- **Utiliser la vue Semaine** pour un aperçu optimal
- **Retirer puis réassigner** en cas de changement

### ❌ À éviter
- Ne pas retirer sans confirmer
- Ne pas oublier de sélectionner le chantier
- Ne pas ignorer les messages d'erreur

---

## 🔥 Cas d'usage courants

### Cas 1 : Contact malade
1. Ouvrir le planning
2. Sélectionner le chantier
3. Trouver le contact dans la grille
4. Cliquer "Retirer"
5. Glisser un autre contact pour le remplacer

### Cas 2 : Report de chantier
1. Vue Semaine du chantier
2. Retirer tous les contacts de la semaine actuelle
3. Naviguer vers la semaine suivante
4. Réassigner les mêmes contacts

### Cas 3 : Changement d'équipe
1. Retirer les anciens contacts
2. Aller dans la gestion du chantier
3. Modifier l'équipe
4. Assigner les nouveaux contacts

---

## 🎯 Raccourcis clavier (à venir)

- **Del** : Retirer le contact sélectionné
- **Ctrl + Z** : Annuler le dernier retrait
- **Flèches** : Naviguer entre les jours

---

## 📊 Résumé des fonctionnalités de retrait

| Vue | Méthode de retrait | Visibilité | Confirmation |
|-----|-------------------|-----------|--------------|
| **Jour** | Bouton "Retirer" | ✅ Toujours visible | ✅ Oui |
| **Semaine** | Bouton "Retirer" | ✅ Toujours visible | ✅ Oui |
| **Mois** | Bouton × | 🟡 Au hover | ✅ Oui |

---

## ✨ Résumé

Le planning NXT Helder permet de :
- ✅ **Assigner** des contacts par glisser-déposer
- ✅ **Retirer** facilement avec boutons visibles
- ✅ **Modifier** le planning en cas de changement
- ✅ **Confirmer** chaque action importante
- ✅ **Visualiser** en 3 vues (Jour/Semaine/Mois)

**Le retrait de contacts est maintenant simple et sécurisé ! 🚀**

---

## 📞 Support

Pour toute question :
- 📧 Email : support@nxt-helder.com
- 📚 Documentation complète : `/PLANNING_SIMPLE_GUIDE.md`
- 🔧 Guide technique : `/PLANNING_CONTACTS_GUIDE.md`

**Version** : 2.0.0 - Avec retrait de contacts  
**Date** : 29 Novembre 2025  
**Auteur** : Cascade AI Assistant
