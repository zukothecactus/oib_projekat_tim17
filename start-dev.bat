@echo off
echo ==============================
echo Starting ALL services in DEV
echo ==============================

REM ---- CLIENT ----
if exist "client\package.json" (
    echo "Starting CLIENT"
    start "CLIENT" cmd /k "cd /d client && npm i && npm run dev"
)

REM ---- GATEWAY API ----
if exist "infrastructure\gateway-api\package.json" (
    echo "Starting GATEWAY API"
    start "GATEWAY API" cmd /k "cd /d infrastructure\gateway-api && npm i && npm run dev"
)

REM ---- MICROSERVICES ----
for /d %%D in (infrastructure\microservices\*) do (
    if exist "%%D\package.json" (
        echo "Starting %%~nxD"
        start "%%~nxD" cmd /k "cd /d %%D && npm i && npm run dev"
    )
)

echo.
echo All services started in parallel 🚀
echo You can close this window.
echo ==============================