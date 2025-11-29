# Script d'initialisation Git pour NXT Helder
Write-Host "🚀 Initialisation Git pour NXT Helder" -ForegroundColor Green
Write-Host ""

# Vérifier si Git est installé
try {
    git --version | Out-Null
    Write-Host "✓ Git est installé" -ForegroundColor Green
} catch {
    Write-Host "✗ Git n'est pas installé. Télécharge-le sur git-scm.com" -ForegroundColor Red
    exit
}

# Demander le username GitHub
Write-Host ""
$username = Read-Host "Entre ton username GitHub"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "✗ Username requis" -ForegroundColor Red
    exit
}

# Initialiser Git
Write-Host ""
Write-Host "📦 Initialisation du repository Git..." -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "⚠️  Git est déjà initialisé" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✓ Git initialisé" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host ""
Write-Host "📁 Ajout des fichiers..." -ForegroundColor Cyan
git add .
Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green

# Premier commit
Write-Host ""
Write-Host "💾 Premier commit..." -ForegroundColor Cyan
git commit -m "🚀 Initial commit - NXT Helder v1.0"
Write-Host "✓ Commit créé" -ForegroundColor Green

# Créer la branche main
Write-Host ""
Write-Host "🌿 Création de la branche main..." -ForegroundColor Cyan
git branch -M main
Write-Host "✓ Branche main créée" -ForegroundColor Green

# Ajouter le remote
Write-Host ""
Write-Host "🔗 Ajout du remote GitHub..." -ForegroundColor Cyan
$repoUrl = "https://github.com/$username/nxt-helder.git"

try {
    git remote add origin $repoUrl
    Write-Host "✓ Remote ajouté: $repoUrl" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Remote déjà existant" -ForegroundColor Yellow
}

# Instructions finales
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ ÉTAPES SUIVANTES" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. VA SUR GITHUB.COM et crée un nouveau repo :" -ForegroundColor Yellow
Write-Host "   Nom: nxt-helder" -ForegroundColor White
Write-Host "   ⚠️  NE COCHE RIEN (pas de README, pas de .gitignore)" -ForegroundColor Red
Write-Host ""
Write-Host "2. Une fois le repo créé, exécute :" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Ensuite, suis le guide :" -ForegroundColor Yellow
Write-Host "   QUICK-DEPLOY.md" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL du repo: $repoUrl" -ForegroundColor Cyan
Write-Host ""
