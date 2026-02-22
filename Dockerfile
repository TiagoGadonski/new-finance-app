FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Orbit.Api/Orbit.Api.csproj", "src/Orbit.Api/"]
COPY ["src/Orbit.Application/Orbit.Application.csproj", "src/Orbit.Application/"]
COPY ["src/Orbit.Domain/Orbit.Domain.csproj", "src/Orbit.Domain/"]
COPY ["src/Orbit.Infrastructure/Orbit.Infrastructure.csproj", "src/Orbit.Infrastructure/"]

RUN dotnet restore "src/Orbit.Api/Orbit.Api.csproj"

COPY . .
WORKDIR "/src/src/Orbit.Api"
RUN dotnet build "Orbit.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Orbit.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]
