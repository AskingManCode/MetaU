
using MicroservicioBitacoras;
using MicroservicioBitacoras.Repository;
using MicroservicioBitacoras.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IBitacoraRepository, BitacoraRepository>();
builder.Services.AddScoped<IBitacoraService, BitacoraService>();

var origenesPermitidos = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendReact", policy =>
    {
        policy.WithOrigins(origenesPermitidos)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var loginUrl = builder.Configuration["Servicios:LoginUrl"]
        ?? throw new InvalidOperationException("No se encontro la URL del servicio de login");

    client.BaseAddress = new Uri(loginUrl);
});

builder.Services.AddHttpClient<IParametroServiceClient, ParametroServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:ParametroUrl"];

    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("FrontendReact");

app.MapBitacorasEndpoints();

app.Run();
