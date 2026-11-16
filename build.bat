@echo off
setlocal
pushd "%~dp0"
node build.cjs
set "RESULT=%ERRORLEVEL%"
popd
if not "%RESULT%"=="0" pause
exit /b %RESULT%
