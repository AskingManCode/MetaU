# Aplicación móvil Meta U

Cliente Flutter para estudiantes. La aplicación conserva la plantilla MOB0 y
requiere una base HTTPS del API Gateway para iniciar sesión y cargar el resumen
de Inicio.

## Configuración

Proporcione la URL base del Gateway como parámetro de compilación; no la
almacene en el código:

```powershell
flutter run --dart-define="API_BASE_URL=https://<host>/<base-del-Gateway>"
```

El dominio estudiantil se puede configurar con `STUDENT_EMAIL_DOMAIN`. Si se
omite, se utiliza `cuc.cr`:

```powershell
flutter run --dart-define="API_BASE_URL=https://<host>/<base-del-Gateway>" --dart-define=STUDENT_EMAIL_DOMAIN=cuc.cr
```

`API_BASE_URL` debe ser HTTPS y no debe incluir rutas de endpoint. La aplicación
agrega las rutas públicas del Gateway y no contiene URLs privadas ni
credenciales.

## Sesión

Los tokens y datos mínimos de sesión se guardan mediante
`flutter_secure_storage`. Con “Recordarme” desactivado, no se restaura la sesión
al iniciar nuevamente la aplicación; al cerrar sesión se eliminan siempre los
datos guardados.

## Desarrollo

```powershell
flutter pub get
flutter analyze
flutter test
```
