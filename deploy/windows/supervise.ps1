# Keeps the HalalMap server running: restarts it 10 seconds after it exits. Started by the scheduled task.
# Logs: logs\server.out.log and logs\server.err.log (previous run kept as *.prev.log).
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root
New-Item -ItemType Directory -Force -Path logs | Out-Null
$node = 'C:\Program Files\nodejs\node.exe'
$out = Join-Path $root 'logs\server.out.log'
$err = Join-Path $root 'logs\server.err.log'
while ($true) {
  if (Test-Path $out) { Move-Item -LiteralPath $out -Destination "$out.prev" -Force }
  if (Test-Path $err) { Move-Item -LiteralPath $err -Destination "$err.prev" -Force }
  $process = Start-Process -FilePath $node -ArgumentList '--env-file=.env', 'server\index.mjs' `
    -WorkingDirectory $root -NoNewWindow -Wait -PassThru -RedirectStandardOutput $out -RedirectStandardError $err
  "$(Get-Date -Format o) server exited with code $($process.ExitCode); restarting in 10 seconds" | Out-File (Join-Path $root 'logs\supervisor.log') -Append -Encoding ascii
  Start-Sleep -Seconds 10
}
