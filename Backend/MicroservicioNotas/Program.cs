using Microsoft.EntityFrameworkCore;
using MicroservicioNotas;
using MicroservicioNotas.Repository;
using MicroservicioNotas.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<NotaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MatriculaDb")));

builder.Services.AddScoped<INotaRepository, NotaRepository>();
builder.Services.AddScoped<INotaService, NotaService>();

builder.Services.AddHttpClient<IAuthClient, AuthClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:LoginUrl en appsettings.")));

builder.Services.AddHttpClient<IBitacoraClient, BitacoraClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:BitacoraUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:BitacoraUrl en appsettings.")));

builder.Services.AddHttpClient<IGrupoClient, GrupoClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:GrupoUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:GrupoUrl en appsettings.")));

builder.Services.AddHttpClient<IExpedienteClient, ExpedienteClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:ExpedienteUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:ExpedienteUrl en appsettings.")));

builder.Services.AddHttpClient<IParametroClient, ParametroClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:ParametroUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:ParametroUrl en appsettings.")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

NotasEndpoints.MapearEndpoints(app);

app.Run();
