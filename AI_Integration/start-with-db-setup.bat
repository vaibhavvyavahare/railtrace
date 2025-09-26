@echo off
echo ========================================
echo   AI Integration - Database Setup
echo ========================================
echo.

echo [1/3] Setting up database...
node setup-database.js
if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    echo Please check PostgreSQL is running and credentials are correct.
    pause
    exit /b 1
)

echo.
echo [2/3] Database setup completed successfully!
echo.

echo [3/3] Starting AI Integration service...
echo.
node server.js

pause
