@echo off
echo Cleaning IDE cache and rebuilding...
cd /d "%~dp0Backend"
if exist target rmdir /s /q target
echo Starting Maven build...
call mvn compile -DskipTests
if %ERRORLEVEL%==0 (
    echo.
    echo BUILD SUCCESS
    echo The application compiled successfully.
    echo.
    echo If you still see errors in VS Code:
    echo 1. Press Ctrl+Shift+P
    echo 2. Type: Java: Clean Java Language Server Workspace
    echo 3. Press Enter and restart VS Code
) else (
    echo.
    echo BUILD FAILED
)
pause
