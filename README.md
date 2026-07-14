# Patrocinapp Angular

Frontend Angular 22 para PatrocinApp con marketplace, contratos, evidencia física/cámara, rechazo y reenvío, pagos, historial y notificaciones.

## Requisitos

- Node 22.22.3 o superior.
- Backend Spring Boot ejecutándose en `http://localhost:8080`.

## Instalación

```bash
npm ci
npm start
```

La aplicación se levanta en:

```bash
http://localhost:4200
```

## Configuración

En desarrollo, la URL base se encuentra en:

```bash
src/environments/environment.ts
```

```ts
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

El build de producción no contiene `localhost`: genera `runtime-config.js` desde `API_URL` y usa `/api` como fallback seguro.

```bash
API_URL=https://backend.example.com/api npm run build
npm run test:coverage
```

En PowerShell: `$env:API_URL='https://backend.example.com/api'; npm.cmd run build`.

## Vercel

Configura `API_URL` con la URL HTTPS pública del backend Railway y usa `vercel.json`. El despliegue no forma parte de esta entrega: primero revisa `docs/entrega-final/despliegue-vercel.md`.

## Tecnologías y arquitectura

Angular 22 con componentes standalone, Router, formularios reactivos, HttpClient, RxJS, signals y Bootstrap Icons. `core/` concentra API, sesión, guards, interceptor, cámara y modelos; `pages/` organiza rutas; `shared/` encapsula modales y piezas reutilizables. Las pruebas usan el builder oficial de Angular con Vitest/jsdom y cobertura V8.

## Rutas y roles

- Públicas: `/`, `/marketplace`, `/login`, `/registro`.
- Protegida: `/dashboard` mediante `authGuard`.
- `DEPORTISTA`: contratos/metas, carga o captura, motivo, reenvío, pagos, historial y notificaciones.
- `NEGOCIO`: inversión/fondo/comisión, preview/descarga, aprobación/rechazo, historial y notificaciones.

La autorización definitiva se ejecuta en el backend; el frontend adapta la interfaz, pero no sustituye ese control.

## Cámara y evidencias

En móvil se ofrece `capture="environment"`; cuando existe MediaDevices se solicita permiso, muestra video y captura JPEG. Si el permiso falla se conserva el selector. Los tracks y object URLs se liberan al cerrar. Se admiten JPEG, PNG, WebP, PDF y MP4 hasta 10 MB, con preview, comentario y progreso.

## Pruebas y build

```bash
npm ci
npm test
npm run test:coverage
npm run build
```

El reporte queda en `coverage/` y el bundle en `dist/patrocinapp-angular/browser`. El umbral de líneas es 80% y los presupuestos Angular detienen bundles excesivos.

## Accesibilidad, seguridad y equipo

La UI incluye labels, foco visible, mensajes `aria-live`, estados que no dependen solo del color, teclado, responsive y reducción de movimiento. Quedan pendientes pruebas manuales con lector de pantalla/dispositivos físicos. Consulta `SECURITY.md`, `CONTRIBUTORS.md` y `docs/entrega-final/`; no hay licencia declarada actualmente.
