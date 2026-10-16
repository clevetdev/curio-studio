# Installation du studio sur Windows (PowerShell).
#   .\scripts\setup.ps1
# Installe ffmpeg si besoin, les dépendances npm/pip, puis télécharge les modèles de voix.
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "Installation de ffmpeg (winget)..."
    winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
    Write-Host "ffmpeg installé. Ferme et rouvre ton terminal pour qu'il soit dans le PATH, puis relance ce script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Dépendances npm..."
npm install --no-audit --no-fund

Write-Host "Dépendances Python..."
python -m pip install --quiet kokoro-onnx soundfile scipy sherpa-onnx

Write-Host "Modèles de voix..."
New-Item -ItemType Directory -Force -Path models, models\piper | Out-Null
foreach ($f in @("kokoro-v1.0.onnx", "voices-v1.0.bin")) {
    if (-not (Test-Path "models\$f")) {
        Write-Host "  $f"
        Invoke-WebRequest -Uri "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f" -OutFile "models\$f"
    }
}
foreach ($v in @("fr_FR-tom-medium", "fr_FR-upmc-medium", "fr_FR-siwis-medium")) {
    if (-not (Test-Path "models\piper\vits-piper-$v")) {
        Write-Host "  $v"
        $tmp = "models\piper\$v.tar.bz2"
        Invoke-WebRequest -Uri "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-$v.tar.bz2" -OutFile $tmp
        tar -xjf $tmp -C models\piper
        Remove-Item $tmp
    }
}

Write-Host "Setup OK. Fabrique un épisode avec : .\make.ps1 episodes\ciel-violet" -ForegroundColor Green
