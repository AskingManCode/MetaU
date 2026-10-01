using MicroservicioUsuarios;
using MicroservicioUsuarios.Repository;
using MicroservicioUsuarios.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();

builder.Services.AddScoped<IAuthService, AuthServiceMock>();

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>()
    .ConfigureHttpClient(client =>
    {
        var url = builder.Configuration["Servicios:BitacoraUrl"];
        if (!string.IsNullOrWhiteSpace(url))
        {
            client.BaseAddress = new Uri(url);
        }
    });

var app = builder.Build();

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors("ClientApps");
app.MapUsuarioEndpoints();

app.Run();