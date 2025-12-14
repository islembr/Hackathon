# Script d'installation automatique
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Automatique" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Python
Write-Host "[Étape 1/3] Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python NON trouvé!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Python n'est pas installé ou pas dans le PATH." -ForegroundColor Yellow
    Write-Host "  Veuillez installer Python depuis: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  IMPORTANT: Cochez 'Add Python to PATH' lors de l'installation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Appuyez sur une touche pour ouvrir le site de téléchargement..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://www.python.org/downloads/"
    exit 1
}

# Installer les dépendances
Write-Host "[Étape 2/3] Installation des dépendances..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre quelques minutes..." -ForegroundColor Gray
try {
    pip install -r requirements.txt
    Write-Host "  ✅ Dépendances installées avec succès!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur lors de l'installation" -ForegroundColor Red
    Write-Host "  Essayez manuellement: pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Vérifier l'installation
Write-Host "[Étape 3/3] Vérification..." -ForegroundColor Yellow
$packages = @("flask", "langchain", "langchain-google-genai")
$allInstalled = $true
foreach ($package in $packages) {
    $installed = pip list | Select-String -Pattern $package
    if (-not $installed) {
        $allInstalled = $false
    }
}

Write-Host ""
if ($allInstalled) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Installation terminée avec succès!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "  1. Démarrez le serveur: python app.py" -ForegroundColor White
    Write-Host "  2. Ouvrez Hackathon.html dans votre navigateur" -ForegroundColor White
    Write-Host ""
    Write-Host "Voulez-vous démarrer le serveur maintenant? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host ""
        Write-Host "Démarrage du serveur..." -ForegroundColor Cyan
        Write-Host "Gardez cette fenêtre ouverte!" -ForegroundColor Yellow
        Write-Host ""
        python app.py
    }
} else {
    Write-Host "  ⚠️  Certaines dépendances n'ont pas pu être installées" -ForegroundColor Yellow
    Write-Host "  Essayez manuellement: pip install -r requirements.txt" -ForegroundColor Yellow
}
