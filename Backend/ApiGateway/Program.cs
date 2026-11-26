
using ApiGateway;
using ApiGateway.Clients;
using ApiGateway.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configuración de las politicas CORS
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

const string CorsPolicyName = "GatewayCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
        }
    });
});

var authBaseUrl = builder.Configuration["MicroservicioLogin:BaseUrl"];

if (string.IsNullOrWhiteSpace(authBaseUrl))
{
    throw new InvalidOperationException("No se ha encontrado MicroservicioLogin:BaseUrl.");
}

authBaseUrl = authBaseUrl.Trim().TrimEnd('/') + "/";

if (!Uri.TryCreate(authBaseUrl, UriKind.Absolute, out var authBaseUri))
{
    throw new InvalidOperationException("La URL configurada en 'MicroservicioLogin:BaseUrl' no es valida.");
}

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    client.BaseAddress = authBaseUri;
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Inyección de las rutas desde appsettings.json
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseCors(CorsPolicyName);

app.UseMiddleware<AuthMiddleware>();

app.MapApiGatewayEndpoints();

// Enrutamiento del Gateway
app.MapReverseProxy();

app.Run();
