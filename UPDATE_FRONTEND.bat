@echo off
echo ========================================
echo   UPDATE FRONTEND WITH BACKEND URL
echo ========================================
echo.
echo After deploying to Render, you'll get a URL like:
echo https://cheppu-ai-chatbot-XXXX.onrender.com
echo.
set /p BACKEND_URL="Enter your Render backend URL: "

if "%BACKEND_URL%"=="" (
    echo ERROR: Backend URL cannot be empty!
    pause
    exit /b 1
)

echo.
echo Updating script.js with your backend URL...

powershell -Command "(Get-Content script.js) -replace 'const useProxyServer = false;', 'const useProxyServer = true;' | Set-Content script.js"
powershell -Command "(Get-Content script.js) -replace 'const proxyUrl = \"http://localhost:3000\";', 'const proxyUrl = \"%BACKEND_URL%\";' | Set-Content script.js"

echo.
echo Committing changes...
git add script.js
git commit -m "Updated proxy URL with Render backend"
git push

echo.
echo ========================================
echo   SUCCESS! FRONTEND UPDATED!
echo ========================================
echo.
echo Your chatbot is now fully functional!
echo.
echo Test it by opening index.html or deploy frontend:
echo.
echo OPTION 1 - GitHub Pages (Free):
echo 1. Go to: https://github.com/%USERNAME%/cheppu-ai-chatbot/settings/pages
echo 2. Source: Deploy from branch 'main'
echo 3. Save
echo 4. Your site: https://%USERNAME%.github.io/cheppu-ai-chatbot/
echo.
echo OPTION 2 - Netlify (Free):
echo 1. Go to: https://app.netlify.com
echo 2. Drag and drop this folder
echo 3. Done!
echo.
echo All 3 features now work:
echo - Chat
echo - Image Generation
echo - Text-to-Speech
echo.
pause
