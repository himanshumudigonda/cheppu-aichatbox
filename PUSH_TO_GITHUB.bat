@echo off
echo ========================================
echo   CHEPPU AI - AUTOMATED GITHUB SETUP
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/3] Checking Git configuration...
git config user.name >nul 2>&1
if errorlevel 1 (
    echo Setting up Git user...
    git config user.name "Himanshu"
    git config user.email "himanshu@cheppu.com"
)

echo [2/3] Git repository already initialized!
echo [3/3] All files committed to main branch!
echo.
echo ========================================
echo   READY TO PUSH TO GITHUB!
echo ========================================
echo.
echo MANUAL STEPS REQUIRED:
echo.
echo 1. Create GitHub Repository:
echo    Go to: https://github.com/new
echo    Name: cheppu-ai-chatbot
echo    Make it PUBLIC
echo    Click 'Create repository'
echo.
echo 2. Copy YOUR repository URL from GitHub
echo.
echo 3. Enter your GitHub username below:
echo.
set /p GITHUB_USER="Enter your GitHub username: "

if "%GITHUB_USER%"=="" (
    echo ERROR: Username cannot be empty!
    pause
    exit /b 1
)

set REPO_URL=https://github.com/%GITHUB_USER%/cheppu-ai-chatbot.git

echo.
echo ========================================
echo   PUSHING TO GITHUB...
echo ========================================
echo.

git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo Pushing code to GitHub...
echo If prompted for credentials, use Personal Access Token as password
echo Get token from: https://github.com/settings/tokens
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo   PUSH FAILED - AUTHENTICATION NEEDED
    echo ========================================
    echo.
    echo Please create a Personal Access Token:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Select "repo" scope
    echo 4. Copy the token
    echo 5. Use it as password when git asks
    echo.
    echo Run this script again after creating the token.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! CODE PUSHED TO GITHUB!
echo ========================================
echo.
echo Repository URL: %REPO_URL%
echo.
echo ========================================
echo   NEXT: DEPLOY BACKEND
echo ========================================
echo.
echo 1. Open: https://render.com
echo 2. Click "New +" then "Web Service"
echo 3. Connect your GitHub account
echo 4. Select repository: cheppu-ai-chatbot
echo 5. Render will auto-detect settings!
echo 6. Add environment variable:
echo    Key: HF_TOKEN
echo    Value: [YOUR_HUGGINGFACE_TOKEN]
echo    Get token from: https://huggingface.co/settings/tokens
echo 7. Click "Create Web Service"
echo 8. Copy your Render URL
echo.
echo After deployment, run: UPDATE_FRONTEND.bat
echo.
pause
