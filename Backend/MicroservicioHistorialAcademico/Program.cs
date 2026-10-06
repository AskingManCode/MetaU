using MicroservicioHistorialAcademico;
using MicroservicioHistorialAcademico.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddScoped<IHistorialAcademicoService, HistorialAcademicoService>();


builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:LoginUrl"];

    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
});

builder.Services.AddHttpClient<IExpedienteServiceClient, ExpedienteServiceClient>(cliente =>
{
    cliente.BaseAddress = new Uri(
        builder.Configuration["Servicios:ExpedientesUrl"]
        ?? throw new InvalidOperationException(
            "No se encontro la configuracion Servicios:ExpedientesUrl"));
});
builder.Services.AddHttpClient<ICursoServiceClient, CursoServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:CursoUrl"];
    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
});
builder.Services.AddHttpClient<INotasServiceClient, NotasServiceClient>(cliente =>
{
    cliente.BaseAddress = new Uri(
        builder.Configuration["Servicios:NotasUrl"]
        ?? throw new InvalidOperationException(
            "No se encontro la configuracion Servicios:NotasUrl"));
});

builder.Services.AddHttpClient<IMatriculaServiceClient, MatriculaServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:MatriculasUrl"];

    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
});
builder.Services.AddHttpClient<IBitacoraServiceClient, BitacoraServiceClient>(client =>
{
    var url = builder.Configuration["Servicios:BitacoraUrl"];

    if (!string.IsNullOrWhiteSpace(url))
        client.BaseAddress = new Uri(url);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

app.MapHistorialAcademicoEndpoints();

app.Run();