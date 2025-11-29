# Script de démarrage rapide NXT Hélder Pro
# Lance automatiquement: install, config, seed, serveur

Write-Host "🚀 NXT Helder Pro - Démarrage automatique..." -ForegroundColor Cyan

# 1. Créer .env si inexistant
if (-not (Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    
    @"
MONGO_URI=mongodb://127.0.0.1:27017/nxt_helder
JWT_SECRET=nxt_helder_secret_key_super_secure_2024
JWT_REFRESH_SECRET=nxt_helder_refresh_secret_key_2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ .env créé!" -ForegroundColor Green
} else {
    Write-Host "✅ .env existe déjà" -ForegroundColor Green
}

# 2. Installer dépendances
Write-Host "`n📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

# 3. Créer admin si seed existe
if (Test-Path "src/seed.js") {
    Write-Host "`n🌱 Seed des données de démo..." -ForegroundColor Yellow
    npm run seed
}

# 4. Démarrer le serveur
Write-Host "`n🚀 Démarrage du serveur sur http://localhost:5000" -ForegroundColor Cyan
Write-Host "📚 Swagger API: http://localhost:5000/api/docs" -ForegroundColor Cyan
Write-Host "🔐 Login démo: admin@nxt.com / Admin123" -ForegroundColor Green
Write-Host "`nAppuyez sur Ctrl+C pour arrêter le serveur`n" -ForegroundColor Yellow

npm run dev
