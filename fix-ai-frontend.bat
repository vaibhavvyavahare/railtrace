@echo off
echo ========================================
echo   Fixing AI Frontend Database Issues
echo ========================================
echo.

echo [1/4] Checking PostgreSQL service...
sc query postgresql-x64-13 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL service not found!
    echo Please install PostgreSQL or start the service manually.
    echo.
    echo To start PostgreSQL service:
    echo net start postgresql-x64-13
    echo.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL service found
)

echo.
echo [2/4] Setting up AI Integration database...
cd AI_Integration
node setup-database.js
if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    echo Please check PostgreSQL credentials and try again.
    pause
    exit /b 1
)

echo.
echo [3/4] Starting AI Integration service...
start "AI Integration" cmd /k "cd AI_Integration && node server.js"
timeout /t 5

echo.
echo [4/4] Starting AI Frontend...
cd ..
cd AI_frontend
start "AI Frontend" cmd /k "cd AI_frontend && npm run dev"

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo AI Integration: http://localhost:3100
echo AI Frontend:    http://localhost:3001
echo.
echo If you still see issues:
echo 1. Check the terminal windows for error messages
echo 2. Open browser console (F12) for frontend errors
echo 3. Test the health endpoint: http://localhost:3100/health
echo.
pause
