# Rollback Vercel

1. Conservar el deployment fallido para diagnóstico y detener promociones.
2. En Vercel, promover/redeploy el deployment anterior asociado al commit validado.
3. Confirmar que su `API_URL` corresponde al backend compatible.
4. Probar carga de assets, refresh de rutas SPA, login y dashboards.
5. Si la API cambió de contrato, coordinar rollback backend o desplegar un frontend compatible; no asumir compatibilidad.

El rollback frontend no revierte datos ni migraciones. Variables comprometidas se corrigen y el deployment se reconstruye.
