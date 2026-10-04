using MicroservicioCarreras;
using MicroservicioCarreras.Repository;
using MicroservicioCarreras.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<ICarreraRepository, CarreraRepository>();
builder.Services.AddScoped<ICarreraService, CarreraService>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var loginUrl = builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("No se encontro la URL del servicio de login");
    client.BaseAddress = new Uri(loginUrl);
});

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var bitacorasUrl = builder.Configuration["Servicios:BitacorasUrl"]
        ?? throw new InvalidOperationException("No se encontro la URL del servicio de bitacoras");
    client.BaseAddress = new Uri(bitacorasUrl);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.MapCarrerasEndpoints();

app.Run();
