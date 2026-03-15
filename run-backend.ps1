# Run backend API (activate venv if present, then uvicorn)
$ErrorActionPreference = "Stop"
$backend = "$PSScriptRoot\backend"
$venv = "$backend\.venv\Scripts\Activate.ps1"
if (Test-Path $venv) { . $venv }
Set-Location $backend
python -m uvicorn app.main:app --reload --port 8000
