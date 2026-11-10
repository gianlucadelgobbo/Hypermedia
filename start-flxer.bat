@echo off
rem Kiosk per FLxER (MAM5): tiene aperto FLxER6 e il server per i comandi OSC.
rem Ogni 5 secondi: se server o FLxER6 non girano, li riavvia.
title Hypermedia Kiosk
cd /d "%~dp0"
set FLXER_DIR=C:\Program Files (x86)\FLxER6
:loop
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul || (
  start "Hypermedia Server" /min node server.js
  timeout /t 3 /nobreak >nul
)
tasklist /fi "imagename eq FLxER6.exe" | find /i "FLxER6.exe" >nul || start "" /d "%FLXER_DIR%" "%FLXER_DIR%\FLxER6.exe"
timeout /t 5 /nobreak >nul
goto loop
