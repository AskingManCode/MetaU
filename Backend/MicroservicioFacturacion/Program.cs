using FluentValidation;
using MicroservicioFacturacion;
using MicroservicioFacturacion.Repository;
using MicroservicioFacturacion.Services;
using MicroservicioFacturacion.Services.Clients;
using MicroservicioFacturacion.Validators;

var builder = WebApplication.CreateBuilder(args);

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var origenesPermitidos = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy.WithOrigins(origenesPermitidos)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<FacturacionRequestValidator>();

// Inyección de dependencias
builder.Services.AddSingleton<IDBConnectionFactory, DBConnectionFactory>();
builder.Services.AddScoped<IFacturacionService, FacturacionService>();
builder.Services.AddScoped<IFacturacionRepository, FacturacionRepository>();

// Auth Service Client
builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioLogin:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioLogin:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

builder.Services.AddScoped<IAuthServiceValidator, AuthServiceValidator>();

// Bitácora Service Client
builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioBitacoras:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioBitacoras:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

// Matrículas Service Client
builder.Services.AddHttpClient<IMatriculaServiceClient, MatriculaServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioMatriculas:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioMatriculas:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

// Periodos Service Client
builder.Services.AddHttpClient<IPeriodoServiceClient, PeriodoServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioPeriodos:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioPeriodos:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

// Parametros Service Client
builder.Services.AddHttpClient<IParametroServiceClient, ParametroServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioParametros:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioParametros:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

var app = builder.Build();

// Swagger solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapFacturacionEndpoints();

app.Run();