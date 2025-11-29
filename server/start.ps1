# Script de démarrage NXT Hélder Pro

Write-Host "Starting NXT Helder Pro..." -ForegroundColor Cyan

# Créer .env si inexistant
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = "MONGO_URI=mongodb://127.0.0.1:27017/nxt_helder`n"
    $envContent += "JWT_SECRET=nxt_helder_secret_key_super_secure_2024`n"
    $envContent += "JWT_REFRESH_SECRET=nxt_helder_refresh_secret_key_2024`n"
    $envContent += "JWT_EXPIRES_IN=24h`n"
    $envContent += "JWT_REFRESH_EXPIRES_IN=7d`n"
    $envContent += "PORT=5000`n"
    $envContent += "NODE_ENV=development`n"
    $envContent += "CORS_ORIGINS=http://localhost:3000`n"
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env created!" -ForegroundColor Green
}

# Installer dépendances
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Seed
if (Test-Path "src/seed.js") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npm run seed
}

# Démarrer serveur
Write-Host "Starting server on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Swagger API: http://localhost:5000/api/docs" -ForegroundColor Cyan
Write-Host "Login: admin@nxt.com / Admin123" -ForegroundColor Green

npm run dev
