using MicroservicioCursos;
using MicroservicioCursos.Repository;
using MicroservicioCursos.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

builder.Services.AddScoped<ICursoRepository, CursoRepository>();
builder.Services.AddScoped<ICursoService, CursoService>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException(
            "No se encontro la URL del servicio de login"));
});

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Servicios:BitacorasUrl"]
        ?? throw new InvalidOperationException(
            "No se encontro la URL del servicio de bitacora"));
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapCursosEndpoints();

app.Run();