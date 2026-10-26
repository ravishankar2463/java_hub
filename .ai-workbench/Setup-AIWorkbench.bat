@echo off
rem Run the colocated AI Workbench setup script.
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-AIWorkbench.ps1" %*
exit /b %errorlevel%
