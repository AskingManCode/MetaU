using MicroservicioDirecciones.Repository;
using MicroservicioDirecciones.Services.Clients;

var builder = WebApplication.CreateBuilder(args);

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (Permite que cualquier origen consuma el API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Inyeccion de dependencias
builder.Services.AddSingleton<IDBConnectionFactory, DBConnectionFactory>();
// builder.Services.AddCoped<IDireccionService, DireccionService>();
// builder.Services.AddCoped<IDireccionRepository, DireccionRepository>();

// Auth Service Client
builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioLogin:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioLogin:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

builder.Services.AddScoped<IAuthServiceValidator, AuthServiceValidator>();

// Biracora Service Client
builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var url = builder.Configuration["MicroservicioBitacoras:BaseUrl"];

    if (string.IsNullOrWhiteSpace(url))
        throw new InvalidOperationException("No se configuró 'MicroservicioBitacoras:BaseUrl'");

    client.BaseAddress = new Uri(url);
});

var app = builder.Build();

// Swagger solo en ambiente de desarrollo
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

// app.MapUbicacionesEndpoints();

app.Run();
