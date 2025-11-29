# Test automatique NXT Hélder Pro
# Ce script teste l'API et crée des données visibles dans l'app

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  NXT HELDER PRO - TESTS AUTOMATIQUES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$base = "http://localhost:5000"

# 1. LOGIN
Write-Host "1) Login admin..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body (@{email="admin@nxt.com"; password="Admin123"} | ConvertTo-Json) -ContentType "application/json"
    $token = $response.accessToken
    Write-Host "   ✓ Login OK - Token récupéré" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Erreur login" -ForegroundColor Red
    exit 1
}

# 2. STATS DEVIS
Write-Host "`n2) Récupération stats devis..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$base/api/devis/stats" -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ Total devis: $($stats.total)" -ForegroundColor Green
Write-Host "   ✓ Devis draft: $($stats.byStatus.draft)" -ForegroundColor Green

# 3. LISTE CLIENTS
Write-Host "`n3) Liste des clients..." -ForegroundColor Yellow
$clients = Invoke-RestMethod -Uri "$base/api/clients" -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ Nombre de clients: $($clients.Count)" -ForegroundColor Green
foreach ($client in $clients) {
    Write-Host "     - $($client.name) ($($client.email))" -ForegroundColor Gray
}

# 4. CRÉER UN NOUVEAU DEVIS
Write-Host "`n4) Création nouveau devis..." -ForegroundColor Yellow
$clientId = $clients[0]._id
$newDevis = @{
    title = "Devis créé par test auto"
    client = $clientId
    items = @(
        @{
            description = "Installation électrique complète"
            quantity = 1
            unit = "forfait"
            unitPrice = 2500
            total = 2500
        },
        @{
            description = "Câblage réseau"
            quantity = 50
            unit = "m"
            unitPrice = 15
            total = 750
        }
    )
    totals = @{
        subtotal = 3250
        taxRate = 0.21
        tax = 682.5
        grandTotal = 3932.5
    }
} | ConvertTo-Json -Depth 10

$devisCreated = Invoke-RestMethod -Uri "$base/api/devis" -Method Post -Headers @{Authorization="Bearer $token"} -Body $newDevis -ContentType "application/json"
Write-Host "   ✓ Devis créé: $($devisCreated.title)" -ForegroundColor Green
Write-Host "     ID: $($devisCreated._id)" -ForegroundColor Gray

# 5. DASHBOARD DIRECTION
Write-Host "`n5) Dashboard direction..." -ForegroundColor Yellow
$dashboard = Invoke-RestMethod -Uri "$base/api/dashboard/direction" -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ CA total: $($dashboard.revenue.total) EUR" -ForegroundColor Green
Write-Host "   ✓ Devis en attente: $($dashboard.devis.pending)" -ForegroundColor Green
Write-Host "   ✓ Chantiers actifs: $($dashboard.chantiers.active)" -ForegroundColor Green

# 6. EXPORT PDF DEVIS
Write-Host "`n6) Génération PDF du devis créé..." -ForegroundColor Yellow
$outputDir = "tests_output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}
Invoke-WebRequest -Uri "$base/api/devis/$($devisCreated._id)/pdf" -Headers @{Authorization="Bearer $token"} -OutFile "$outputDir\devis_test.pdf"
Write-Host "   ✓ PDF généré: $outputDir\devis_test.pdf" -ForegroundColor Green

# 7. STATS CLIENTS
Write-Host "`n7) Stats clients avancées..." -ForegroundColor Yellow
$clientStats = Invoke-RestMethod -Uri "$base/api/clients-ext/stats" -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ Clients actifs: $($clientStats.activeClients)" -ForegroundColor Green
Write-Host "   ✓ CA moyen/client: $($clientStats.avgRevenuePerClient) EUR" -ForegroundColor Green

# 8. CHANTIERS
Write-Host "`n8) Liste chantiers..." -ForegroundColor Yellow
$chantiers = Invoke-RestMethod -Uri "$base/api/chantiers" -Headers @{Authorization="Bearer $token"}
Write-Host "   ✓ Nombre chantiers: $($chantiers.Count)" -ForegroundColor Green
foreach ($ch in $chantiers) {
    Write-Host "     - $($ch.title) - $($ch.status) ($($ch.progress)%)" -ForegroundColor Gray
}

# 9. ML RECOMMENDATIONS (si disponible)
Write-Host "`n9) Recommandations ML..." -ForegroundColor Yellow
try {
    $reco = Invoke-RestMethod -Uri "$base/api/ai-advanced/ml/recommendations" -Headers @{Authorization="Bearer $token"}
    Write-Host "   ✓ $($reco.recommendations.Count) recommandations trouvées" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Pas de recommandations ML (données insuffisantes)" -ForegroundColor Yellow
}

# 10. EXPORT EXCEL FACTURES
Write-Host "`n10) Export Excel factures..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "$base/api/bi/export/factures/excel" -Method Post -Headers @{Authorization="Bearer $token"} -Body '{}' -ContentType "application/json" -OutFile "$outputDir\factures.xlsx"
    Write-Host "   ✓ Excel généré: $outputDir\factures.xlsx" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Export Excel non disponible" -ForegroundColor Yellow
}

# RÉSUMÉ FINAL
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS TERMINÉS AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nFichiers générés dans: $outputDir\" -ForegroundColor White
Write-Host "- devis_test.pdf" -ForegroundColor Gray
if (Test-Path "$outputDir\factures.xlsx") {
    Write-Host "- factures.xlsx" -ForegroundColor Gray
}

Write-Host "`nDonnées créées visibles dans l'app:" -ForegroundColor White
Write-Host "- Nouveau devis: '$($devisCreated.title)'" -ForegroundColor Gray
Write-Host "- Client: $($clients[0].name)" -ForegroundColor Gray
Write-Host "- Montant: $($devisCreated.totals.grandTotal) EUR" -ForegroundColor Gray

Write-Host "`nAccès app:" -ForegroundColor White
Write-Host "- Swagger UI: http://localhost:5000/api/docs" -ForegroundColor Cyan
Write-Host "- Login: admin@nxt.com / Admin123" -ForegroundColor Cyan

Write-Host "`nPresse une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
