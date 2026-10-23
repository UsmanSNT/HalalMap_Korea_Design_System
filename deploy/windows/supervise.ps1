# Keeps the HalalMap server running: restarts it 10 seconds after it exits. Started by the scheduled task.
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root
New-Item -ItemType Directory -Force -Path logs | Out-Null
$node = 'C:\Program Files\nodejs\node.exe'
while ($true) {
  if ((Test-Path logs\server.log) -and (Get-Item logs\server.log).Length -gt 10MB) {
    Move-Item -LiteralPath logs\server.log -Destination logs\server.previous.log -Force
  }
  "$(Get-Date -Format o) starting" | Out-File logs\server.log -Append -Encoding ascii
  cmd.exe /c "`"$node`" --env-file=.env server\index.mjs >> logs\server.log 2>&1"
  "$(Get-Date -Format o) stopped ($LASTEXITCODE); retrying in 10 seconds" | Out-File logs\server.log -Append -Encoding ascii
  Start-Sleep -Seconds 10
}
