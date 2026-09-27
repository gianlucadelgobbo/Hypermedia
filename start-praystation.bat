@echo off
start "" /min node "%~dp0server.js"
timeout /t 3 /nobreak >nul
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
%CHROME% --kiosk --autoplay-policy=no-user-gesture-required --disable-session-crashed-bubble --disable-infobars --noerrdialogs --no-first-run --disable-translate --disable-features=TranslateUI --overscroll-history-navigation=0 --disable-pinch --disable-back-forward-cache http://localhost:3000/praystation.html
taskkill /f /im node.exe >nul 2>&1
