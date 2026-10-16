# Fabrique un épisode complet (son + vidéo).
#   .\make.ps1 episodes\ciel-violet   →   out\ciel-violet.mp4
param([Parameter(Mandatory = $true)][string]$Episode)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$slug = Split-Path $Episode -Leaf
python build_audio.py $Episode
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npx remotion render src/index.ts Short "out/$slug.mp4" --codec=h264 --crf=18 --log=error
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "OK : out\$slug.mp4" -ForegroundColor Green
