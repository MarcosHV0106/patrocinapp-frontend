# Integración continua frontend

`.github/workflows/integracion-frontend.yml` usa Node 22, caché npm, `npm ci`, cobertura Vitest y build production; publica `coverage/` y `dist/`. No hay script lint configurado, por lo que no se simula una etapa inexistente. Fallar pruebas, umbral o build detiene el job y no existe despliegue automático.

Dependabot monitorea npm y Actions. Las reglas de rama (PR, aprobación ajena y check obligatorio) deben activarse en GitHub por el equipo; no están afirmadas como existentes.
