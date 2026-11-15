import { useNavigate } from 'react-router-dom'
import carreraService from '../../../services/carreraService'
import CarreraForm from './CarreraForm'

export default function Create() {
    const navigate = useNavigate()

    const guardar = async datos => {
        await carreraService.create(datos)
        navigate('/carreras', {
            state: {
                mensaje: 'Carrera creada correctamente.',
                carreraCode: datos.carreraCode
            }
        })
    }

    return (
        <CarreraForm
            titulo="Nueva carrera"
            onGuardar={guardar}
            onCancelar={() => navigate('/carreras')}
        />
    )
}