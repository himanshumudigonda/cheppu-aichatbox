@echo off
echo ========================================
echo Starting Cheppu AI PWA Test Server
echo ========================================
echo.
echo This will start a local server for testing
echo your PWA at http://localhost:8080
echo.
echo To test with HTTPS (required for full PWA features):
echo 1. Install ngrok: https://ngrok.com/download
echo 2. Run: ngrok http 8080
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node test-pwa-server.js

pause
