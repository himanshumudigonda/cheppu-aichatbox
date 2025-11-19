@echo off
echo ================================================
echo Building Cheppu AI App Bundle for Play Store
echo ================================================
echo.

echo Step 1: Cleaning previous builds...
call gradlew.bat clean

echo.
echo Step 2: Building release App Bundle (AAB)...
call gradlew.bat bundleRelease

echo.
echo ================================================
echo Build Complete!
echo ================================================
echo.
echo Your App Bundle (AAB) is located at:
echo app\build\outputs\bundle\release\app-release.aab
echo.
echo You can now upload this AAB to Google Play Console!
echo.
pause
