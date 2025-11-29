# 🚀 Guide de Déploiement NXT Helder

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Option 1 : Déploiement Rapide (Recommandé)](#option-1--déploiement-rapide-recommandé)
3. [Option 2 : Déploiement Manuel](#option-2--déploiement-manuel)
4. [Configuration MongoDB Atlas](#configuration-mongodb-atlas)
5. [Variables d'environnement](#variables-denvironnement)
6. [Maintenance et Mises à jour](#maintenance-et-mises-à-jour)

---

## Prérequis

- Un compte GitHub (gratuit)
- Un compte Netlify (gratuit)
- Un compte Render (gratuit)
- Un compte MongoDB Atlas (gratuit)

---

## Option 1 : Déploiement Rapide (Recommandé)

### Étape 1 : Créer un repo GitHub

```bash
# Dans le dossier du projet
cd C:\Users\helde\CascadeProjects\helder\nxt-helder

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - NXT Helder v1.0"

# Créer le repo sur GitHub (va sur github.com et crée un nouveau repo "nxt-helder")

# Lier le repo local au repo GitHub
git remote add origin https://github.com/TON-USERNAME/nxt-helder.git

# Pousser le code
git branch -M main
git push -u origin main
```

### Étape 2 : Déployer le Backend sur Render

1. **Va sur [render.com](https://render.com)** et connecte-toi
2. Clique sur **"New +"** → **"Web Service"**
3. Connecte ton repo GitHub **nxt-helder**
4. Configure :
   - **Name** : `nxt-helder-api`
   - **Region** : `Frankfurt (EU Central)`
   - **Branch** : `main`
   - **Root Directory** : `server`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

5. **Variables d'environnement** (clique sur "Advanced" → "Add Environment Variable") :
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...(voir étape MongoDB)
   JWT_SECRET=ton-secret-super-securise-123456
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://ton-app.netlify.app
   ```

6. Clique sur **"Create Web Service"**
7. **Note l'URL** : `https://nxt-helder-api.onrender.com`

### Étape 3 : Configurer MongoDB Atlas

1. **Va sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
2. Crée un compte gratuit
3. Clique sur **"Build a Database"** → **"Free (M0)"**
4. Choisis **AWS** / **Frankfurt (eu-central-1)**
5. Nom du cluster : `nxt-helder`
6. Clique sur **"Create"**

7. **Créer un utilisateur** :
   - Username : `nxt-admin`
   - Password : **génère un mot de passe fort** (note-le !)
   - Clique sur **"Create User"**

8. **Configurer l'accès réseau** :
   - Clique sur **"Network Access"**
   - **"Add IP Address"**
   - Choisis **"Allow access from anywhere"** (0.0.0.0/0)
   - Clique sur **"Confirm"**

9. **Obtenir la connection string** :
   - Clique sur **"Database"** → **"Connect"**
   - Choisis **"Drivers"**
   - Copie la connection string :
     ```
     mongodb+srv://nxt-admin:<password>@nxt-helder.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Remplace `<password>`** par ton mot de passe
   - **Ajoute le nom de la DB** : `/nxt-helder?retryWrites=true&w=majority`

10. **Mets à jour la variable `MONGODB_URI`** sur Render avec cette string

### Étape 4 : Déployer le Frontend sur Netlify

1. **Va sur [netlify.com](https://netlify.com)** et connecte-toi
2. Clique sur **"Add new site"** → **"Import an existing project"**
3. Choisis **"Deploy with GitHub"**
4. Sélectionne ton repo **nxt-helder**
5. Configure :
   - **Base directory** : `web`
   - **Build command** : `npm run build`
   - **Publish directory** : `web/dist`

6. **Variables d'environnement** (Site settings → Build & deploy → Environment) :
   ```
   VITE_API_URL=https://nxt-helder-api.onrender.com/api
   ```

7. Clique sur **"Deploy site"**
8. Une fois déployé, **note l'URL** : `https://random-name-123.netlify.app`

9. **Change le nom du site** :
   - Site settings → Site details → Change site name
   - Nouveau nom : `nxt-helder-app` (ou ce que tu veux)
   - Nouvelle URL : `https://nxt-helder-app.netlify.app`

### Étape 5 : Mettre à jour CORS

1. **Retourne sur Render** (backend)
2. **Environment** → Édite `CORS_ORIGIN`
3. Mets l'URL Netlify : `https://nxt-helder-app.netlify.app`
4. **Sauvegarde** → Le service va redémarrer automatiquement

---

## ✅ C'EST EN LIGNE !

Ton app est maintenant accessible sur :
- **Frontend** : https://nxt-helder-app.netlify.app
- **Backend API** : https://nxt-helder-api.onrender.com

### Premier test
1. Va sur `https://nxt-helder-app.netlify.app`
2. Connecte-toi avec : `admin@nxt.com` / `admin123`
3. Si ça marche → **🎉 BRAVO !**

---

## Maintenance et Mises à jour

### Pour mettre à jour l'app après modification

```bash
# 1. Dans ton projet local, fais tes modifications
# 2. Commit et push

git add .
git commit -m "Description de tes changements"
git push

# 3. Netlify et Render vont automatiquement redéployer !
```

### Créer un admin sur la DB en ligne

```bash
# Sur Render, va dans "Shell" et exécute :
npm run create-admin
```

---

## Option 2 : Déploiement Manuel

### Backend sur VPS (OVH, Hetzner, etc.)

1. Loue un VPS Ubuntu
2. Installe Node.js :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Installe MongoDB :
   ```bash
   sudo apt-get install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

4. Clone ton repo :
   ```bash
   git clone https://github.com/TON-USERNAME/nxt-helder.git
   cd nxt-helder/server
   ```

5. Installe et lance :
   ```bash
   npm install
   cp .env.example .env
   # Édite .env avec nano ou vim
   npm start
   ```

6. Configure Nginx reverse proxy :
   ```nginx
   server {
       listen 80;
       server_name ton-domaine.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. SSL avec Certbot :
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d ton-domaine.com
   ```

### Frontend sur VPS

1. Build le frontend :
   ```bash
   cd ../web
   npm install
   npm run build
   ```

2. Configure Nginx pour servir le frontend :
   ```nginx
   server {
       listen 80;
       server_name ton-domaine.com;
       root /var/www/nxt-helder/web/dist;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## 🐛 Dépannage

### Backend ne démarre pas
- Vérifie les logs sur Render
- Vérifie que `MONGODB_URI` est correcte
- Vérifie que le port 5000 est bien configuré

### Frontend ne se connecte pas au backend
- Vérifie que `VITE_API_URL` pointe vers le bon backend
- Vérifie les CORS (le backend doit autoriser l'URL du frontend)
- Regarde la console du navigateur (F12)

### MongoDB connection error
- Vérifie que l'IP est autorisée (0.0.0.0/0 pour Render)
- Vérifie le mot de passe dans la connection string
- Vérifie que le nom de la DB est dans l'URL

### Site lent au premier chargement
- Normal sur le plan gratuit de Render (cold start ~30s)
- Upgrade vers un plan payant ou utilise un keep-alive ping

---

## 💰 Coûts

### Plan GRATUIT (recommandé pour commencer)
- **Netlify** : 100 GB/mois, build illimités
- **Render** : 750h/mois (suffisant), sleep après 15min d'inactivité
- **MongoDB Atlas** : 512 MB storage
- **Total** : 0€/mois 🎉

### Plan PAYANT (pour production)
- **Netlify Pro** : 19$/mois
- **Render Starter** : 7$/mois
- **MongoDB M2** : 9$/mois
- **Total** : ~35$/mois

---

## 🔒 Sécurité

### Points importants

1. **JWT_SECRET** : Utilise un secret fort et unique
   ```bash
   # Générer un secret fort
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Variables d'environnement** : Ne jamais commit .env
3. **MongoDB** : Utilise un mot de passe fort
4. **HTTPS** : Toujours utiliser SSL (automatique sur Netlify/Render)
5. **CORS** : Limite aux domaines autorisés

---

## 📊 Monitoring

### Logs
- **Netlify** : Site settings → Functions → Function log
- **Render** : Dashboard → Logs (temps réel)
- **MongoDB** : Atlas → Metrics

### Performance
- **Uptime** : uptimerobot.com (gratuit)
- **Analytics** : Google Analytics
- **Errors** : Sentry.io

---

## 🎯 Checklist de déploiement

- [ ] Code pushé sur GitHub
- [ ] MongoDB Atlas configuré
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement backend configurées
- [ ] Frontend déployé sur Netlify
- [ ] Variables d'environnement frontend configurées
- [ ] CORS configuré correctement
- [ ] Test de connexion OK
- [ ] Admin créé sur la DB de production
- [ ] SSL activé (HTTPS)
- [ ] Monitoring mis en place

---

## 🚀 Go Live !

Une fois tout configuré :
1. Teste toutes les fonctionnalités
2. Crée quelques données de test
3. Partage l'URL avec ton équipe
4. Continue à développer en local
5. Push pour déployer automatiquement

**Ton app est maintenant LIVE ! 🎉**

---

## 📞 Support

En cas de problème :
- **Documentation Netlify** : docs.netlify.com
- **Documentation Render** : render.com/docs
- **MongoDB Atlas** : docs.atlas.mongodb.com

**Version** : 1.0.0  
**Dernière mise à jour** : 29 Novembre 2025
