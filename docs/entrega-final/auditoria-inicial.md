# Auditoría inicial de PatrocinApp

Fecha de auditoría: 2026-07-13  
Alcance: backend Spring Boot y frontend Angular existentes.  
Estado del documento: diagnóstico previo a cambios funcionales.

## Punto de control Git

| Proyecto | Ruta efectiva | Rama principal real | Estado inicial | Remoto verificado | Respaldo local |
|---|---|---|---|---|---|
| Backend | `C:\Users\marco\Escritorio\patrocinapp-backend` | `master` | Limpio, alineado con `origin/master` | `MarcosHV0106/patrocinapp-backend.git` | `respaldo/pre-entrega-final-20260713` |
| Frontend | `C:\Users\marco\Escritorio\patrocinapp-frontend\patrocinapp-frontend` | `main` | Limpio, alineado con `origin/main` | `MarcosHV0106/patrocinapp-frontend.git` | `respaldo/pre-entrega-final-20260713` |

Se creó la rama local `desarrollo` desde la rama principal real de cada repositorio. No se realizó `push`, despliegue, reescritura de historial ni modificación de autoría. La única identidad Git observada y activa es `MarcosHV0106 <marcoshv2005@gmail.com>`; la documentación de equipo no debe atribuirle a terceros cambios que todavía no realizaron.

## Estado actual del backend

El backend usa Java 21 como nivel de compilación, Spring Boot 3.5.16, Spring Web, Security, Data JPA, PostgreSQL, JJWT, Lombok y springdoc. La organización sí refleja una arquitectura hexagonal inicial:

- `domain`: modelos, estados, puertos de entrada/salida y servicio de codificación.
- `application`: DTO y casos de uso.
- `infrastructure`: seguridad, configuración, entidades JPA, repositorios, adaptadores y mapeadores.
- `interfaces`: controladores REST.
- `shared`: respuesta común y manejo de excepciones.

### Funcionalidades existentes

- Registro de negocio y deportista con BCrypt.
- Inicio de sesión y emisión de JWT.
- Catálogo público de deportistas y plantillas.
- Creación transaccional de contratos, metas y fondo de garantía.
- Listado de contratos por negocio o deportista.
- Registro legado de evidencia mediante URL.
- Aprobación simple de una meta, descuento del fondo y creación de transacción.
- Swagger/OpenAPI básico y CORS para orígenes locales.

### Inventario de endpoints encontrado

| Método | Ruta | Acceso actual | Observación |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Credenciales y JWT. |
| POST | `/api/usuarios/negocios` | Público | Registro de negocio. |
| POST | `/api/usuarios/deportistas` | Público | Registro de deportista. |
| GET | `/api/deportistas` | Público | Filtros `busqueda` y `disciplina`. |
| GET | `/api/plantillas` | Público | Catálogo de metas. |
| POST | `/api/contratos` | Solo autenticación | Confía en `idNegocio` enviado por el cliente. |
| GET | `/api/contratos/negocio/{id}` | Solo autenticación | No valida rol ni propiedad. |
| GET | `/api/contratos/deportista/{id}` | Solo autenticación | No valida rol ni propiedad. |
| PUT | `/api/metas/{id}/evidencia` | Solo autenticación | Solo URL; no valida propietario ni estado. |
| POST | `/api/metas/{id}/aprobar` | Solo autenticación | No valida negocio propietario, estado, saldo ni duplicidad. |

### Modelo y estados encontrados

