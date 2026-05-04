@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend\dealership-project"
set "SQL_FILE=%SCRIPT_DIR%database\schema.sql"
set "BACKEND_LOG=%TEMP%\dealership-backend.log"
set "FRONTEND_LOG=%TEMP%\dealership-frontend.log"

set "RESEED=false"

x
for %%A in (%*) do (
    if "%%A"=="--seed" set "RESEED=true"
)

echo.
echo  +======================================+
echo  ^|   ^>^>  Dealership Demo  --  start.bat  ^|
echo  +======================================+
echo.

where mvn >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'mvn' not found – please install Maven and add it to PATH.
    pause & exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'node' not found – please install Node.js and add it to PATH.
    pause & exit /b 1
)

where mysql >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'mysql' not found – please install MySQL and add it to PATH.
    pause & exit /b 1
)

where curl >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'curl' not found – please install curl (included with Windows 10 1803+^).
    pause & exit /b 1
)

if not defined MYSQL_USER set "MYSQL_USER=root"

if not defined MYSQL_PASSWORD (
    set /p "MYSQL_PASSWORD=MySQL password for '%MYSQL_USER%' (press Enter for none): "
)

echo [INFO] Testing MySQL connection...

if "!MYSQL_PASSWORD!"=="" (
    mysql -u%MYSQL_USER% -e "SELECT 1" >nul 2>&1
) else (
    mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 1" >nul 2>&1
)

if errorlevel 1 (
    echo [ERROR] Cannot connect to MySQL as '%MYSQL_USER%'. Check credentials and ensure MySQL is running.
    pause & exit /b 1
)
echo [OK] MySQL connected

if "!RESEED!"=="true" (
    echo [INFO] Re-seeding database ^(--seed flag^)...
    if "!MYSQL_PASSWORD!"=="" (
        mysql -u%MYSQL_USER% -e "DROP DATABASE IF EXISTS dealership_db;"
    ) else (
        mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "DROP DATABASE IF EXISTS dealership_db;"
    )
)

echo [INFO] Running database/schema.sql...
if "!MYSQL_PASSWORD!"=="" (
    mysql -u%MYSQL_USER% < "%SQL_FILE%"
) else (
    mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% < "%SQL_FILE%"
)

if errorlevel 1 (
    echo [ERROR] Failed to run schema.sql
    pause & exit /b 1
)
echo [OK] Database ready

if not exist "%FRONTEND_DIR%\node_modules" (
    echo [INFO] Installing frontend dependencies ^(first run^)...
    call npm install --prefix "%FRONTEND_DIR%" --silent
    if errorlevel 1 (
        echo [ERROR] npm install failed
        pause & exit /b 1
    )
    echo [OK] Dependencies installed
)

set "SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/dealership_db"
set "SPRING_DATASOURCE_USERNAME=%MYSQL_USER%"
set "SPRING_DATASOURCE_PASSWORD=%MYSQL_PASSWORD%"

for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr ":8080 "') do (
    if not "%%P"=="0" (
        echo [INFO] Killing stale process on port 8080 ^(PID %%P^)...
        taskkill /F /PID %%P >nul 2>&1
        timeout /t 2 /nobreak >nul
    )
)

echo [INFO] Starting Spring Boot backend on :8080...
start "Dealership Backend" /MIN cmd /c "cd /d "%BACKEND_DIR%" && mvn -q spring-boot:run > "%BACKEND_LOG%" 2>&1"

echo|set /p="  Waiting for backend"
set "BACKEND_READY=false"
for /l %%i in (1,1,40) do (
    if "!BACKEND_READY!"=="false" (
        curl -sf http://localhost:8080/api/vehicles >nul 2>&1
        if not errorlevel 1 (
            echo   ready!
            set "BACKEND_READY=true"
        ) else (
            echo|set /p="."
            timeout /t 3 /nobreak >nul
        )
    )
)

if "!BACKEND_READY!"=="false" (
    echo.
    echo [ERROR] Backend did not start in time. See %BACKEND_LOG% for details.
    pause & exit /b 1
)

echo [INFO] Starting Next.js frontend on :3000...
start "Dealership Frontend" /MIN cmd /c "cd /d "%FRONTEND_DIR%" && npm run dev > "%FRONTEND_LOG%" 2>&1"

echo|set /p="  Waiting for frontend"
set "FRONTEND_READY=false"
for /l %%i in (1,1,20) do (
    if "!FRONTEND_READY!"=="false" (
        curl -sf http://localhost:3000 >nul 2>&1
        if not errorlevel 1 (
            echo   ready!
            set "FRONTEND_READY=true"
        ) else (
            echo|set /p="."
            timeout /t 3 /nobreak >nul
        )
    )
)

if "!FRONTEND_READY!"=="false" (
    echo.
    echo [ERROR] Frontend did not start in time. See %FRONTEND_LOG% for details.
    pause & exit /b 1
)

echo    Frontend   -^>  http://localhost:3000
echo    Backend    -^>  http://localhost:8080
echo.
echo  Press Ctrl+C to stop. The backend and frontend run in separate windows.
echo.

:healthcheck
timeout /t 10 /nobreak >nul

curl -sf http://localhost:8080/api/vehicles >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backend stopped responding. See %BACKEND_LOG%
    pause & exit /b 1
)

curl -sf http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend stopped responding. See %FRONTEND_LOG%
    pause & exit /b 1
)

goto healthcheck