# Seguridad

- El frontend no almacena contraseñas ni incorpora secretos; `API_URL` es configuración pública runtime.
- El JWT viaja en `Authorization: Bearer` por interceptor y la sesión se elimina al expirar o recibir 401.
- La autorización definitiva pertenece al backend; ocultar botones no sustituye sus controles.
- Las vistas previas usan blobs autenticados y revocan sus object URLs al cerrar.
- Reportar vulnerabilidades en privado y no adjuntar tokens o datos personales a Issues.

La política CSP estricta queda pendiente de validar junto con el dominio definitivo y las dependencias de estilos.
