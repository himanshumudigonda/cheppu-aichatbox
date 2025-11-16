@echo off
echo ========================================
echo   SETUP YOUR API TOKEN
echo ========================================
echo.
echo This will configure your HuggingFace API token locally.
echo.
echo 1. Get your free token from:
echo    https://huggingface.co/settings/tokens
echo.
set /p TOKEN="Paste your HuggingFace token here: "

if "%TOKEN%"=="" (
    echo ERROR: Token cannot be empty!
    pause
    exit /b 1
)

echo.
echo Creating .env file...
echo HF_TOKEN=%TOKEN%> .env
echo PORT=3000>> .env

echo.
echo Updating script.js...
powershell -Command "(Get-Content script.js) -replace 'const apiKey = \"YOUR_HUGGINGFACE_TOKEN_HERE\";', 'const apiKey = \"%TOKEN%\";' | Set-Content script.js"

echo.
echo ========================================
echo   SUCCESS! Configuration Complete
echo ========================================
echo.
echo Your API token has been configured in:
echo - .env file (for backend server)
echo - script.js (for frontend)
echo.
echo NOTE: .env is in .gitignore and won't be uploaded to GitHub
echo.
echo You can now:
echo 1. Test locally: npm start
echo 2. Push to GitHub (token will be secure)
echo.
pause
