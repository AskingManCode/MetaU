using System.Text;
using Microsoft.EntityFrameworkCore;
using MicroservicioLogin.Repository;
using MicroservicioLogin.Services;
using MicroservicioLogin;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("LoginDb");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Configure ConnectionStrings:LoginDb antes de iniciar el microservicio.");
}

builder.Services.AddDbContext<LoginDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection("Jwt"))
    .Validate(options =>
        Encoding.UTF8.GetByteCount(options.ClaveSecreta) >= 32 &&
        !string.IsNullOrWhiteSpace(options.Issuer) &&
        !string.IsNullOrWhiteSpace(options.Audience),
        "La configuración Jwt requiere una clave de al menos 32 bytes, Issuer y Audience.")
    .ValidateOnStart();

builder.Services.AddOpenApi();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

LoginEndpoints.MapearEndpoints(app);

app.Run();
