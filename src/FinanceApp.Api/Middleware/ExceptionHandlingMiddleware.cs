using System.Net;
using System.Text.Json;
using FluentValidation;
using FinanceApp.Domain.Exceptions;

namespace FinanceApp.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = Guid.NewGuid().ToString();
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex, correlationId);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception, string correlationId)
    {
        var (statusCode, message, errors) = exception switch
        {
            NotFoundException notFound =>
                (HttpStatusCode.NotFound, notFound.Message, null as Dictionary<string, string[]>),

            UnauthorizedException unauthorized =>
                (HttpStatusCode.Unauthorized, unauthorized.Message, null as Dictionary<string, string[]>),

            ValidationException validation =>
                (HttpStatusCode.BadRequest,
                 "Validation failed",
                 validation.Errors
                     .GroupBy(e => e.PropertyName)
                     .ToDictionary(
                         g => g.Key,
                         g => g.Select(e => e.ErrorMessage).ToArray())),

            DomainException domain =>
                (HttpStatusCode.BadRequest, domain.Message, null as Dictionary<string, string[]>),

            _ =>
                (HttpStatusCode.InternalServerError,
                 _environment.IsDevelopment() ? exception.Message : "An internal server error occurred",
                 null as Dictionary<string, string[]>)
        };

        // Log with appropriate level and context
        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception,
                "Unhandled exception occurred. CorrelationId: {CorrelationId}, Path: {Path}, Method: {Method}",
                correlationId, context.Request.Path, context.Request.Method);
        }
        else
        {
            _logger.LogWarning(exception,
                "Expected exception occurred. Type: {ExceptionType}, CorrelationId: {CorrelationId}, Path: {Path}",
                exception.GetType().Name, correlationId, context.Request.Path);
        }

        var response = new
        {
            error = message,
            statusCode = (int)statusCode,
            correlationId,
            timestamp = DateTime.UtcNow,
            errors = errors
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
