@echo off
echo Starting CUET Practice Test Server...

REM Change directory to the script's location
cd /d "%~dp0"

REM Start the Python server in a new window (using default port 8000)
REM The "" after start is for the window title (optional but good practice)
start "CUET Test Server" python -m http.server 8000

REM Wait a couple of seconds for the server to fully start
echo Waiting for server to start...
timeout /t 2 /nobreak > nul

REM Open the main test page in the default web browser
echo Opening test in browser...
start http://localhost:8000/index.html

echo Server is running in a separate window. Close that window when finished.
pause
exit