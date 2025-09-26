@echo off
echo ========================================
echo    RailTrace2 - Starting All Services
echo ========================================
echo.

echo [1/5] Starting Backend API (Port 3000)...
start "Backend API" cmd /k "cd backend && echo Starting Backend API... && npm start"
timeout /t 3

echo [2/5] Starting AI Integration Service (Port 3100)...
start "AI Integration" cmd /k "cd AI_Integration && echo Starting AI Integration... && npm start"
timeout /t 5

echo [3/5] Starting Frontend - Vendor Dashboard (Port 5173)...
start "Frontend" cmd /k "cd frontend && echo Starting Frontend... && npm run dev"
timeout /t 3

echo [4/5] Starting AI Frontend - Analytics Dashboard (Port 3001)...
start "AI Frontend" cmd /k "cd AI_frontend && echo Starting AI Frontend... && npm run dev"
timeout /t 3

echo [5/5] Starting Mobile App (Port 19000)...
start "Mobile App" cmd /k "cd mobile-app/worker-app && echo Starting Mobile App... && npm start"

echo.
echo ========================================
echo All services are starting up...
echo ========================================
echo.
echo Service URLs:
echo - Backend API:        http://localhost:3000
echo - AI Integration:     http://localhost:3100
echo - Frontend:           http://localhost:5173
echo - AI Frontend:        http://localhost:3001
echo - Mobile App:         http://localhost:19000
echo.
echo Note: Wait a few minutes for all services to fully start.
echo Check the individual terminal windows for any errors.
echo.
pause
