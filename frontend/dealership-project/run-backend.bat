@echo off
set SCHEMA=%~dp0..\..\database\schema.sql

echo.
set /p DB_PASS=MySQL password for root (press Enter for none):

if "%DB_PASS%"=="" (
    mysql -uroot < "%SCHEMA%"
) else (
    mysql -uroot -p%DB_PASS% < "%SCHEMA%"
)

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to run schema.sql. Make sure MySQL is running and your password is correct.
    pause
    exit /b 1
)

echo Database ready.
echo.

cd ..\..\backend

if exist "%USERPROFILE%\apache-maven-3.9.6\bin\mvn.cmd" (
    "%USERPROFILE%\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
) else (
    mvn spring-boot:run
)

pause