- Contrato: `PENDIENTE`, `ACTIVO`, `FINALIZADO`, `CANCELADO`.
- Meta: `PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `PAGADA`.
- Entidades persistidas: usuario, perfiles, plantilla, contrato, meta, fondo y transacción.
- La evidencia no es una entidad independiente: `url_evidencia` y `comentario_deportista` están en `metas_contrato`.
- El fondo solo conserva `monto_congelado`; no diferencia monto inicial, retenido y liberado.

### Funcionalidades incompletas o ausentes

- Archivo físico, validación MIME/firma/tamaño, hash SHA-256 y almacenamiento desacoplado.
- Historial de intentos de evidencia y una única evidencia activa en revisión.
- Rechazo con motivo, reenvío, descarga controlada y vista previa.
- Autorización por rol y propiedad basada en la identidad del JWT.
- Idempotencia, control de concurrencia y restricción de una transacción por meta.
- Validación de saldo y prevención de fondo negativo.
- Finalización automática del contrato.
- Notificaciones, auditoría funcional y dashboards del lado servidor.
- Flyway, esquema base, índices, restricciones y perfiles separados.
- Health check, Docker, Railway, Postman y CI.

### Riesgos y errores críticos

1. `application.properties` contiene una contraseña PostgreSQL versionada. El historial reciente indica que el riesgo existe desde un commit anterior; se debe retirar del árbol actual y rotar fuera de Git sin reescribir automáticamente la historia.
2. `JwtService` contiene una clave JWT fija versionada. Debe pasar a `JWT_SECRET` y considerarse expuesta.
3. Un usuario autenticado puede cambiar IDs en la URL o el cuerpo para consultar, crear, cargar o aprobar recursos ajenos.
4. `AprobarMetaUseCase` permite aprobar cualquier estado, repetir la operación, crear transacciones duplicadas y producir saldo negativo.
5. No hay claves foráneas JPA explícitas, restricciones monetarias, bloqueo ni `@Version`.
6. `GlobalExceptionHandler` imprime stack traces y devuelve el tipo y mensaje técnico de excepciones no controladas.
7. La prueba de contexto usa la base PostgreSQL local real y `ddl-auto=update`; no está aislada.
8. Producción depende de `ddl-auto=update`, con riesgo de cambios implícitos y no auditables.
9. El POM fuerza Spring Framework 7.0.8 y Spring Security 7.1.0 sobre Spring Boot 3.5.16. Aunque la compilación basal pasa, la combinación se aparta del BOM soportado y puede introducir incompatibilidades.
10. El contrato nace `PENDIENTE` y no existe transición explícita a `ACTIVO`, pese a congelarse el fondo en la creación.

## Estado actual del frontend

El frontend usa Angular 22 con componentes standalone, signals, RxJS, servicios HTTP, guard e interceptor funcional. Conserva una identidad visual oscura/neón, responsive y coherente con el prototipo.

### Funcionalidades existentes

- Landing, registro, login, marketplace y dashboard compartido por rol.
- Sesión JWT almacenada en `localStorage` e interceptor `Authorization`.
- Catálogo con búsqueda y filtro.
- Modal de creación de contrato con selección de metas y cálculo visible del 10 %.
- Vista de contratos y estados por rol.
- Envío de evidencia por URL y confirmación de pago.
- Mensajes básicos de carga, vacío, éxito y error.

### Funcionalidades incompletas o ausentes

- Entornos de producción: la única URL está fijada a `http://localhost:8080/api`.
- Manejo centralizado de 401, 403, 404, 409, 413 y errores de red.
- Formularios reactivos y validaciones completas.
- Selector de archivo, cámara, previsualización, progreso, cancelación y liberación de recursos.
- Rechazo, motivo obligatorio, historial de intentos y reenvío.
- Descarga autenticada de evidencia y render de imagen/PDF/video.
- Notificaciones, historial de transacciones y resúmenes financieros completos.
- Pruebas unitarias, de componentes y E2E; `package.json` no tiene script `test` ni `lint`.
- Vercel, CI y configuración SPA de producción.

### Riesgos, deuda técnica y accesibilidad

- El frontend envía `idNegocio` desde la sesión como dato confiable; el backend debe ignorarlo para autorización.
- El guard solo comprueba que exista un token, no su expiración ni el rol de la ruta.
- El interceptor no procesa sesión expirada.
- El dashboard concentra demasiadas responsabilidades en un componente de más de 300 líneas y su plantilla supera 400 líneas.
- Se usan formularios template-driven pese al requisito de formularios reactivos.
- Los modales no declaran `role="dialog"`, `aria-modal`, foco inicial ni restauración de foco.
- Existen estilos que eliminan `outline`; deben sustituirse por foco visible.
- La landing presenta cifras promocionales fijas y un simulador no medido. Deben etiquetarse como simulación o reemplazarse por datos reales para no confundirse con métricas verificadas.
- `montoObjetivo` usa un respaldo fijo en backend cuando no hay plantillas; no debe presentarse como medición real.

