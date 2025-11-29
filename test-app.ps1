# Test NXT Helder Pro API

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NXT HELDER PRO - TESTS AUTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$base = "http://localhost:5000"

# 1. LOGIN
Write-Host "1) Login admin..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body (@{email="admin@nxt.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.accessToken
Write-Host "   OK - Token recupere" -ForegroundColor Green

# 2. STATS DEVIS
Write-Host "2) Stats devis..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$base/api/devis/stats" -Headers @{Authorization="Bearer $token"}
Write-Host "   Total devis: $($stats.total)" -ForegroundColor Green

# 3. LISTE CLIENTS
Write-Host "3) Liste clients..." -ForegroundColor Yellow
$clients = Invoke-RestMethod -Uri "$base/api/clients" -Headers @{Authorization="Bearer $token"}
Write-Host "   Nombre clients: $($clients.Count)" -ForegroundColor Green

# 4. NOUVEAU DEVIS
Write-Host "4) Creation nouveau devis..." -ForegroundColor Yellow
$clientId = $clients[0]._id
$newDevis = @{
    title = "Devis PowerShell Test"
    client = $clientId
    items = @(
        @{
            description = "Installation electrique"
            quantity = 1
            unit = "forfait"
            unitPrice = 2500
            total = 2500
        }
    )
    totals = @{
        subtotal = 2500
        taxRate = 0.21
        tax = 525
        grandTotal = 3025
    }
} | ConvertTo-Json -Depth 10

$devisCreated = Invoke-RestMethod -Uri "$base/api/devis" -Method Post -Headers @{Authorization="Bearer $token"} -Body $newDevis -ContentType "application/json"
Write-Host "   Devis cree: $($devisCreated.title)" -ForegroundColor Green

# 5. DASHBOARD
Write-Host "5) Dashboard direction..." -ForegroundColor Yellow
$dashboard = Invoke-RestMethod -Uri "$base/api/dashboard/direction" -Headers @{Authorization="Bearer $token"}
Write-Host "   CA total: $($dashboard.revenue.total) EUR" -ForegroundColor Green

# 6. PDF
Write-Host "6) Generation PDF..." -ForegroundColor Yellow
$outputDir = "tests_output"
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }
Invoke-WebRequest -Uri "$base/api/devis/$($devisCreated._id)/pdf" -Headers @{Authorization="Bearer $token"} -OutFile "$outputDir\devis_test.pdf"
Write-Host "   PDF genere: $outputDir\devis_test.pdf" -ForegroundColor Green

# RESULTAT
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS OK!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Devis cree: $($devisCreated.title)" -ForegroundColor White
Write-Host "Montant: $($devisCreated.totals.grandTotal) EUR" -ForegroundColor White
Write-Host "PDF: $outputDir\devis_test.pdf" -ForegroundColor White
Write-Host ""
Write-Host "App Swagger: http://localhost:5000/api/docs" -ForegroundColor Cyan
Write-Host "Login: admin@nxt.com / admin123" -ForegroundColor Cyan
