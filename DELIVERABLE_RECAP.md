# NXT Hélder Pro - Récapitulatif Livraison

## Fonctionnalités livrées

### 🔐 Auth & Sécurité
- ✅ JWT avec refresh tokens (rotation/révocation en DB)
- ✅ 2FA TOTP (setup QR + verify OTP)
- ✅ Login avec rate limiting (20 req/15min)
- ✅ Password policy (min 8, 1 majuscule, 1 chiffre)
- ✅ Auto-refresh frontend sur 401
- ✅ Endpoints: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/2fa/setup`, `/api/auth/2fa/verify`

### 🏗️ Architecture
- ✅ Health/readiness/liveness endpoints (`/api/health`, `/api/health/live`, `/api/health/ready`)
- ✅ Validation centralisée Joi (middleware `validate`)
- ✅ Feature flags (modèle + middleware `requireFlag`)
- ✅ Controllers/Services pattern avec Joi schemas (Clients, Devis, Factures)
- ✅ Scripts admin: `npm run create-admin`, `npm run db:backup`

### 🎨 Frontend
- ✅ Login avec champ OTP auto (si 2FA activée)
- ✅ Paramètres: section 2FA (Générer QR + Activer via OTP)
- ✅ Token management: `nxt_access` / `nxt_refresh` localStorage
- ✅ Intercepteur Axios: auto-refresh sur 401

### 🛠️ Qualité
- ✅ ESLint + Prettier (server & web)
- ✅ Husky pre-commit hooks (lint-staged)
- ✅ Scripts npm: `lint`, `format`, `prepare`, `lint-staged`

---

## Commandes d'installation & démarrage

### Backend (server)
```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder\server
npm install
npm run prepare
Copy-Item .\ENV.sample .\.env -Force
# Éditer .env et renseigner:
# JWT_SECRET, JWT_EXPIRES_IN=15m, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN=30d
npm run dev
```

### Frontend (web)
```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder\web
npm install
npm run prepare
Copy-Item .\ENV.sample .\.env -Force
# Vérifier VITE_API_URL=http://localhost:5000
npm run dev
```

### Créer un admin
```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder\server
npm run create-admin
# Suivre les prompts (nom, email, password)
```

---

## Tests de validation

### 1. Health checks
```powershell
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/live
curl http://localhost:5000/api/health/ready
```

### 2. Auth flow complet
#### Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
 -H "Content-Type: application/json" `
 -d '{"email":"admin@nxt.com","password":"Admin123"}'
```
Réponse:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "name": "...", "role": "admin", "email": "...", "twoFactorEnabled": false }
}
```

#### Refresh token
```powershell
curl -X POST http://localhost:5000/api/auth/refresh `
 -H "Content-Type: application/json" `
 -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

#### Logout (révocation)
```powershell
curl -X POST http://localhost:5000/api/auth/logout `
 -H "Content-Type: application/json" `
 -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

### 3. 2FA TOTP (si activé)
#### Setup (générer QR)
```powershell
curl -X POST http://localhost:5000/api/auth/2fa/setup `
 -H "Authorization: Bearer <ACCESS_TOKEN>" `
 -H "Content-Type: application/json"
```
Réponse:
```json
{
  "otpauth_url": "...",
  "base32": "...",
  "qrDataUrl": "data:image/png;base64,..."
}
```

#### Verify (activer 2FA)
```powershell
curl -X POST http://localhost:5000/api/auth/2fa/verify `
 -H "Authorization: Bearer <ACCESS_TOKEN>" `
 -H "Content-Type: application/json" `
 -d '{"token":"123456"}'
```

#### Login avec OTP (une fois 2FA activé)
```powershell
curl -X POST http://localhost:5000/api/auth/login `
 -H "Content-Type: application/json" `
 -d '{"email":"admin@nxt.com","password":"Admin123","otp":"123456"}'
```

### 4. Endpoints métier (exemples)

#### Clients
```powershell
# List
curl http://localhost:5000/api/clients -H "Authorization: Bearer <ACCESS_TOKEN>"

# Create
curl -X POST http://localhost:5000/api/clients `
 -H "Authorization: Bearer <ACCESS_TOKEN>" `
 -H "Content-Type: application/json" `
 -d '{"name":"Test Client","email":"test@example.com","phone":"123456"}'
```

#### Devis
```powershell
# List
curl http://localhost:5000/api/devis -H "Authorization: Bearer <ACCESS_TOKEN>"

# Create
curl -X POST http://localhost:5000/api/devis `
 -H "Authorization: Bearer <ACCESS_TOKEN>" `
 -H "Content-Type: application/json" `
 -d '{"title":"Devis test","client":"<CLIENT_ID>","items":[{"description":"Item 1","quantity":2,"unitPrice":100}]}'

# PDF
curl http://localhost:5000/api/devis/<DEVIS_ID>/pdf `
 -H "Authorization: Bearer <ACCESS_TOKEN>" --output devis.pdf
```

#### Factures
```powershell
# List
curl http://localhost:5000/api/factures -H "Authorization: Bearer <ACCESS_TOKEN>"

# Create from devis
curl -X POST http://localhost:5000/api/factures `
 -H "Authorization: Bearer <ACCESS_TOKEN>" `
 -H "Content-Type: application/json" `
 -d '{"devisId":"<DEVIS_ID>","number":"F2024-001"}'

