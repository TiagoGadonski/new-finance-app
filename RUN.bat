@echo off
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║     💰 FinanceApp - Inicializador Completo      ║
echo ╚══════════════════════════════════════════════════╝
echo.

echo [1/3] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado!
    echo Por favor, instale Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker encontrado!
echo.

echo [2/3] Iniciando Backend + Banco de Dados...
echo (Isso pode levar 1-2 minutos na primeira vez)
echo.

cd /d "%~dp0"
powershell -Command ".\scripts\setup.ps1 up"

echo.
echo ✅ Backend iniciado!
echo.

echo [3/3] Iniciando Frontend...
echo.

start cmd /k "cd frontend && python server.py"

timeout /t 3 >nul

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║                 ✅ TUDO PRONTO!                  ║
echo ╠══════════════════════════════════════════════════╣
echo ║                                                  ║
echo ║  Abrindo navegador em:                           ║
echo ║  👉 http://localhost:8080                        ║
echo ║                                                  ║
echo ║  Credenciais:                                    ║
echo ║  Email: demo@financeapp.com                      ║
echo ║  Senha: Demo@123                                 ║
echo ║                                                  ║
echo ║  Swagger (API): http://localhost:5000/swagger    ║
echo ║                                                  ║
echo ╚══════════════════════════════════════════════════╝
echo.

timeout /t 2 >nul
start http://localhost:8080

echo.
echo Pressione qualquer tecla para sair...
pause >nul
