using Microsoft.EntityFrameworkCore;
using MicroservicioPreMatriculas;
using MicroservicioPreMatriculas.Repository;
using MicroservicioPreMatriculas.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<PrematriculaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IPrematriculaRepository, PrematriculaRepository>();
builder.Services.AddScoped<IPrematriculaService, PrematriculaService>();

builder.Services.AddHttpClient<IAuthClient, AuthClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:LoginUrl en appsettings.")));

builder.Services.AddHttpClient<IBitacoraClient, BitacoraClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:BitacoraUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:BitacoraUrl en appsettings.")));

builder.Services.AddHttpClient<ICursoClient, CursoClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:CursoUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:CursoUrl en appsettings.")));

builder.Services.AddHttpClient<IPeriodoClient, PeriodoClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Servicios:PeriodoUrl"]
        ?? throw new InvalidOperationException("Falta Servicios:PeriodoUrl en appsettings.")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

PreMatriculasEndpoints.MapearEndpoints(app);

app.Run();
