.PHONY: help up down migrate seed build test clean logs

help:
	@echo "FinanceApp - Makefile Commands"
	@echo "------------------------------"
	@echo "make up       - Start all services with Docker Compose"
	@echo "make down     - Stop all services"
	@echo "make migrate  - Run database migrations"
	@echo "make seed     - Seed database with default data"
	@echo "make build    - Build the solution"
	@echo "make test     - Run tests"
	@echo "make clean    - Clean solution and remove volumes"
	@echo "make logs     - Show API logs"

up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started! API: http://localhost:5000 | Swagger: http://localhost:5000/swagger"

down:
	@echo "Stopping services..."
	docker-compose down
	@echo "Services stopped!"

migrate:
	@echo "Running migrations..."
	docker-compose exec api dotnet ef database update --project src/FinanceApp.Infrastructure
	@echo "Migrations completed!"

seed:
	@echo "Database will be seeded automatically when API starts"
	@echo "Default user: demo@financeapp.com / Demo@123"

build:
	@echo "Building solution..."
	dotnet build FinanceApp.sln -c Release
	@echo "Build completed!"

test:
	@echo "Running tests..."
	dotnet test tests/FinanceApp.Tests/FinanceApp.Tests.csproj --verbosity normal
	@echo "Tests completed!"

clean:
	@echo "Cleaning solution..."
	dotnet clean FinanceApp.sln
	docker-compose down -v
	@echo "Clean completed!"

logs:
	@echo "Showing API logs..."
	docker-compose logs -f api
