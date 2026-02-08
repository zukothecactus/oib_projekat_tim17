@echo off
echo ==============================
echo Stopping ALL services on ports
echo ==============================

set PORTS=5000 5001 5002 5003 5004 5005 5006 5007 5008 5100 5173

for %%P in (%PORTS%) do (
    echo.
    echo Checking port %%P...
    for /f "tokens=5" %%A in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING') do (
        echo   Killing PID %%A on port %%P
        taskkill /PID %%A /F >nul 2>&1
    )
)

echo.
echo ==============================
echo All services stopped.
echo ==============================
pause
