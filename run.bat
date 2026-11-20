@echo off
rem Resolve the PowerShell launcher beside this file, forward its arguments and
rem preserve failure status. Execution policy changes apply to this process only.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" %*
exit /b %ERRORLEVEL%
