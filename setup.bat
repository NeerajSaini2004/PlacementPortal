@echo off
echo ========================================
echo MBM University Placement Portal Setup
echo ========================================

echo.
echo Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing Frontend Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the application:
echo 1. Start MongoDB service
echo 2. Backend: cd backend && npm run dev
echo 3. Frontend: cd client && npm run dev
echo 4. Seed data: cd backend && npm run seed
echo.
echo Default Admin Login:
echo Email: tpo@mbm.ac.in
echo Password: admin123
echo.
pause