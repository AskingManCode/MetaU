import { useEffect, useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import Notification from '../../../components/Notification'
import direccionService from '../../../services/direccionService'
import { mensajeError } from '../../../utils/sistemaUtils'

const buttonStyle = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5',
}

const list = value => {
    const data = value?.data ?? value

    return Array.isArray(data)
        ? data
        : data?.items ?? data?.datos ?? data?.data ?? []
}

const provinciaIdOf = item => item?.provinciaID
    ?? item?.ProvinciaID
    ?? item?.id
    ?? item?.ID

const cantonIdOf = item => item?.cantonID
    ?? item?.CantonID
    ?? item?.id
    ?? item?.ID

const distritoIdOf = item => item?.distritoID
    ?? item?.DistritoID
    ?? item?.id
    ?? item?.ID

const nameOf = item => item?.nombre
    ?? item?.Nombre
    ?? item?.descripcion
    ?? item?.Descripcion
    ?? ''

const keyOf = (id, index) => `${id ?? 'sin-id'}-${index}`

const empty = {
    identificacion: '',
    tipoIdentificacion: 'CED',
    email: '',
    nombreCompleto: '',
    fechaNacimiento: '',
    provinciaID: '',
    cantonID: '',
    distritoID: '',
    otrasSenas: '',
    telefonos: [''],
}

const normalize = initial => ({
    ...empty,
    ...initial,
    provinciaID: initial?.provinciaID
        ?? initial?.ProvinciaID
        ?? initial?.direccion?.provinciaID
        ?? initial?.Direccion?.ProvinciaID
        ?? '',
    cantonID: initial?.cantonID
        ?? initial?.CantonID
        ?? initial?.direccion?.cantonID
        ?? initial?.Direccion?.CantonID
        ?? '',
    distritoID: initial?.distritoID
        ?? initial?.DistritoID
        ?? initial?.direccion?.distritoID
        ?? initial?.Direccion?.DistritoID
        ?? '',
    otrasSenas: initial?.otrasSenas
        ?? initial?.OtrasSenas
        ?? initial?.direccion?.otrasSenas
        ?? initial?.Direccion?.OtrasSenas
        ?? '',
    telefonos: (initial?.telefonos ?? initial?.Telefonos ?? [])
        .map(phone => phone?.numero ?? phone?.Numero ?? phone)
        .filter(Boolean),
})

