@echo off
rem All'accensione al posto del desktop parte solo l'opera scelta.
set OPERA=%~1
if "%OPERA%"=="" set /p OPERA=Quale opera? (praystation, gmunk, simian6): 
if not exist "%~dp0start-%OPERA%.bat" (
  echo Opera sconosciuta: %OPERA%
  pause
  exit /b 1
)
reg add "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "cmd.exe /c \"%~dp0start-%OPERA%.bat\"" /f
echo.
echo Kiosk attivato per %OPERA%. Riavvia il PC.
pause
