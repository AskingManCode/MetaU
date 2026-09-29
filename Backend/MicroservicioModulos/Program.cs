using MicroservicioModulos;
using MicroservicioModulos.Repository;
using MicroservicioModulos.Services;
using MicroservicioRoles;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Inyección de dependencias
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<ModuloRepository>();
builder.Services.AddScoped<ModuloService>();

builder.Services.AddScoped<IAuthService, AuthServiceMock>();
builder.Services.AddScoped<IBitacoraService, BitacoraServiceMock>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapModuloEndpoints();

app.Run();