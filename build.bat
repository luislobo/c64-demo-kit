@echo off
rem Algorithm: enter this script folder, run the Node builder, restore cwd,
rem and propagate its exit code. Pause only on failure for double-click users.
rem Why: quoted paths work from another folder; no application settings live here.
setlocal
pushd "%~dp0"
node build.cjs
set "RESULT=%ERRORLEVEL%"
popd
if not "%RESULT%"=="0" pause
exit /b %RESULT%
