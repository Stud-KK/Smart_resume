@echo off
echo Starting Smart AI Resume Maker...
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Starting the application...
echo Frontend will open at: http://localhost:3000
echo Backend API will run at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

call npm run dev

pause
