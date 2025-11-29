# Script pour demarrer NXT Helder Pro (Backend + Frontend)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NXT HELDER PRO - DEMARRAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Demarrer Backend
Write-Host "1) Demarrage Backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Demarrer Frontend
Write-Host "2) Demarrage Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Ouvrir navigateur
Write-Host ""
Write-Host "3) Ouverture du navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  APP DEMARREE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Email: admin@nxt.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Les serveurs tournent dans des fenetres separees." -ForegroundColor Gray
Write-Host "Ferme les fenetres PowerShell pour arreter les serveurs." -ForegroundColor Gray
Write-Host ""

# Garder la fenetre ouverte
Write-Host "Presse une touche pour fermer cette fenetre..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
