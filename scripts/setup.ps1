# FinanceApp Setup Script
# PowerShell script para automação de tarefas

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('up', 'down', 'migrate', 'seed', 'build', 'test', 'clean', 'logs')]
    [string]$Command = 'up'
)

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Start-Services {
    Write-Info "Starting all services with Docker Compose..."
    docker-compose up -d
    Write-Success "Services started successfully!"
    Write-Info "API available at: http://localhost:5000"
    Write-Info "Swagger UI: http://localhost:5000/swagger"
}

function Stop-Services {
    Write-Info "Stopping all services..."
    docker-compose down
    Write-Success "Services stopped successfully!"
}

function Run-Migrations {
    Write-Info "Running database migrations..."

    # Check if running in Docker or locally
    if (docker ps | Select-String "financeapp-api") {
        docker-compose exec api dotnet ef database update --project src/FinanceApp.Infrastructure
    } else {
        Set-Location -Path "$PSScriptRoot\.."
        dotnet ef database update --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api
    }

    Write-Success "Migrations completed!"
}

function Seed-Database {
    Write-Info "Seeding database with default data..."
    Write-Info "Database will be seeded automatically when API starts."
    Write-Info "Default user: demo@financeapp.com / Demo@123"
    Write-Success "Seed process initiated!"
}

function Build-Solution {
    Write-Info "Building solution..."
    Set-Location -Path "$PSScriptRoot\.."
    dotnet build FinanceApp.sln -c Release
    Write-Success "Build completed!"
}

function Run-Tests {
    Write-Info "Running tests..."
    Set-Location -Path "$PSScriptRoot\.."
    dotnet test tests/FinanceApp.Tests/FinanceApp.Tests.csproj --verbosity normal
    Write-Success "Tests completed!"
}

function Clean-Solution {
    Write-Info "Cleaning solution..."
    Set-Location -Path "$PSScriptRoot\.."
    dotnet clean FinanceApp.sln

    Write-Info "Removing Docker volumes..."
    docker-compose down -v

    Write-Success "Clean completed!"
}

function Show-Logs {
    Write-Info "Showing API logs..."
    docker-compose logs -f api
}

# Main execution
try {
    switch ($Command) {
        'up' { Start-Services }
        'down' { Stop-Services }
        'migrate' { Run-Migrations }
        'seed' { Seed-Database }
        'build' { Build-Solution }
        'test' { Run-Tests }
        'clean' { Clean-Solution }
        'logs' { Show-Logs }
        default {
            Write-Error "Unknown command: $Command"
            Write-Info "Available commands: up, down, migrate, seed, build, test, clean, logs"
        }
    }
} catch {
    Write-Error "An error occurred: $_"
    exit 1
}
