using MicroservicioBitacoras;
using MicroservicioBitacoras.Repository;
using MicroservicioBitacoras.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IBitacoraRepository, BitacoraRepository>();
builder.Services.AddScoped<IBitacoraService, BitacoraService>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var loginUrl = builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("No se encontro la URL del servicio de login");

    client.BaseAddress = new Uri(loginUrl);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.MapBitacorasEndpoints();

app.Run();