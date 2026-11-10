import { useEffect, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import '../../styles/Login.css';

const allowedDomains = (
    import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || 'cuc.cr,cuc.ac.cr'
)
    .split(',')
    .map((domain) => domain.trim().replace(/^@/, '').toLowerCase())
    .filter(Boolean);

function validateForm(email, password) {
    const errors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
        errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        errors.email = 'Ingresa un correo electrónico válido.';
    } else {
        const domain = normalizedEmail.split('@').pop().toLowerCase();
        if (!allowedDomains.includes(domain)) {
            errors.email = `El correo debe pertenecer a uno de estos dominios: ${allowedDomains.join(', ')}.`;
        }
    }

    if (!password) errors.password = 'La contraseña es obligatoria.';
    return errors;
}

function getLoginError(error) {
    if (error.response?.status === 401) {
        return 'Usuario y/o contraseña incorrectos';
    }

    const responseMessage = error.response?.data?.mensaje ?? error.response?.data?.message;
    if (responseMessage) return responseMessage;
    if (!error.response) {
        return 'No se pudo conectar con el servicio. Verifica tu conexión e inténtalo nuevamente.';
    }
    return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
}

export default function Login() {
    const navigate = useNavigate();
    const { status, isAuthenticated, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate('/', { replace: true });
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validateForm(email, password);
        setErrors(validationErrors);
        setFormError('');
        if (Object.keys(validationErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            await login(email.trim(), password, rememberMe);
            navigate('/', { replace: true });
        } catch (error) {
            setFormError(getLoginError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <main className="login-page">
                <div className="d-flex align-items-center gap-2" role="status">
                    <Spinner animation="border" size="sm" />
                    <span>Validando sesión...</span>
                </div>
            </main>
        );
    }

    return (
        <main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <div className="login-brand">
                    <img src={logo} alt="Meta U" className="login-logo" />
                    <div>
                        <p className="login-eyebrow">Portal administrativo</p>
                        <h1 id="login-title">Iniciar sesión</h1>
                    </div>
                </div>

                <p className="login-description">
                    Ingresa con tu cuenta institucional para continuar.
                </p>

                {formError && (
                    <div className="alert alert-danger" role="alert">
                        {formError}
                    </div>
                )}

                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="login-email">
                        <Form.Label>Correo electrónico</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setErrors((current) => ({ ...current, email: '' }));
                            }}
                            autoComplete="username"
                            placeholder="nombre@cuc.cr"
                            isInvalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'login-email-error' : undefined}
                            disabled={isSubmitting}
                        />
                        <Form.Control.Feedback id="login-email-error" type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="login-password">
                        <Form.Label>Contraseña</Form.Label>
                        <div className="login-password-control">
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setErrors((current) => ({ ...current, password: '' }));
                                }}
                                autoComplete="current-password"
                                placeholder="Ingresa tu contraseña"
                                isInvalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'login-password-error' : undefined}
                                disabled={isSubmitting}
                            />
                            <Button
                                type="button"
                                variant="link"
                                className="login-password-toggle"
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                aria-pressed={showPassword}
                                disabled={isSubmitting}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                            </Button>
                        </div>
                        {errors.password && (
                            <div id="login-password-error" className="invalid-feedback d-block">
                                {errors.password}
                            </div>
                        )}
                    </Form.Group>

                    <Form.Check
                        id="login-remember"
                        type="checkbox"
                        label="Recordarme"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="mb-4"
                        disabled={isSubmitting}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100 login-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Iniciando sesión...
                            </>
                        ) : 'Iniciar sesión'}
                    </Button>
                </Form>
            </section>
        </main>
    );
}