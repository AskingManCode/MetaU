import { useEffect, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Notification from '../../components/Notification'
import PageHeader from '../../components/PageHeader'
import miPerfilService from '../../services/miPerfilService'

const POLICY_DEFAULTS = {
    minimumLength: 8,
    requireComplexity: true
}

const initialPasswordForm = {
    current: '',
    next: '',
    confirmation: ''
}

const normalizeProfile = (data, fallbackEmail) => ({
    usuarioId: data?.usuarioId ?? data?.UsuarioId ?? '',
    rolCode: data?.rolCode ?? data?.RolCode ?? '',
    tipoIdentificacionCode:
        data?.tipoIdentificacionCode ?? data?.TipoIdentificacionCode ?? '',
    identificacion: data?.identificacion ?? data?.Identificacion ?? '',
    nombreCompleto: data?.nombreCompleto ?? data?.NombreCompleto ?? '',
    email: data?.email ?? data?.Email ?? fallbackEmail,
    estado: data?.estado ?? data?.Estado ?? '',
    fechaModificacion: data?.fechaModificacion ?? data?.FechaModificacion ?? ''
})

const activeParameterValue = data => {
    const active = data?.estado ?? data?.Estado
    if (active === false) return null
    return data?.valor ?? data?.Valor ?? null
}

const getPolicy = async () => {
    const [minimumLengthResult, complexityResult] = await Promise.allSettled([
        miPerfilService.getParametro('PWDMINLEN'),
        miPerfilService.getParametro('PWDCOMPLEX')
    ])
    const policy = { ...POLICY_DEFAULTS }

    if (minimumLengthResult.status === 'fulfilled') {
        const value = Number(activeParameterValue(minimumLengthResult.value.data))
        if (Number.isInteger(value) && value > 0) {
            policy.minimumLength = value
        }
    }

    if (complexityResult.status === 'fulfilled') {
        const value = activeParameterValue(complexityResult.value.data)
        if (value === '1' || value === 1) policy.requireComplexity = true
        if (value === '0' || value === 0) policy.requireComplexity = false
    }

    return policy
}

const passwordRequirements = (password, current, confirmation, policy) => [
    {
        label: `Al menos ${policy.minimumLength} caracteres`,
        met: password.length >= policy.minimumLength
    },
    ...(policy.requireComplexity
        ? [
            { label: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
            { label: 'Al menos una minúscula', met: /[a-z]/.test(password) },
            { label: 'Al menos un dígito', met: /\d/.test(password) },
            {
                label: 'Al menos un símbolo',
                met: [...password].some(character =>
                    !/[\p{L}\p{N}\s]/u.test(character)
                )
            }
        ]
        : [{ label: 'No se requiere complejidad', met: true }]),
    {
        label: 'Distinta de la contraseña actual',
        met: Boolean(password) && password !== current
    },
    {
        label: 'La confirmación coincide',
        met: Boolean(confirmation) && password === confirmation
    }
]

const getErrorMessage = (error, fallback) => {
    if (error.response?.status === 500) {
        return 'Ocurrió un error interno. Inténtelo de nuevo más tarde.'
    }

    if ([400, 404, 409].includes(error.response?.status)) {
        return error.response.data?.mensaje || error.response.data?.message || fallback
    }

    return error.response?.data?.mensaje || error.response?.data?.message || fallback
}

const formatDate = value => {
    if (!value) return 'No disponible'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export default function Perfil() {
    const navigate = useNavigate()
    const [session, setSession] = useState(() => miPerfilService.readSession())
    const email = session.email || ''
    const usuarioId = session.usuarioId || ''
    const [perfil, setPerfil] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [profileError, setProfileError] = useState('')
    const [policy, setPolicy] = useState(POLICY_DEFAULTS)
    const [policyLoaded, setPolicyLoaded] = useState(false)
    const [passwordForm, setPasswordForm] = useState(initialPasswordForm)
    const [savingPassword, setSavingPassword] = useState(false)
    const [passwordChanged, setPasswordChanged] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let mounted = true

        const loadProfile = async () => {
            if (!email) {
                setProfileError('No se encontró el correo de la sesión.')
                setLoadingProfile(false)
                return
            }

            try {
                const { data } = await miPerfilService.getPerfil(email)
                if (mounted) {
                    setPerfil({
                        ...normalizeProfile(data, email),
                        usuarioId,
                        email
                    })
                }
            } catch (error) {
                if (mounted) {
                    setProfileError(getErrorMessage(error, 'No se pudo cargar el perfil.'))
                }
            } finally {
                if (mounted) setLoadingProfile(false)
            }
        }

        loadProfile()
        return () => {
            mounted = false
        }
    }, [email, usuarioId])

    useEffect(() => {
        let mounted = true

        getPolicy().then(value => {
            if (mounted) {
                setPolicy(value)
                setPolicyLoaded(true)
            }
        })

        return () => {
            mounted = false
        }
    }, [])

    const requirements = passwordRequirements(
        passwordForm.next,
        passwordForm.current,
        passwordForm.confirmation,
        policy
    )
    const allRequirementsMet = requirements.every(requirement => requirement.met)

    const logout = () => {
        if (session.token && session.usuarioId) {
            void miPerfilService.registerLogout(session.usuarioId, session.token)
                .catch(error => console.error(
                    'No se pudo registrar la bitácora de logout.',
                    error
                ))
        }

        miPerfilService.clearLocalSession()
        navigate('/login', { replace: true })
    }

    const updatePasswordField = event => {
        const { name, value } = event.target
        setPasswordForm(current => ({ ...current, [name]: value }))
    }

    const handlePasswordChange = async event => {
        event.preventDefault()

        if (!perfil || !session) {
            setNotification({ type: 'error', message: 'No se pudo leer la sesión activa.' })
            return
        }

        if (!policyLoaded) {
            setNotification({
                type: 'info',
                message: 'Espere a que se cargue la política de contraseñas.'
            })
            return
        }

        if (!passwordForm.current) {
            setNotification({ type: 'error', message: 'Ingrese la contraseña actual.' })
            return
        }

        if (!allRequirementsMet) {
            setNotification({
                type: 'error',
                message: 'La nueva contraseña no cumple todos los requisitos.'
            })
            return
        }

        setSavingPassword(true)
        setNotification(null)

        try {
            const { data: authenticatedSession } = await miPerfilService.verifyPassword(
                perfil.email,
                passwordForm.current
            )

            miPerfilService.saveTokens(authenticatedSession, session)
            setSession(miPerfilService.readSession())

            await miPerfilService.actualizarContrasena(perfil.email, {
                email: perfil.email,
                tipoIdentificacion: perfil.tipoIdentificacionCode,
                identificacion: perfil.identificacion,
                nombre: perfil.nombreCompleto,
                idRol: perfil.rolCode,
                contrasena: passwordForm.next
            })

            setPasswordForm(initialPasswordForm)
            setPasswordChanged(true)
            setNotification({
                type: 'success',
                message: 'Contraseña actualizada correctamente'
            })
        } catch (error) {
            const message = error.response?.status === 401 &&
                error.config?.url?.endsWith('/login')
                ? 'La contraseña actual es incorrecta'
                : error.response
                    ? getErrorMessage(error, 'No se pudo actualizar la contraseña.')
                    : error.message?.startsWith('La respuesta')
                        ? error.message
                        : 'No se pudo actualizar la contraseña.'
            setNotification({ type: 'error', message })
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={Boolean(notification)}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Mi Perfil" />

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                    <h2 className="h6 mb-0">Ver perfil</h2>
                </div>
                <div className="card-body">
                    {loadingProfile ? (
                        <div className="d-flex align-items-center gap-2" role="status">
                            <Spinner size="sm" />
                            <span>Cargando perfil...</span>
                        </div>
                    ) : profileError ? (
                        <Alert variant="danger" className="mb-0">{profileError}</Alert>
                    ) : (
                        <div className="row g-3">
                            <ReadOnlyField label="Nombre completo" value={perfil.nombreCompleto} />
                            <ReadOnlyField label="Email" value={perfil.email} />
                            <ReadOnlyField label="Usuario ID" value={perfil.usuarioId} />
                            <ReadOnlyField label="Rol" value={perfil.rolCode} />
                            <ReadOnlyField
                                label="Tipo de identificación"
                                value={perfil.tipoIdentificacionCode}
                            />
                            <ReadOnlyField
                                label="Número de identificación"
                                value={perfil.identificacion}
                            />
                            <ReadOnlyField
                                label="Última modificación"
                                value={formatDate(perfil.fechaModificacion)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                    <h2 className="h6 mb-0">Cambiar contraseña</h2>
                </div>
                <div className="card-body">
                    <Form onSubmit={handlePasswordChange}>
                        <Form.Group className="mb-3" controlId="currentPassword">
                            <Form.Label>Contraseña actual</Form.Label>
                            <Form.Control
                                type="password"
                                name="current"
                                autoComplete="current-password"
                                value={passwordForm.current}
                                onChange={updatePasswordField}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="newPassword">
                            <Form.Label>Nueva contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="next"
                                autoComplete="new-password"
                                value={passwordForm.next}
                                onChange={updatePasswordField}
                                minLength={policy.minimumLength}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="confirmPassword">
                            <Form.Label>Confirmar nueva contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmation"
                                autoComplete="new-password"
                                value={passwordForm.confirmation}
                                onChange={updatePasswordField}
                                required
                            />
                        </Form.Group>

                        <div className="mb-3" aria-live="polite">
                            <div className="fw-semibold small mb-1">
                                Requisitos de la contraseña
                                {!policyLoaded && ' (cargando configuración...)'}
                            </div>
                            <ul className="list-unstyled mb-0 small">
                                {requirements.map(requirement => (
                                    <li
                                        key={requirement.label}
                                        className={requirement.met ? 'text-success' : 'text-danger'}
                                    >
                                        <i
                                            className={`bi ${requirement.met
                                                ? 'bi-check-circle-fill'
                                                : 'bi-x-circle-fill'} me-2`}
                                            aria-hidden="true"
                                        />
                                        {requirement.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    savingPassword ||
                                    loadingProfile ||
                                    Boolean(profileError) ||
                                    !policyLoaded
                                }
                            >
                                {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
                            </Button>
                            {passwordChanged && (
                                <Button variant="outline-primary" onClick={logout}>
                                    Cerrar sesión y volver a iniciar
                                </Button>
                            )}
                        </div>
                    </Form>
                </div>
            </div>

            <Button variant="outline-danger" onClick={logout}>
                Cerrar sesión en este dispositivo
            </Button>
        </div>
    )
}

function ReadOnlyField({ label, value }) {
    return (
        <div className="col-md-6">
            <Form.Group>
                <Form.Label>{label}</Form.Label>
                <Form.Control value={value ?? ''} readOnly />
            </Form.Group>
        </div>
    )
}