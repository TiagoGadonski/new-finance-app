FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/FinanceApp.Api/FinanceApp.Api.csproj", "src/FinanceApp.Api/"]
COPY ["src/FinanceApp.Application/FinanceApp.Application.csproj", "src/FinanceApp.Application/"]
COPY ["src/FinanceApp.Domain/FinanceApp.Domain.csproj", "src/FinanceApp.Domain/"]
COPY ["src/FinanceApp.Infrastructure/FinanceApp.Infrastructure.csproj", "src/FinanceApp.Infrastructure/"]

RUN dotnet restore "src/FinanceApp.Api/FinanceApp.Api.csproj"

COPY . .
WORKDIR "/src/src/FinanceApp.Api"
RUN dotnet build "FinanceApp.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FinanceApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinanceApp.Api.dll"]
