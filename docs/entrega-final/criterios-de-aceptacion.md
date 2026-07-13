# Criterios de aceptación UX/Frontend

- [x] El deportista selecciona JPEG/PNG/WebP/PDF/MP4 de hasta 10 MB, ve preview y progreso.
- [x] Puede usar `capture=environment`; MediaDevices captura JPEG y siempre ofrece fallback.
- [x] Una evidencia en revisión no se envía duplicada.
- [x] El negocio ve/descarga el archivo protegido y no puede rechazar sin motivo.
- [x] Aprobar exige confirmación explícita y bloquea acciones concurrentes en UI.
- [x] El rechazo, historial, pago, fondo y notificaciones se presentan desde la API real.
- [x] 401 elimina sesión; 403/404/409/413 y red muestran mensajes seguros.
- [x] El build de producción usa `/api` o `API_URL`, nunca `localhost:8080` embebido.
- [ ] Cámara y responsive validados manualmente en iOS/Android reales.
- [ ] Validación UX con participantes reales y auditoría de lector de pantalla.
