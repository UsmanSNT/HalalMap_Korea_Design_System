@echo off
rem Updates the checkout, rebuilds and restarts the task. Run from anywhere: deploy\windows\update.cmd
setlocal
cd /d "%~dp0\..\.."
set TASK=%1
if "%TASK%"=="" set TASK=HalalMap-Web
git pull --ff-only || exit /b 1
call pnpm install --frozen-lockfile || exit /b 1
call pnpm check || exit /b 1
call pnpm build || exit /b 1
schtasks /end /tn %TASK% >nul 2>&1
schtasks /run /tn %TASK% || exit /b 1
ping -n 6 127.0.0.1 >nul
for /f "tokens=2 delims==" %%p in ('findstr /b "PORT=" .env') do set PORT=%%p
curl -fsS http://127.0.0.1:%PORT%/api/health && echo  updated
