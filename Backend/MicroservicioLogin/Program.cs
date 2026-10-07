using MicroservicioLogin;
using MicroservicioLogin.Database;
using MicroservicioLogin.Repository;
using MicroservicioLogin.Services;

var builder = WebApplication.CreateBuilder(args);

// Conexion a Usuarios_DB (SQL crudo via Dapper, sin EF Core, sin migraciones)
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

// Configuracion del JWT (seccion "Jwt" de appsettings.json)
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// Cada interfaz con su unica implementacion concreta (DIP)
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<IRefreshTokenHasher, Sha256RefreshTokenHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapLoginEndpoints();



app.Run();
