@echo off
rem Ripristina il desktop normale di Windows.
reg delete "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f
echo.
echo Kiosk disattivato. Riavvia il PC.
pause
