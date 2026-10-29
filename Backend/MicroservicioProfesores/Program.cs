
using MicroservicioProfesores;
using MicroservicioProfesores.Repository;
using MicroservicioProfesores.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

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

builder.Services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IProfesorRepository, ProfesorRepository>();
builder.Services.AddScoped<IProfesorService, ProfesorService>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:LoginUrl"];

    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
});

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:BitacoraUrl"];

    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
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

app.MapProfesoresEndpoints();

app.Run();
