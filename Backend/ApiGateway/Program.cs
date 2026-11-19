
var builder = WebApplication.CreateBuilder(args);

// Inyección de las rutas desde appsettings.json
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapReverseProxy();

app.Run();
