using FluentValidation;
using MicroservicioPagos;
using MicroservicioPagos.Entities.DTOs;
using MicroservicioPagos.Repository;
using MicroservicioPagos.Services;
using MicroservicioPagos.Services.Clients;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddValidatorsFromAssemblyContaining<PagoRequestValidator>();

builder.Services.AddSingleton<IDBConnectionFactory, DBConnectionFactory>();
builder.Services.AddScoped<IPagosService, PagosService>();
builder.Services.AddScoped<IPagosRepository, PagosRepository>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioLogin:BaseUrl"];
    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioLogin:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

builder.Services.AddScoped<IAuthServiceValidator, AuthServiceValidator>();

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioBitacoras:BaseUrl"];
    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioBitacoras:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapPagosEndpoints();

app.Run();
