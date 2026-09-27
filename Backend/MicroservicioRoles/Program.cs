using MicroservicioRoles;
using MicroservicioRoles.Repository;
using MicroservicioRoles.Services;

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

//Aqui se hace la inyecciuon de dependecias 
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<RolRepository>();
builder.Services.AddScoped<IRolService, RolService>();

//Esto se va a remplazart cuando ya este el login es olo para la prueba 
builder.Services.AddScoped<IAuthService, AuthServiceMock>();
builder.Services.AddScoped<IBitacoraService, BitacoraServiceMock>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("ClientApps");

app.MapRolEndpoints();

app.Run();