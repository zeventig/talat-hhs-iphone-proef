@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Talat HHS iPhone-proef naar GitHub
cd /d "%~dp0"
echo ==================================================
echo  Talat HHS v1.1 - ALLEEN PUBLIEKE PROEFCODE
echo ==================================================
echo.
echo LET OP: deze aparte map bevat GEEN persoonlijke studiegegevens.
echo Gebruik alleen een LEGE openbare GitHub-repository.
echo Maak op github.com/new een repo genaamd talat-hhs-iphone-proef.
echo Vink GEEN README, .gitignore of license aan.
echo.
set /p "REPOURL=Plak hier de repository-URL (https://github.com/... .git): "
if /I not "%REPOURL:~0,19%"=="https://github.com/" (
  echo FOUT: gebruik een https://github.com/... URL.
  pause
  exit /b 1
)
where git >nul 2>nul
if errorlevel 1 (
  echo FOUT: Git is niet gevonden.
  pause
  exit /b 1
)
if not exist "package.json" (
  echo FOUT: open het script uit de map iphone-proef-github.
  pause
  exit /b 1
)
if not exist ".git" (
  git init -b main
  if errorlevel 1 goto :fail
)
git add README.md package.json capacitor.config.json www .github .gitignore UPLOAD_NAAR_GITHUB.cmd
if errorlevel 1 goto :fail
git diff --cached --quiet
if not errorlevel 1 goto :skipcommit
git -c user.name="Talat HHS proef" -c user.email="talat-hhs-proef@users.noreply.github.com" commit -m "Talat HHS publieke iPhone-proef v1.1"
if errorlevel 1 (
  echo.
  echo De commit kon niet worden gemaakt. Stuur de Git-fout door.
  goto :fail
)
:skipcommit
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin "%REPOURL%"
  if errorlevel 1 goto :fail
)
echo.
echo Upload naar je eigen GitHub-repository...
git push -u origin main
if errorlevel 1 goto :fail
echo.
echo KLAAR! Open GitHub ^> Actions ^> Bouw iPhone proef-IPA ^> Run workflow.
pause
exit /b 0
:fail
echo.
echo Er is iets misgegaan. Kopieer de foutregel naar ChatGPT.
pause
exit /b 1
