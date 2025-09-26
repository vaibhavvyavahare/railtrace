@echo off
echo Starting AI Frontend for RailTrace2...
echo.

echo Checking if AI_Integration service is running...
curl -s http://localhost:3100/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: AI_Integration service is not running on port 3100
    echo Please start it first with: cd AI_Integration && npm start
    echo.
    echo Starting AI Frontend anyway...
    echo You may see a "Service Unavailable" message until AI_Integration is running.
    echo.
) else (
    echo AI_Integration service is running ✓
    echo.
)

echo Starting AI Frontend on port 3001...
cd AI_frontend
npm run dev

pause