function ExpedienteForm({
    titulo,
    inicial,
    onGuardar,
    onCancelar,
    guardando,
    esEdicion = false,
}) {
    const [datos, setDatos] = useState(() => normalize(inicial))
    const [provincias, setProvincias] = useState([])
    const [cantones, setCantones] = useState([])
    const [distritos, setDistritos] = useState([])
    const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        direccionService.getProvincias()
            .then(response => {
                if (activo) {
                    setProvincias(list(response))
                }
            })
            .catch(error => {
                if (activo) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudieron cargar las provincias'),
                    })
                }
            })
            .finally(() => {
                if (activo) {
                    setCargandoCatalogos(false)
                }
            })

        return () => {
            activo = false
        }
    }, [])

    useEffect(() => {
        if (!datos.provinciaID) {
            setCantones([])
            return undefined
        }

        let activo = true

        direccionService.getCantones(datos.provinciaID)
            .then(response => {
                if (activo) {
                    setCantones(list(response))
                }
            })
            .catch(error => {
                if (activo) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudieron cargar los cantones'),
                    })
                }
            })

        return () => {
            activo = false
        }
    }, [datos.provinciaID])

    useEffect(() => {
        if (!datos.provinciaID || !datos.cantonID) {
            setDistritos([])
            return undefined
        }

        let activo = true

        direccionService.getDistritos(datos.provinciaID, datos.cantonID)
            .then(response => {
                if (activo) {
                    setDistritos(list(response))
                }
            })
            .catch(error => {
                if (activo) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudieron cargar los distritos'),
                    })
                }
            })

        return () => {
            activo = false
        }
    }, [datos.provinciaID, datos.cantonID])

    const change = (field, value) => {
        setDatos(current => ({ ...current, [field]: value }))
    }

    const changeProvincia = event => {
        setDatos(current => ({
            ...current,
            provinciaID: event.target.value,
            cantonID: '',
            distritoID: '',
        }))
    }

    const changeCanton = event => {
        setDatos(current => ({
            ...current,
            cantonID: event.target.value,
            distritoID: '',
        }))
    }

    const submit = event => {
        event.preventDefault()

        onGuardar({
            ...datos,
            identificacion: datos.identificacion.trim(),
            email: datos.email.trim(),
            nombreCompleto: datos.nombreCompleto.trim(),
            otrasSenas: datos.otrasSenas.trim(),
            telefonos: datos.telefonos
                .map(phone => phone.trim())
                .filter(Boolean),
        })
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title={titulo} />

            <div className="d-flex gap-2 mb-3">
                <button
                    type="button"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={buttonStyle}
                    onClick={onCancelar}
                    disabled={guardando}
                    title="Volver al listado"
                    aria-label="Volver al listado"
                >
                    <i className="bi bi-arrow-left fs-5" />
                </button>

                <button
                    type="submit"
                    form="formularioExpediente"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={buttonStyle}
                    disabled={guardando || cargandoCatalogos}
                    title="Guardar"
                    aria-label="Guardar"
                >
                    {guardando
                        ? <Spinner animation="border" size="sm" />
                        : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom py-3">
                    <span className="text-primary fw-semibold">
                        Información del Expediente
                    </span>
                </Card.Header>

                <Card.Body className="p-4">
                    {cargandoCatalogos ? (
                        <div className="text-center">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Form id="formularioExpediente" onSubmit={submit}>
                            <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                                <Row className="g-3">
                                    <Col md={4}>
                                        <Form.Label>Identificación *</Form.Label>
                                        <Form.Control
                                            required
                                            value={datos.identificacion}
                                            readOnly={esEdicion}
                                            className={esEdicion ? 'bg-light' : ''}
                                            onChange={event => change('identificacion', event.target.value)}
                                        />
                                        {esEdicion && (
                                            <Form.Text className="text-muted">
                                                La identificación no se puede modificar.
                                            </Form.Text>
                                        )}
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label>Tipo *</Form.Label>
                                        <Form.Select
                                            required
                                            value={datos.tipoIdentificacion}
                                            onChange={event => change('tipoIdentificacion', event.target.value)}
                                        >
                                            <option value="CED">Cédula</option>
                                            <option value="EXT">Extranjero</option>
                                            <option value="PAS">Pasaporte</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label>Fecha de nacimiento *</Form.Label>
                                        <Form.Control
                                            required
                                            type="date"
                                            value={String(datos.fechaNacimiento ?? '').slice(0, 10)}
                                            onChange={event => change('fechaNacimiento', event.target.value)}
                                        />
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label>Nombre completo *</Form.Label>
                                        <Form.Control
                                            required
                                            value={datos.nombreCompleto}
                                            onChange={event => change('nombreCompleto', event.target.value)}
                                        />
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label>Email cuc.cr *</Form.Label>
                                        <Form.Control
                                            required
                                            type="email"
                                            value={datos.email}
                                            onChange={event => change('email', event.target.value)}
                                        />
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label>Provincia *</Form.Label>
                                        <Form.Select
                                            required
                                            value={datos.provinciaID}
                                            onChange={changeProvincia}
                                        >
                                            <option value="">Seleccione</option>
                                            {provincias.map((item, index) => (
                                                <option
                                                    key={keyOf(provinciaIdOf(item), index)}
                                                    value={provinciaIdOf(item)}
                                                >
                                                    {nameOf(item)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label>Cantón *</Form.Label>
                                        <Form.Select
                                            required
                                            disabled={!datos.provinciaID}
                                            value={datos.cantonID}
                                            onChange={changeCanton}
                                        >
                                            <option value="">Seleccione</option>
                                            {cantones.map((item, index) => (
                                                <option
                                                    key={keyOf(cantonIdOf(item), index)}
                                                    value={cantonIdOf(item)}
                                                >
                                                    {nameOf(item)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label>Distrito *</Form.Label>
                                        <Form.Select
                                            required
                                            disabled={!datos.cantonID}
                                            value={datos.distritoID}
                                            onChange={event => change('distritoID', event.target.value)}
                                        >
                                            <option value="">Seleccione</option>
                                            {distritos.map((item, index) => (
                                                <option
                                                    key={keyOf(distritoIdOf(item), index)}
                                                    value={distritoIdOf(item)}
                                                >
                                                    {nameOf(item)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>

                                    <Col md={8}>
                                        <Form.Label>Otras señas *</Form.Label>
                                        <Form.Control
                                            required
                                            value={datos.otrasSenas}
                                            onChange={event => change('otrasSenas', event.target.value)}
                                        />
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label>Teléfono *</Form.Label>
                                        <Form.Control
                                            required
                                            pattern="[0-9]{8}"
                                            title="Debe contener exactamente 8 dígitos"
                                            value={datos.telefonos[0] ?? ''}
                                            onChange={event => change('telefonos', [event.target.value])}
                                        />
                                    </Col>
                                </Row>
                            </fieldset>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </div>
    )
}

export default ExpedienteForm
