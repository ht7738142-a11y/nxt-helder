# 🔧 GUIDE CONNEXION - PROBLÈMES RÉSOLUS

## ✅ CORRECTIFS APPLIQUÉS

1. **Dashboard corrigé** - N'affiche plus d'écran blanc
2. **Gestion erreurs améliorée** - Messages d'erreur visibles
3. **Logs ajoutés** - Pour debug dans console navigateur
4. **Script redémarrage** - Nettoyage complet

---

## 🚀 ÉTAPES POUR SE CONNECTER

### 1. Redémarrer l'app proprement

**Double-clic sur**: `RESTART-CLEAN.ps1`

Cela va:
- Arrêter les anciens processus
- Démarrer backend (port 5000)
- Démarrer frontend (port 5173)
- Ouvrir le navigateur

### 2. Ouvrir la console du navigateur

**IMPORTANT**: Appuie sur **F12** dans le navigateur pour ouvrir la console.

Tu verras des messages comme:
```
Login: attempting login for admin@nxt.com
Login: success, got token and user: Admin
Login: navigating to dashboard
Dashboard: fetching devis...
Dashboard: devis loaded: 3
```

### 3. Se connecter

```
Email: admin@nxt.com
Password: admin123
```

Clique sur **"Se connecter"**

### 4. Que faire si ça ne marche pas?

#### A) Page blanche après connexion

**Dans la console (F12), tu vois quoi?**

- **Si tu vois des messages rouges (erreurs)**:
  - Copie-les et dis-moi
  
- **Si tu ne vois rien**:
  - Rafraîchis avec **Ctrl+Shift+R**
  - Réessaie de te connecter

#### B) "Erreur de connexion" au login

**Vérifie que le backend tourne**:

Ouvre: http://localhost:5000/api/health

- **Si ça affiche du JSON** → Backend OK
- **Si "impossible de se connecter"** → Backend pas démarré
  - Relance `RESTART-CLEAN.ps1`

#### C) Dashboard vide mais pas d'erreur

C'est normal si tu n'as pas de devis! Tu verras:
- Nombre de devis: 0
- Total: 0.00
- "Aucun devis trouvé"

**Solution**: Va dans "Devis" (menu gauche) pour créer un devis.

---

## 📊 CE QUI A ÉTÉ CORRIGÉ

### Dashboard.jsx
- ✅ Affiche toujours quelque chose (pas d'écran blanc)
- ✅ Gère les erreurs sans crash
- ✅ Affiche "Chargement..." pendant le chargement
- ✅ Affiche "Aucun devis trouvé" si vide
- ✅ Logs dans console pour debug

### Login.jsx
- ✅ Vérifie que le token est reçu
- ✅ Meilleurs messages d'erreur
- ✅ Logs pour debug
- ✅ Navigation claire vers /dashboard

### api.js
- ✅ Intercepteur 401 (token invalide → retour login)
- ✅ Gestion propre des tokens
- ✅ Export `clearTokens` pour logout

### App.jsx
- ✅ Logout corrigé (utilise `clearTokens`)
- ✅ Routes protégées vérifiées

---

## 🧪 TEST RAPIDE

### Vérifier que tout fonctionne

**PowerShell**:
```powershell
# Test 1: Backend
Invoke-RestMethod "http://localhost:5000/api/health"

# Test 2: Login
$r = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body (@{email="admin@nxt.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
Write-Host "Token recu: $($r.accessToken.Substring(0,20))..."

# Test 3: Devis
$token = $r.accessToken
Invoke-RestMethod -Uri "http://localhost:5000/api/devis" -Headers @{Authorization="Bearer $token"}
```

Si ces 3 tests marchent → Ton backend est OK, le problème est côté navigateur/cache.

---

## 🎯 CHECKLIST FINALE

Avant de tester:

- [ ] `RESTART-CLEAN.ps1` exécuté
- [ ] Backend visible dans fenêtre PowerShell (messages de log)
- [ ] Frontend visible dans fenêtre PowerShell (Vite running)
- [ ] http://localhost:5173 ouvert
- [ ] Console navigateur ouverte (F12)
- [ ] Cache vidé (Ctrl+Shift+R)

Puis:

- [ ] Login avec admin@nxt.com / admin123
- [ ] Regarde console: messages "Login: success"
- [ ] Dashboard s'affiche (même vide, pas blanc)

---

## 💡 ASTUCES

### Vider le cache navigateur complètement

1. **Ctrl+Shift+Delete**
2. Coche "Cookies" et "Cache"
3. Clique "Effacer"
4. Ferme/rouvre le navigateur

### Voir les requêtes réseau

Dans F12:
- Onglet **Network** (Réseau)
- Recharge la page
- Tu vois toutes les requêtes API
- Regarde si `/auth/login` retourne 200 (OK)

---

## ❌ ERREURS FRÉQUENTES

### "Cannot GET /"
→ Backend pas démarré ou mauvais port

### "Network Error"
→ Frontend ne peut pas joindre le backend
→ Vérifie que backend tourne sur port 5000

### "Unauthorized" ou "No token"
→ Token mal stocké ou expiré
→ Déconnecte-toi, efface cache, reconnecte-toi

### Page blanche sans erreur
→ Erreur JavaScript qui crash le composant
→ Regarde console (F12) pour l'erreur exacte

---

## 📞 SI TOUJOURS BLOQUÉ

**Envoie-moi**:
1. Ce que tu vois dans la console (F12)
2. Les messages des fenêtres PowerShell (backend + frontend)
3. Capture d'écran de la page blanche

Je pourrai t'aider précisément!

---

**Bonne connexion! 🚀**
