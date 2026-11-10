@echo off
rem Ferma il kiosk fino al prossimo riavvio e apre il desktop.
rem Prima il ciclo di kiosk.bat (che riaprirebbe tutto), poi Chrome (o FLxER6) e il server.
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'cmd.exe' -and $_.CommandLine -match '\\(kiosk|start-[^\\]*)\.bat' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
taskkill /im chrome.exe /f >nul 2>&1
taskkill /im FLxER6.exe /f >nul 2>&1
taskkill /im node.exe /f >nul 2>&1
tasklist /fi "imagename eq explorer.exe" | find /i "explorer.exe" >nul || start explorer.exe
