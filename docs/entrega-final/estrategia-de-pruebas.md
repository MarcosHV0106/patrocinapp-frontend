# Estrategia de pruebas frontend

Angular 22 usa su builder `unit-test` con Vitest 4, jsdom y cobertura V8. Se prueban servicios/HTTP y componentes críticos sin depender de un backend real; el build de producción constituye la verificación de integración estática. CI ejecuta `npm ci`, cobertura y build, conservando reportes.

Riesgos cubiertos: expiración de JWT, traducción de errores, multipart/progreso, endpoints de revisión, MIME/tamaño, duplicación, cámara/limpieza de tracks, confirmación financiera, motivo obligatorio y liberación de object URLs. Umbral configurado: 80% de líneas globales.

Pendientes deliberados: E2E con backend/PostgreSQL, permisos en dispositivos físicos, lector de pantalla y navegadores reales.
