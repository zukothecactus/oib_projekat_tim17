@echo off
echo ====================================
echo Zaustavljanje svih procesa aplikacije
echo ====================================
echo.

REM Gateway API
echo Zaustavljam Gateway API (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

REM Auth Microservice
echo Zaustavljam Auth Microservice (port 5001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

REM User Microservice
echo Zaustavljam User Microservice (port 5002)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5002 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

REM Processing Microservice
echo Zaustavljam Processing Microservice (port 5003)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5003 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

REM Audit Microservice
echo Zaustavljam Audit Microservice (port 5004)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5004 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

REM Storage Microservice
echo Zaustavljam Storage Microservice (port 5006)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5006 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

REM Production Microservice
echo Zaustavljam Production Microservice (port 5100)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5100 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo.
echo ====================================
echo Svi procesi su zaustavljeni!
echo ====================================
pause
