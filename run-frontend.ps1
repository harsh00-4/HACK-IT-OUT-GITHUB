# Run frontend dev server (ensure Node is on PATH so npm/node work)
$ErrorActionPreference = "Stop"
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) { $env:Path = "$nodeDir;$env:Path" }
Set-Location "$PSScriptRoot\frontend"
npm run dev