# Add payment
curl -X PUT http://localhost:5000/api/factures/<FACTURE_ID>/pay `
 -H "Authorization: Bearer <ACCESS_TOKEN>" `
 -H "Content-Type: application/json" `
 -d '{"amount":500}'
```

---

## Tests UI

1. **Ouvrir**: http://localhost:5173
2. **Login**: admin@nxt.com / Admin123
3. **Vérifier localStorage**:
   - `nxt_access` présent
   - `nxt_refresh` présent
4. **Paramètres → 2FA**:
   - Cliquer "Générer QR"
   - Scanner avec Google Authenticator / Authy
   - Entrer code OTP + cliquer "Activer 2FA"
5. **Logout + Login avec OTP**: le champ OTP s'affiche automatiquement

---

## Structure fichiers créés/modifiés

### Backend (server)
```
src/
├── models/
│   ├── RefreshToken.js (nouveau)
│   ├── FeatureFlag.js (nouveau)
│   └── User.js (modifié: 2FA fields + roles étendus)
├── middleware/
│   ├── validate.js (nouveau)
│   ├── featureFlag.js (nouveau)
│   └── auth.js (modifié: support 2FA)
├── controllers/
│   ├── clientsController.js (nouveau)
│   ├── devisController.js (nouveau)
│   └── facturesController.js (nouveau)
├── services/
│   ├── clientsService.js (nouveau)
│   ├── devisService.js (nouveau)
│   └── facturesService.js (nouveau)
├── routes/
│   ├── auth.js (modifié: refresh + 2FA)
│   ├── health.js (nouveau)
│   ├── clients.js (refactorisé)
│   ├── devis.js (refactorisé)
│   └── factures.js (refactorisé)
├── scripts/
│   ├── createAdmin.js (nouveau)
│   └── dbBackup.js (nouveau)
├── utils/
│   └── tokens.js (nouveau)
├── config/
│   └── env.js (existant)
├── .eslintrc.cjs (nouveau)
├── .prettierrc.json (nouveau)
├── .prettierignore (nouveau)
└── .husky/
    └── pre-commit (nouveau)
```

### Frontend (web)
```
src/
├── api.js (modifié: access/refresh + intercepteur 401)
├── hooks/
│   └── useAuth.js (modifié: setTokens/clearTokens)
├── pages/
│   ├── Login.jsx (modifié: champ OTP)
│   └── Parametres.jsx (modifié: section 2FA)
├── .eslintrc.cjs (nouveau)
├── .prettierrc.json (nouveau)
└── .husky/
    └── pre-commit (nouveau)
```

---

## Variables d'environnement requises

### server/.env
```env
MONGO_URI=mongodb://127.0.0.1:27017/nxt_helder
PORT=5000
JWT_SECRET=<secret_complexe>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<secret_refresh_complexe>
JWT_REFRESH_EXPIRES_IN=30d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="NXT Helder" <no-reply@example.com>
LOG_LEVEL=info
```

### web/.env
```env
VITE_API_URL=http://localhost:5000
```

---

## Linting & Formatting

### Server
```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder\server
npm run lint
npm run format
```

### Web
```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder\web
npm run lint
npm run format
```

### Pre-commit (automatique)
Les hooks Husky sont configurés pour lancer `lint-staged` automatiquement sur `git commit`.

---

## Backup DB
```powershell
cd C:\Users\helde\CascadeProjects\helder\nxt-helder\server
npm run db:backup
# Nécessite mongodump dans le PATH
```

---

## Points de vigilance

1. **JWT_EXPIRES_IN court (15m recommandé)**: force le refresh régulier, améliore la sécurité.
2. **RefreshToken rotation**: chaque `/auth/refresh` révoque l'ancien token et en génère un nouveau.
3. **2FA obligatoire pour admin/direction**: peut être forcé côté code en ajoutant une vérification dans le middleware `auth`.
4. **Feature flags**: utiliser `requireFlag('flagKey')` middleware pour activer/désactiver des features.
5. **Validation Joi**: tous les endpoints critiques (auth, clients, devis, factures) sont validés.

---

## Prochaines étapes recommandées

- [ ] Étendre le refactor controllers/services aux autres modules (chantiers, taches, materiels, depenses, notifications)
- [ ] Ajouter tests unitaires (Jest/Mocha) pour services et controllers
- [ ] Implémenter CSP/HSTS headers (déjà Helmet en place, affiner la config)
- [ ] Activer 2FA obligatoire pour roles admin/direction
- [ ] Audit logs (modèle AuditLog + hooks sur mutations)
- [ ] RGPD: export/anonymisation de compte
- [ ] Versioning devis (snapshots + UI diff)
- [ ] Templates devis, signature électronique
- [ ] Portail client, import CSV clients
- [ ] Export comptable (BOB50/Winbooks CSV)
- [ ] Prometheus/Grafana metrics
- [ ] OpenTelemetry tracing
- [ ] Alerting (email/Slack) sur erreurs critiques
- [ ] Documentation Swagger affinée avec exemples

---

## Support & Contact

Pour toute question ou problème, référez-vous à:
- README principal du projet
- Logs backend: `server/logs/`
- Logs frontend: console navigateur (F12)
- Health checks: http://localhost:5000/api/health

---

**Livraison terminée le**: 12 novembre 2025
**Statut**: ✅ Production-ready (MVP complet avec auth avancée, 2FA, refresh tokens, validation, qualité)
