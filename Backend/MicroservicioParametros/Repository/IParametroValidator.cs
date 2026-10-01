using MicroservicioParametros.Entities;

namespace MicroservicioParametros.Repository
{
    public interface IParametroValidator
    {
        void ValidarParametro(ParametroRequest request);
    }
}
