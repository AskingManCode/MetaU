using Microsoft.EntityFrameworkCore;
using MicroservicioMatriculas;
using MicroservicioMatriculas.Repository;
using MicroservicioMatriculas.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<MatriculaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IMatriculaRepository, MatriculaRepository>();
builder.Services.AddScoped<IMatriculaService, MatriculaService>();

builder.Services.AddHttpClient<IAuthClient, AuthClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:LoginUrl en appsettings.")));

builder.Services.AddHttpClient<IBitacoraClient, BitacoraClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:BitacoraUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:BitacoraUrl en appsettings.")));

builder.Services.AddHttpClient<ICursoClient, CursoClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:CursoUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:CursoUrl en appsettings.")));

builder.Services.AddHttpClient<IGrupoClient, GrupoClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:GrupoUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:GrupoUrl en appsettings.")));

builder.Services.AddHttpClient<IPeriodoClient, PeriodoClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:PeriodoUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:PeriodoUrl en appsettings.")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

MatriculasEndpoints.MapearEndpoints(app);

app.Run();
