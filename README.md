# NXT Hélder Pro

Solution SaaS BTP complète (type Vertuoza) — Express/Mongo + React/Vite/Tailwind, sécurisée, scalable, et prête à la production. Compatible avec la structure existante de métrés/devis (unités conservées).

## Arborescence
- `server/` — API Express + MongoDB (JWT, rôles, PDF, emails, uploads, Socket.io)
- `web/` — Frontend React (Vite + Tailwind, Chart.js, drag&drop, i18n, dark mode)
- `infra/helm` — Chart Helm minimal (server + web)
- `.github/workflows` — Pipelines CI/CD (build, deploy)
- `docker-compose.yml` — Stack de dev complète (Mongo + API + Web)
- `CHECKLIST.md` — Checklist de mise en prod

## Prérequis
- Node.js 18+
- Docker (optionnel mais recommandé)
- MongoDB (docker-compose inclus)

## Variables d’environnement
- Backend: voir `server/ENV.sample` → copier en `server/.env`
- Frontend: voir `web/ENV.sample` → copier en `web/.env` (ex: `VITE_API_URL=http://localhost:5000`)

## Lancement rapide (dev)
- Backend
  - `"%ProgramFiles%\nodejs\npm.cmd" install --prefix server`
  - Copier `server/ENV.sample` → `server/.env` et compléter
  - `"%ProgramFiles%\nodejs\npm.cmd" run seed --prefix server`
  - `"%ProgramFiles%\nodejs\npm.cmd" run dev --prefix server`
  - API: http://localhost:5000 — Docs: http://localhost:5000/api/docs
- Frontend
  - `"%ProgramFiles%\nodejs\npm.cmd" install --prefix web`
  - (Optionnel) `web/.env` avec `VITE_API_URL`
  - `"%ProgramFiles%\nodejs\npm.cmd" run dev --prefix web`
  - UI: http://localhost:5173
- Docker (stack complète)
  - `docker compose up --build`

## Comptes de test
- admin: `admin@nxt.com` / `admin123`
- commercial: `sales@nxt.com` / `sales123`

## Fonctionnalités clés
- Auth multi-rôles (admin, commercial, ouvrier, comptable)
- Devis (duplication, statut, transformation en facture, PDF, envoi email), compatible métrés existants
- Factures (acomptes, paiements, PDF)
- Clients, Chantiers (uploads fichiers), Tâches (planning drag&drop), Stock (inventaire), Dépenses, Notifications
- Dashboard (Chart.js), i18n FR/EN, mode sombre, Voice input FR pour devis

## Exemples API (curl)
- Login:
```
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nxt.com","password":"admin123"}'
```
- Créer un devis:
```
TOKEN=... # Bearer token
curl -X POST http://localhost:5000/api/devis \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Chantier X","client":"<clientId>","currency":"EUR","items":[{"description":"Câble","quantity":10,"unit":"m","unitPrice":5}],"totals":{"taxRate":0.21}}'
```
- PDF devis:
```
curl -L http://localhost:5000/api/devis/<devisId>/pdf -o devis.pdf
```
- Transformer en facture:
```
curl -X POST http://localhost:5000/api/devis/<devisId>/to-facture \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"number":"FAC-2025-001"}'
```

## Production (aperçu)
- Docker images (workflows `deploy.yml`) → push vers registre
- Helm chart (voir `infra/helm`) → `helm upgrade --install nxt-helder infra/helm -f infra/helm/values.yaml`
- Reverse proxy (Ingress) possible: `ingress.enabled=true`
- Checklist: voir `CHECKLIST.md` (HTTPS, backups, logs, CORS, rotation secrets)

## Compatibilité métrés/devis existants
- Le schéma `Devis` conserve la structure de lignes (quantité, unité, prix) et totaux.
- Conversions d’unités conservées et enrichies (ex: cm→m, mm→m, kg↔L, L→m³).
- Export PDF et saisie vocale intégrés.
