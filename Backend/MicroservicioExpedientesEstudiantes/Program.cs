using Microsoft.EntityFrameworkCore;
using MicroservicioExpedientesEstudiantes;
using MicroservicioExpedientesEstudiantes.Repository;
using MicroservicioExpedientesEstudiantes.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<ExpedienteDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MatriculaDb")));

builder.Services.AddScoped<IExpedienteRepository, ExpedienteRepository>();
builder.Services.AddScoped<IExpedienteService, ExpedienteService>();

builder.Services.AddHttpClient<IAuthClient, AuthClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:LoginUrl en appsettings.")));

builder.Services.AddHttpClient<IBitacoraClient, BitacoraClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:BitacoraUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:BitacoraUrl en appsettings.")));

builder.Services.AddHttpClient<IParametroClient, ParametroClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:ParametroUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:ParametroUrl en appsettings.")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

ExpedientesEstudiantesEndpoints.MapearEndpoints(app);

app.Run();
