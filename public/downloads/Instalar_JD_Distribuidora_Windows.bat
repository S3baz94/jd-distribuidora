@echo off
chcp 65001 >nul
title Instalador Oficial - JD Distribuidora Carnica
color 0F
cls

echo ===================================================================
echo     JD DISTRIBUIDORA CARNICA & GOURMET AHUMADOS
echo     Instalador Oficial de Software de Escritorio (Windows)
echo ===================================================================
echo.
echo  [1/3] Configurando parametros de conexion segura...
echo.

echo  [2/3] Creando acceso directo exclusivo en tu Escritorio de Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $shortcutPath = [System.IO.Path]::Combine($desktop, 'JD Distribuidora - Administracion.lnk'); $s = $ws.CreateShortcut($shortcutPath); $chrome = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'; $chrome86 = Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'; $edge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'; $edge64 = Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'; if (Test-Path $chrome) { $s.TargetPath = $chrome; $s.Arguments = '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } elseif (Test-Path $chrome86) { $s.TargetPath = $chrome86; $s.Arguments = '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } elseif (Test-Path $edge) { $s.TargetPath = $edge; $s.Arguments = '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } elseif (Test-Path $edge64) { $s.TargetPath = $edge64; $s.Arguments = '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } else { $s.TargetPath = 'https://jd-distribuidora.vercel.app/admin'; }; $s.Description = 'Software de Administracion y Facturacion POS - JD Distribuidora'; $s.Save();"

echo  [3/3] Registrando en el Menu de Inicio de Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $startMenu = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs'); $shortcutPath = [System.IO.Path]::Combine($startMenu, 'JD Distribuidora.lnk'); $s = $ws.CreateShortcut($shortcutPath); $chrome = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'; $edge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'; if (Test-Path $chrome) { $s.TargetPath = $chrome; $s.Arguments = '--app=https://jd-distribuidora.vercel.app/admin'; } elseif (Test-Path $edge) { $s.TargetPath = $edge; $s.Arguments = '--app=https://jd-distribuidora.vercel.app/admin'; } else { $s.TargetPath = 'https://jd-distribuidora.vercel.app/admin'; }; $s.Save();"

echo.
echo ===================================================================
echo  [OK] INSTALACION COMPLETADA CON EXITO!
echo  Se ha creado el acceso 'JD Distribuidora - Administracion' en tu Escritorio.
echo  Abriendo software en ventana independiente de escritorio...
echo ===================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$chrome = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'; $chrome86 = Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'; $edge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'; $edge64 = Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'; if (Test-Path $chrome) { Start-Process $chrome -ArgumentList '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } elseif (Test-Path $chrome86) { Start-Process $chrome86 -ArgumentList '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } elseif (Test-Path $edge) { Start-Process $edge -ArgumentList '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } elseif (Test-Path $edge64) { Start-Process $edge64 -ArgumentList '--app=https://jd-distribuidora.vercel.app/admin --window-size=1366,768'; } else { Start-Process 'https://jd-distribuidora.vercel.app/admin'; }"

timeout /t 3 >nul
exit
