# ✅ GIT EST PRÊT ! Voici les étapes EXACTES à suivre

## 🎯 Étape 1 : Créer le repo GitHub (2 min)

1. Va sur **https://github.com/new**
2. Nom du repo : `nxt-helder`
3. Description : `Application NXT Helder - Planning de chantiers`
4. **Public** ou **Private** (au choix)
5. ⚠️ **NE COCHE RIEN** (pas de README, rien !)
6. Clique sur **"Create repository"**

---

## 🚀 Étape 2 : Pousser le code (1 min)

### Ouvre PowerShell dans ce dossier et exécute :

```powershell
# REMPLACE "TON-USERNAME" par ton vrai username GitHub !
git remote add origin https://github.com/TON-USERNAME/nxt-helder.git

# Push le code
git push -u origin main
```

### Exemple si ton username est "helderdev" :
```powershell
git remote add origin https://github.com/helderdev/nxt-helder.git
git push -u origin main
```

---

## 📊 Étape 3 : MongoDB Atlas (5 min)

1. Va sur **https://mongodb.com/cloud/atlas/register**
2. Crée un compte gratuit
3. **"Create a deployment"** → **"M0 Free"**
4. Provider : **AWS** / Region : **Frankfurt**
5. Nom : `nxt-helder` → **Create**

### Créer un utilisateur
1. **Database Access** → **Add New Database User**
2. Username : `nxtadmin`
3. **Autogenerate password** → **COPIE-LE** ⚠️
4. **Add User**

### Autoriser les connexions
1. **Network Access** → **Add IP Address**
2. **"Allow access from anywhere"** (0.0.0.0/0)
3. **Confirm**

### Connection String
1. **Database** → **Connect** → **Drivers**
2. Copie : `mongodb+srv://nxtadmin:<password>@...`
3. Remplace `<password>` par ton mot de passe
4. Ajoute `/nxt-helder?retryWrites=true&w=majority` à la fin

**Garde cette string quelque part !** 📝

---

## 🔵 Étape 4 : Render.com - Backend (3 min)

1. Va sur **https://render.com** → **Sign up** (avec GitHub)
2. **"New +"** → **"Web Service"**
3. Connecte GitHub → Choisis **nxt-helder**

### Configuration :
```
Name: nxt-helder-api
Region: Frankfurt (EU Central)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### Variables d'environnement :
Clique **Advanced** → **Add Environment Variable** et ajoute :

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = (ta connection string MongoDB)
JWT_SECRET = nxt-super-secret-key-2025-production
JWT_EXPIRES_IN = 7d
CORS_ORIGIN = *
```

4. **Create Web Service**
5. **Attends 2-3 min** (ça build...)
6. **Note l'URL** : `https://nxt-helder-api.onrender.com` ⚠️

---

## 🟢 Étape 5 : Netlify - Frontend (3 min)

1. Va sur **https://netlify.com** → **Sign up** (avec GitHub)
2. **"Add new site"** → **"Import an existing project"**
3. **GitHub** → Choisis **nxt-helder**

### Configuration :
```
Base directory: web
Build command: npm run build
Publish directory: web/dist
```

### Variable d'environnement :
**Show advanced** → **New variable** :

```
VITE_API_URL = https://nxt-helder-api.onrender.com/api
```

⚠️ **Remplace par TON URL Render !**

4. **Deploy nxt-helder**
5. **Attends 2-3 min**
6. **Note l'URL** : `https://random-name.netlify.app`

### Renommer le site :
1. **Site settings** → **Change site name**
2. Nouveau nom : `nxt-helder`
3. Nouvelle URL : `https://nxt-helder.netlify.app` ✨

---

## 🔄 Étape 6 : Corriger CORS (1 min)

1. Retourne sur **Render** → ton service backend
2. **Environment** → Trouve `CORS_ORIGIN`
3. Change `*` vers `https://nxt-helder.netlify.app`
4. **Save Changes**

---

## 🎉 C'EST EN LIGNE !

### Teste maintenant :

**Va sur : https://nxt-helder.netlify.app**

Login :
- Email : `admin@nxt.com`
- Mot de passe : `admin123`

---

## ⏱️ Premier démarrage

Le backend Render (plan gratuit) dort après 15 min d'inactivité.
**Première visite = 30 secondes d'attente** → Normal !

---

## 🔄 Mises à jour futures

Quand tu modifies le code en local :

```powershell
git add .
git commit -m "Description de tes changements"
git push
```

→ Netlify et Render **redéploient automatiquement** ! ✨

---

## 📞 URLs finales

- **App** : https://nxt-helder.netlify.app
- **API** : https://nxt-helder-api.onrender.com
- **GitHub** : https://github.com/TON-USERNAME/nxt-helder

---

## ⚠️ IMPORTANT

N'oublie pas de :
- Remplacer TON-USERNAME par ton vrai username GitHub
- Copier la connection string MongoDB
- Mettre la bonne URL Render dans Netlify
- Mettre la bonne URL Netlify dans CORS_ORIGIN

---

**TEMPS TOTAL : ~15 MINUTES** ⏱️

**GO ! 🚀**
