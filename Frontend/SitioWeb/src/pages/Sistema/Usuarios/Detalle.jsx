import { useEffect, useState } from 'react'
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader'
import rolService from '../../../services/rolService'
import usuarioService from '../../../services/usuarioService'
import { mensajeError, normalizarRol } from '../../../utils/sistemaUtils'
import { formatearFecha, nombreTipo, normalizarUsuario } from '../../../utils/usuarioUtils'

function Campo({ etiqueta, valor }) {
    return (
        <Col md={6}>
            <div className="text-muted small">{etiqueta}</div>
            <div className="fw-semibold">{valor || '-'}</div>
        </Col>
    )
}

function Detalle() {
    const { email } = useParams()
    const navigate = useNavigate()

    const [usuario, setUsuario] = useState(null)
    const [nombreRol, setNombreRol] = useState('')
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)

    useEffect(() => {
        let activo = true

        usuarioService.getByEmail(email)
            .then(async ({ data }) => {
                const encontrado = normalizarUsuario(data)

                if (!activo) return
                setUsuario(encontrado)

                try {
                    const { data: rol } = await rolService.getById(encontrado.idRol)
                    if (activo) setNombreRol(normalizarRol(rol).nombre)
                } catch {
                    if (activo) setNombreRol(encontrado.idRol)
                }
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudo cargar el usuario'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [email])

    return (
        <div>
            <PageHeader title="Detalle del Usuario" />

            {cargando ? (
                <div className="text-center p-4">
                    <Spinner animation="border" />
                    <p className="text-muted mt-2">Cargando usuario...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/usuarios')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="d-flex gap-2 mb-3">
                        <Button variant="outline-secondary" onClick={() => navigate('/usuarios')}>
                            <i className="bi bi-arrow-left me-2" />
                            Volver
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate(`/usuarios/editar/${encodeURIComponent(usuario.email)}`)}
                        >
                            <i className="bi bi-pencil-square me-2" />
                            Editar
                        </Button>
                    </div>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light border-bottom py-3">
                            <span className="text-primary fw-semibold">Informacion del Usuario</span>
                        </Card.Header>

                        <Card.Body className="p-3">
                            <Row className="g-3">
                                <Campo etiqueta="Email (ID)" valor={usuario.email} />
                                <Campo etiqueta="Rol" valor={nombreRol} />
                                <Campo etiqueta="Tipo de identificacion" valor={nombreTipo(usuario.tipoIdentificacion)} />
                                <Campo etiqueta="Identificacion" valor={usuario.identificacion} />
                                <Campo etiqueta="Nombre completo" valor={usuario.nombre} />
                                <Campo etiqueta="Estado" valor={usuario.estado ? 'Activo' : 'Inactivo'} />
                                <Campo etiqueta="Ultima modificacion" valor={formatearFecha(usuario.fechaModificacion)} />
                            </Row>
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    )
}

export default Detalle