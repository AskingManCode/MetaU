import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import prematriculaService from '../../../services/prematriculaService'
import PrematriculaForm from './PrematriculaForm'

const get = (item, ...keys) => (
    keys
        .map(key => item?.[key])
        .find(value => value !== undefined && value !== null)
)

export default function Edit() {
    const { prematriculaId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        prematriculaService.getById(prematriculaId)
            .then(({ data }) => setInitial({
                id: get(data, 'id', 'Id', 'preMatriculaID', 'PreMatriculaID'),
                identificacion: get(data, 'identificacion', 'Identificacion'),
                carreraCode: get(data, 'carreraCode', 'CarreraCode'),
                cursos: get(data, 'cursos', 'Cursos') ?? [],
                periodoID: get(data, 'periodoID', 'PeriodoID'),
                observaciones: get(data, 'observaciones', 'Observaciones') ?? ''
            }))
            .catch(error => setNotification({ type: 'danger', message: error.response?.data?.mensaje ?? 'No se pudo cargar la prematrícula' }))
    }, [prematriculaId])

    const guardar = async datos => {
        try { await prematriculaService.update(prematriculaId, datos); navigate('/prematricula', { state: { mensaje: 'Prematrícula actualizada correctamente' } }) }
        catch (error) { setNotification({ type: 'danger', message: error.response?.data?.mensaje ?? 'No se pudo actualizar la prematrícula' }) }
    }

    return (
        <>
            <Notification
                {...notification}
                show={!!notification}
                onClose={() => setNotification(null)}
            />
            {initial ? (
                <PrematriculaForm
                    title="Editar prematrícula"
                    initial={initial}
                    onSave={guardar}
                    onCancel={() => navigate('/prematricula')}
                />
            ) : (
                <p>Cargando prematrícula...</p>
            )}
        </>
    )
}
