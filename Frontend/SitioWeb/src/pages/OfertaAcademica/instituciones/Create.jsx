import { useNavigate } from 'react-router-dom'
import institucionService from '../../../services/institucionService'
import InstitucionForm from './InstitucionForm'

export default function Create() {
    const navigate = useNavigate()

    const guardar = async datos => {
        await institucionService.create(datos)
        navigate('/instituciones', {
            state: {
                mensaje: 'Institución creada correctamente.',
                mostrarUltimaPagina: true
            }
        })
    }

    return (
        <InstitucionForm
            titulo="Nueva institución"
            initial={{ institucionCode: '', nombre: '' }}
            onGuardar={guardar}
            onCancelar={() => navigate('/instituciones')}
        />
    )
}