
using MicroservicioHistorialAcademico;
using MicroservicioHistorialAcademico.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// CORS para el frontend de MetaU
var origenesPermitidos = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendMetaU", policy =>
    {
        policy.WithOrigins(origenesPermitidos)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Servicio principal
builder.Services.AddScoped<
    IHistorialAcademicoService,
    HistorialAcademicoService>();

// Login
builder.Services.AddHttpClient<
    IAuthServiceClient,
    AuthServiceClient>(client =>
    {
        var url = builder.Configuration["Servicios:LoginUrl"];

        if (!string.IsNullOrWhiteSpace(url))
            client.BaseAddress = new Uri(url);
    });

// Expedientes
builder.Services.AddHttpClient<
    IExpedienteServiceClient,
    ExpedienteServiceClient>(client =>
    {
        client.BaseAddress = new Uri(
            builder.Configuration["Servicios:ExpedientesUrl"]
            ?? throw new InvalidOperationException(
                "No se encontro Servicios:ExpedientesUrl"));
    });

// Cursos
builder.Services.AddHttpClient<
    ICursoServiceClient,
    CursoServiceClient>(client =>
    {
        var url = builder.Configuration["Servicios:CursoUrl"];

        if (!string.IsNullOrWhiteSpace(url))
            client.BaseAddress = new Uri(url);
    });

// Notas
builder.Services.AddHttpClient<
    INotasServiceClient,
    NotasServiceClient>(client =>
    {
        client.BaseAddress = new Uri(
            builder.Configuration["Servicios:NotasUrl"]
            ?? throw new InvalidOperationException(
                "No se encontro Servicios:NotasUrl"));
    });

// Matriculas
builder.Services.AddHttpClient<
    IMatriculaServiceClient,
    MatriculaServiceClient>(client =>
    {
        var url = builder.Configuration["Servicios:MatriculaUrl"];

        if (!string.IsNullOrWhiteSpace(url))
            client.BaseAddress = new Uri(url);
    });

// Bitacoras
builder.Services.AddHttpClient<
    IBitacoraServiceClient,
    BitacoraServiceClient>(client =>
    {
        var url = builder.Configuration["Servicios:BitacoraUrl"];

        if (!string.IsNullOrWhiteSpace(url))
            client.BaseAddress = new Uri(url);
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

// CORS antes de procesar los endpoints
app.UseCors("FrontendMetaU");

app.UseHttpsRedirection();

app.MapHistorialAcademicoEndpoints();

app.Run();
