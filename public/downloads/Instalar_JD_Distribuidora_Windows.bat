@echo off
chcp 65001 >nul
title JD Distribuidora - Software de Administracion
color 0F
cls

echo ===================================================================
echo     JD DISTRIBUIDORA CARNICA & GOURMET AHUMADOS
echo     Instalador Oficial de Software de Escritorio (Windows)
echo ===================================================================
echo.
echo  [1/3] Configurando parametros de conexion...
set TARGET_URL=https://jd-distribuidora.vercel.app/admin
set ICON_URL=https://jd-distribuidora.vercel.app/favicon.ico
set SHORTCUT_PATH=%USERPROFILE%\Desktop\JD Distribuidora - Administracion.url
set STARTMENU_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\JD Distribuidora.url

echo  [2/3] Creando acceso directo en el Escritorio y Menu Inicio...
(
  echo [InternetShortcut]
  echo URL=%TARGET_URL%
  echo IconFile=%ICON_URL%
  echo IconIndex=0
) > "%SHORTCUT_PATH%"

(
  echo [InternetShortcut]
  echo URL=%TARGET_URL%
  echo IconFile=%ICON_URL%
  echo IconIndex=0
) > "%STARTMENU_PATH%"

echo.
echo  [3/3] Abriendo aplicacion en modo ventana independiente de escritorio...
echo ===================================================================
echo  [OK] Software instalado con exito en tu computador!
echo ===================================================================
echo.

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=%TARGET_URL%
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=%TARGET_URL%
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=%TARGET_URL%
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=%TARGET_URL%
) else (
    start "" "%TARGET_URL%"
)

timeout /t 3 >nul
exit
