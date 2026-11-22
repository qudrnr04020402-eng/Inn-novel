@echo off
chcp 65001 >nul
title 은빛 여우관 PC 서버
cd /d "%~dp0"

rem Python 확인 (py 런처 -> python 순서)
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 inn_server.py %*
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python inn_server.py %*
  goto :end
)
echo.
echo [오류] Python 을 찾을 수 없어요. https://www.python.org/downloads/ 에서 설치하세요.
echo         설치 첫 화면에서 "Add python.exe to PATH" 를 꼭 체크해야 해요.
:end
echo.
pause
