using MicroservicioBitacoras.Entities;
using MicroservicioBitacoras.Repository;

namespace MicroservicioBitacoras.Services
{
    public class BitacoraService : IBitacoraService
    {
        private const string ItemsPagina = "PAGSIZE";
        private const int TamanoPaginaDefecto = 15;

        private readonly IBitacoraRepository _repository;
        private readonly IParametroServiceClient _parametros;

        public BitacoraService(
            IBitacoraRepository repository,
            IParametroServiceClient parametros)
        {
            _repository = repository;
            _parametros = parametros;
        }

        public async Task RegistrarAsync(BitacoraRequest request)
        {
            if (request.Usuario == Guid.Empty)
                throw new ArgumentException("El usuario es requerido");

            if (string.IsNullOrWhiteSpace(request.Descripcion))
                throw new ArgumentException("La descripcion es requerida");

            await _repository.RegistrarAsync(
                request.Usuario, request.Descripcion);
        }

        public Task<IEnumerable<Bitacora>> ObtenerTodosAsync()
        {
            return _repository.ObtenerTodosAsync();
        }

        public async Task<PaginaResultado<Bitacora>> ObtenerPaginadoAsync(
            int pagina, Guid usuario, string token)
        {
            if (pagina < 1)
                throw new ArgumentException(
                    "La pagina debe ser mayor o igual a 1");

            int tamano = TamanoPaginaDefecto;

            try
            {
                var valor = await _parametros.ObtenerValorAsync(
                    ItemsPagina, usuario, token);

                if (int.TryParse(valor, out var configurado) &&
                    configurado > 0)
                {
                    tamano = Math.Min(configurado, TamanoPaginaDefecto);
                }
            }
            catch
            {
                tamano = TamanoPaginaDefecto;
            }

            var todos = (await _repository.ObtenerTodosAsync())
                .OrderByDescending(x => x.FechaBitacora)
                .ThenByDescending(x => x.IdBitacora)
                .ToList();

            long salto = ((long)pagina - 1) * tamano;

            var datos = salto >= todos.Count
                ? new List<Bitacora>()
                : todos.Skip((int)salto).Take(tamano).ToList();

            return new PaginaResultado<Bitacora>
            {
                Pagina = pagina,
                TamanoPagina = tamano,
                TotalRegistros = todos.Count,
                TotalPaginas = (int)Math.Ceiling(
                    todos.Count / (double)tamano),
                Datos = datos
            };
        }
    }
}