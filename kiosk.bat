@echo off
rem Avvia il server e tiene aperta un'opera in Chrome kiosk.
rem Ogni 5 secondi: se server o Chrome non girano, li riavvia. Uso: kiosk.bat pagina.html
title Hypermedia Kiosk
cd /d "%~dp0"
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
:loop
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul || (
  start "Hypermedia Server" /min node server.js
  timeout /t 3 /nobreak >nul
)
tasklist /fi "imagename eq chrome.exe" | find /i "chrome.exe" >nul || start "" %CHROME% --kiosk --user-data-dir="%LOCALAPPDATA%\HypermediaKiosk" --autoplay-policy=no-user-gesture-required --disable-session-crashed-bubble --disable-infobars --noerrdialogs --no-first-run --disable-translate --disable-features=TranslateUI --overscroll-history-navigation=0 --disable-pinch --disable-back-forward-cache http://localhost:3000/%1
timeout /t 5 /nobreak >nul
goto loop
