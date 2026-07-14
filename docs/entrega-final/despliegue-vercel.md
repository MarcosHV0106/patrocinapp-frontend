# Despliegue posterior en Vercel

Estado: **preparado, no desplegado**. La landing forma parte de este mismo Angular; no necesita repositorio separado.

1. Importar el repositorio y elegir Node compatible con `package.json` (`>=22.22.3`).
2. Build command: `npm run build`; output: `dist/patrocinapp-angular/browser`.
3. Definir `API_URL` con la URL HTTPS de Railway terminada en `/api`.
4. Generar Preview y probar `/`, `/marketplace`, `/login`, `/registro`, ruta directa `/dashboard`, assets y refresh SPA.
5. Coordinar `CORS_ALLOWED_ORIGINS` del backend con Preview/Production.
6. Validar ambos roles y el flujo completo antes de promover a Production.

`scripts/generate-runtime-config.mjs` genera `runtime-config.js` en build; `vercel.json` agrega rewrite SPA, headers y permiso de cámara para el propio origen. No se ejecutó `vercel deploy`.