## Validación basal ejecutada

| Validación | Resultado observado | Limitación |
|---|---|---|
| Backend `compile` | Correcto | Ejecutado con JDK local 25.0.1 compilando a Java 21; falta validar con JDK 21 exacto. |
| Backend `test` | 1 prueba correcta | Solo carga contexto y se conecta a PostgreSQL local real; no valida reglas de negocio. |
| Frontend `npm run build` | Correcto | Bundle inicial 523.43 kB; advertencia por `RouterLink` no usado. |
| Frontend tests | No configurados | No existe script ni dependencias de prueba. |
| Docker/Testcontainers | No disponible | Docker no está instalado en el entorno auditado. |

## Archivos críticos

### Backend

- `pom.xml`
- `src/main/resources/application.properties`
- `infrastructure/security/JwtService.java`
- `infrastructure/config/SecurityConfig.java`
- `shared/exception/GlobalExceptionHandler.java`
- `application/usecase/meta/AprobarMetaUseCase.java`
- `application/usecase/meta/RegistrarEvidenciaUseCase.java`
- `application/usecase/contrato/CrearContratoUseCase.java`
- Entidades, mapeadores y repositorios de contrato, meta, fondo y transacción.

### Frontend

- `src/environments/environment.ts`
- `src/app/core/api-client.ts`
- `src/app/core/auth.interceptor.ts`
- `src/app/core/meta.service.ts`
- `src/app/pages/dashboard/dashboard.page.ts`
- `src/app/pages/dashboard/dashboard.page.html`
- `src/app/shared/contract-modal/*`
- `src/styles.css`

## Elementos que deben conservarse

- Frameworks, estructura hexagonal inicial y separación dominio/aplicación/infraestructura/interfaces.
- Registro, login, catálogo, plantillas, creación y listado de contratos que ya funcionan.
- BCrypt, JWT y Swagger, corrigiendo configuración y autorización.
- Identidad visual, landing, navegación, marketplace y estilos responsive.
- Compatibilidad temporal de `url_evidencia`, marcada como legado y fuera del flujo principal.
- Comisión de negocio del 10 %, formalizada como regla configurable y probada.

## Elementos que requieren migración incremental

- `url_evidencia` a entidad `evidencias` con contenido binario PostgreSQL desacoplado por puerto.
- `ddl-auto=update` a Flyway y `validate` en producción.
- IDs de usuario proporcionados por el cliente a identidad obtenida del `SecurityContext`.
- Respuestas de error heterogéneas a un contrato uniforme con código estable.
- Resumen calculado solo en cliente a consultas financieras y de notificaciones consistentes.
- URL Angular local fija a reemplazo de configuración por ambiente.

## Plan de modificación aprobado

1. Alinear dependencias, separar perfiles, retirar secretos, añadir Flyway y construir el modelo de evidencia/notificación/auditoría con restricciones.
2. Incorporar puertos, almacenamiento BYTEA, validación de archivos y casos de envío, consulta, rechazo, reenvío, descarga y aprobación idempotente.
3. Endurecer JWT, roles, propiedad, CORS, cabeceras y errores; derivar siempre el usuario autenticado del token.
4. Migrar Angular a servicios/modelos del flujo físico, componente de cámara, modales accesibles, historial, rechazo, reenvío y estados financieros.
5. Agregar pruebas de dominio, aplicación, integración web y frontend; medir cobertura real sin inventarla.
6. Preparar CI, Docker, Railway, Vercel, Postman y health checks sin desplegar.
7. Actualizar documentación, diagramas, guiones, matriz de pruebas, métricas y checklist con resultados realmente ejecutados.

Ningún punto de este documento afirma despliegue, cobertura, rendimiento, revisión por terceros o contribución grupal no observada.
