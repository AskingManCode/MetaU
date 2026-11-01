
import { useState } from 'react';
import historialAcademicoService from '../services/historialAcademicoService';

export default function useHistorialAcademico() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [consultado, setConsultado] = useState(false);

    const limpiarResultados = () => {
        setHistorial([]);
        setError('');
        setConsultado(false);
    };

    const consultar = async (tipoIdentificacion, identificacion) => {
        const tipo = tipoIdentificacion.trim().toUpperCase();
        const numero = identificacion.trim();

        limpiarResultados();

        if (!tipo || !numero) {
            setError('Ingrese el tipo y numero de identificacion');
            return;
        }

        const token = localStorage.getItem('token');
        const usuarioId = localStorage.getItem('usuarioId');

        if (!token || !usuarioId) {
            setError('No hay una sesion valida, inicie sesion nuevamente');
            return;
        }

        setLoading(true);

        try {
            const respuesta = await historialAcademicoService.get({
                tipoIdentificacion: tipo,
                identificacion: numero
            });

            if (!Array.isArray(respuesta.data)) {
                throw new Error('RESPUESTA_INVALIDA');
            }

            setHistorial(respuesta.data);
            setConsultado(true);

        } catch (ex) {
            const estado = ex?.response?.status;
            const mensaje = ex?.response?.data?.mensaje;

            if (estado === 400) {
                setError(
                    mensaje || 'Revise los datos ingresados'
                );
            } else if (estado === 401) {
                setError(
                    'Su sesion expiro o no esta autorizado'
                );
            } else if (estado === 403) {
                setError(
                    'No tiene permisos para realizar esta consulta'
                );
            } else if (estado === 404) {
                setError(
                    mensaje || 'No se encontro el estudiante'
                );
            } else if (ex?.message === 'RESPUESTA_INVALIDA') {
                setError(
                    'El servicio devolvio una respuesta inesperada'
                );
            } else if (!ex?.response) {
                setError(
                    'No fue posible comunicarse con Historial Academico'
                );
            } else {
                setError(
                    'Ocurrio un error al consultar el historial academico'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        historial,
        loading,
        error,
        consultado,
        consultar,
        limpiarResultados
    };
}
