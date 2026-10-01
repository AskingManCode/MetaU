using MicroservicioProfesores;
using MicroservicioProfesores.Repository;
using MicroservicioProfesores.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

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

app.MapProfesoresEndpoints();

app.Run();