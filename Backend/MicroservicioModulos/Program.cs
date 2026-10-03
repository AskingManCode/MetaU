using MicroservicioModulos;
using MicroservicioModulos.Repository;
using MicroservicioModulos.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<ModuloRepository>();
builder.Services.AddScoped<IModuloService, ModuloService>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>()
    .ConfigureHttpClient(client =>
    {
        var url = builder.Configuration["Servicios:LoginUrl"];
        if (!string.IsNullOrWhiteSpace(url)) client.BaseAddress = new Uri(url);
    });

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>()
    .ConfigureHttpClient(client =>
    {
        var url = builder.Configuration["Servicios:BitacoraUrl"];
        if (!string.IsNullOrWhiteSpace(url)) client.BaseAddress = new Uri(url);
    });

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        await context.Response.WriteAsJsonAsync(new { message = feature?.Error.Message ?? "Error interno del servidor" });
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapModuloEndpoints();

app.Run();