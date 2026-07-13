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
