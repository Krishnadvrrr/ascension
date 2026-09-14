@echo off
title Solo Leveling Discipline System - Public Server
echo ========================================================
echo   SOLO LEVELING: STUDENT PRODUCTIVITY & DISCIPLINE SYSTEM
echo   SYSTEM ARCHITECT: @krishnadvrr
echo ========================================================
echo.
echo [1/2] Starting Flask Application on port 5000...
start /b "" .\venv\Scripts\python.exe app.py

timeout /t 3 >nul

echo [2/2] Launching Public Cloudflare Tunnel...
echo.
echo Send the public https://...trycloudflare.com link to your friends!
echo Keep this window open while sharing.
echo.
.\cloudflared.exe tunnel --url http://127.0.0.1:5000
pause
