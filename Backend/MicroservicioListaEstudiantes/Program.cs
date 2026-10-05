using MicroservicioListaEstudiantes;
using MicroservicioListaEstudiantes.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddScoped<IListadoEstudiantesService, ListadoEstudiantesService>();

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>()
    .ConfigureHttpClient(c => { var u = builder.Configuration["Servicios:LoginUrl"]; if (!string.IsNullOrWhiteSpace(u)) c.BaseAddress = new Uri(u); });

builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>()
    .ConfigureHttpClient(c => { var u = builder.Configuration["Servicios:BitacoraUrl"]; if (!string.IsNullOrWhiteSpace(u)) c.BaseAddress = new Uri(u); });

builder.Services.AddHttpClient<IGrupoServiceClient, GrupoServiceClient>()
    .ConfigureHttpClient(c => { var u = builder.Configuration["Servicios:GrupoUrl"]; if (!string.IsNullOrWhiteSpace(u)) c.BaseAddress = new Uri(u); });

builder.Services.AddHttpClient<IMatriculaServiceClient, MatriculaServiceClient>()
    .ConfigureHttpClient(c => { var u = builder.Configuration["Servicios:MatriculaUrl"]; if (!string.IsNullOrWhiteSpace(u)) c.BaseAddress = new Uri(u); });

builder.Services.AddHttpClient<ICursoServiceClient, CursoServiceClient>()
    .ConfigureHttpClient(c => { var u = builder.Configuration["Servicios:CursoUrl"]; if (!string.IsNullOrWhiteSpace(u)) c.BaseAddress = new Uri(u); });

builder.Services.AddHttpClient<ICarreraServiceClient, CarreraServiceClient>()
    .ConfigureHttpClient(c => { var u = builder.Configuration["Servicios:CarreraUrl"]; if (!string.IsNullOrWhiteSpace(u)) c.BaseAddress = new Uri(u); });

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

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors("ClientApps");
app.MapListadoEstudiantesEndpoints();

app.Run();