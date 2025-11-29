# Script pour redémarrer l'app avec nettoyage complet

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REDEMARRAGE PROPRE - NXT HELDER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Arrêter processus existants sur ports 5000 et 5173
Write-Host "1) Arret des processus existants..." -ForegroundColor Yellow

$processes5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($processes5000) {
    foreach ($proc in $processes5000) {
        try {
            Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "   Arrete processus sur port 5000" -ForegroundColor Green
        } catch {}
    }
}

$processes5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($processes5173) {
    foreach ($proc in $processes5173) {
        try {
            Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "   Arrete processus sur port 5173" -ForegroundColor Green
        } catch {}
    }
}

Start-Sleep -Seconds 2

# 2. Demarrer Backend
Write-Host ""
Write-Host "2) Demarrage Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host 'BACKEND - Port 5000' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# 3. Demarrer Frontend
Write-Host "3) Demarrage Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web'; Write-Host 'FRONTEND - Port 5173' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# 4. Ouvrir navigateur
Write-Host ""
Write-Host "4) Ouverture du navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  APP REDEMARREE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "CONNEXION:" -ForegroundColor White
Write-Host "  Email: admin@nxt.com" -ForegroundColor Cyan
Write-Host "  Password: admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  1. Ouvre la Console du navigateur (F12)" -ForegroundColor Gray
Write-Host "  2. Onglet 'Console' pour voir les logs" -ForegroundColor Gray
Write-Host "  3. Si probleme, partage les messages d'erreur" -ForegroundColor Gray
Write-Host ""
Write-Host "Les serveurs tournent dans des fenetres separees." -ForegroundColor Gray
Write-Host "Ferme-les pour arreter l'app." -ForegroundColor Gray
Write-Host ""
