using MicroservicioNotificaciones;
using MicroservicioNotificaciones.Entities;
using MicroservicioNotificaciones.Repository;
using MicroservicioNotificaciones.Services;
using MicroservicioNotificaciones.Services.Clients;
using FluentValidation;

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
builder.Services.AddValidatorsFromAssemblyContaining<NotificarRequestValidator>();

// Inyección de dependencias
builder.Services.AddSingleton<IDBConnectionFactory, DBConnectionFactory>(); // Solo necesita leer la connection string una vez
builder.Services.AddScoped<INotificacionesService, NotificacionesService>();
builder.Services.AddScoped<INotificacionesRepository, NotificacionesRepository>();

// Auth Service Client
builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioLogin:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioLogin:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

builder.Services.AddScoped<IAuthServiceValidator, AuthServiceValidator>();

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioBitacoras:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioBitacoras:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

// Parametro Service Client
builder.Services.AddHttpClient<IParametroServiceClient, ParametroServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioParametros:BaseUrl"]
              ?? builder.Configuration["Servicios:ParametroUrl"]
              ?? "https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioParametros_MetaU/";

    client.BaseAddress = new Uri(url);
});

var app = builder.Build();

// Swagger solo en ambiente de desarrollo
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapNotificacionesEndpoints();

app.Run();
