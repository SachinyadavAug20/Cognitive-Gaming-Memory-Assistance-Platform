@echo off
title A Day in My World
cd /d "%~dp0"
echo Starting your 3D world...
start "" http://127.0.0.1:4173
call npm start
pause
