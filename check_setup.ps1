# Script de vérification de l'installation
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vérification de l'Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Python
Write-Host "[1/4] Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python NON trouvé!" -ForegroundColor Red
    Write-Host "  → Installez Python depuis: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  → IMPORTANT: Cochez 'Add Python to PATH' lors de l'installation" -ForegroundColor Yellow
    exit 1
}

# Vérifier pip
Write-Host "[2/4] Vérification de pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "  ✅ pip trouvé: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ pip NON trouvé!" -ForegroundColor Red
    Write-Host "  → Essayez: python -m pip --version" -ForegroundColor Yellow
    exit 1
}

# Vérifier les fichiers
Write-Host "[3/4] Vérification des fichiers..." -ForegroundColor Yellow
$files = @("app.py", "requirements.txt", "Hackathon.html")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MANQUANT!" -ForegroundColor Red
    }
}

# Vérifier les dépendances
Write-Host "[4/4] Vérification des dépendances..." -ForegroundColor Yellow
$packages = @("flask", "langchain", "langchain-google-genai")
$allInstalled = $true
foreach ($package in $packages) {
    $installed = pip list | Select-String -Pattern $package
    if ($installed) {
        Write-Host "  ✅ $package installé" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $package NON installé" -ForegroundColor Yellow
        $allInstalled = $false
    }
}

Write-Host ""
if ($allInstalled) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Tout est prêt! Vous pouvez démarrer" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour démarrer le serveur:" -ForegroundColor Cyan
    Write-Host "  python app.py" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  ⚠️  Installation des dépendances nécessaire" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour installer les dépendances:" -ForegroundColor Cyan
    Write-Host "  pip install -r requirements.txt" -ForegroundColor White
    Write-Host ""
}
