# Defectos encontrados

| ID | Hallazgo | Corrección / estado |
|---|---|---|
| F-01 | Mock data y persistencia local dominaban el flujo | servicios conectados a API y modelos tipados |
| F-02 | Sesión no invalidaba JWT expirado y errores eran inconsistentes | `SessionStore`, interceptor y traductor central |
| F-03 | Sin carga física/cámara/revisión | modales y servicio de cámara con fallback y limpieza |
| F-04 | Build production incluyó `*.spec.ts` tras ampliar el include | `tsconfig.app.json` excluye specs; build final aprobado |
| F-05 | URL del backend podía quedar fija | runtime config + file replacement; artefacto revisado sin `localhost:8080` |
| F-06 | Auditoría npm reporta tres vulnerabilidades bajas de tooling | registradas; no se aplicó `--force` porque propone downgrade rompiente; Dependabot monitorea |

No hay compilaciones ni pruebas fallidas conocidas tras las correcciones.
