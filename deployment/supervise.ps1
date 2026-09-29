$ErrorActionPreference = 'Continue'
Set-Location C:\server\halalmap-korea
while ($true) {
  if ((Test-Path logs\server.log) -and (Get-Item logs\server.log).Length -gt 10MB) { Move-Item -LiteralPath logs\server.log -Destination logs\server.previous.log -Force }
  "$(Get-Date -Format o) Starting HalalMap" | Out-File logs\server.log -Append -Encoding utf8
  & 'C:\Program Files\nodejs\node.exe' --env-file-if-exists=.env deployment\serve-existing.mjs >> logs\server.log 2>&1
  "$(Get-Date -Format o) HalalMap stopped ($LASTEXITCODE); retrying in 10 seconds" | Out-File logs\server.log -Append -Encoding utf8
  Start-Sleep -Seconds 10
}
