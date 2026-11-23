
using ApiGateway;

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

// Inyección de las rutas desde appsettings.json
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseCors(CorsPolicyName);

app.MapApiGatewayEndpoints();

// Enrutamiento del Gateway
app.MapReverseProxy();

app.Run();
