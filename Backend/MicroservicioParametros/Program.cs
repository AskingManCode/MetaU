
using FluentValidation;
using MicroservicioParametros;
using MicroservicioParametros.Repository;
using MicroservicioParametros.Services;
using MicroservicioParametros.Validators;

var builder = WebApplication.CreateBuilder(args);

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (Permite que cualquier origen consuma el API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<ParametrosRequestValidator>();

// Inyección de dependencias
builder.Services.AddSingleton<IDBConnectionFactory, DBConnectionFactory>(); // Solo necesita leer la connection string una vez
builder.Services.AddScoped<IParametroService, ParametroService>();
builder.Services.AddScoped<IParametroRepository, ParametroRepository>();

// Falta agregar microservicios login y bitacora

var app = builder.Build();

// Swagger en todos los ambientes (development/staging/production)
if (app.Environment.IsDevelopment() || app.Environment.IsStaging() || app.Environment.IsProduction())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapParametrosEndpoints();

app.Run();
