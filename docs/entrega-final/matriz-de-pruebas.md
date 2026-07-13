# Matriz de pruebas frontend

| ID | Módulo | Tipo | Precondición / pasos | Esperado | Obtenido | Estado | Evidencia | Responsable |
|---|---|---|---|---|---|---|---|---|
| FE-01 | Sesión | Unitario | JWT vigente/expirado | conservar/eliminar | Coincide | Pasa | `session-store.spec.ts` | MarcosHV0106 |
| FE-02 | HTTP | Unitario | errores 0/401/403/404/409/413 | mensaje seguro | Coincide | Pasa | `http-error.util.spec.ts` | MarcosHV0106 |
| FE-03 | API | Unitario | multipart, progreso, aprobar/rechazar/descargar/listar | request tipado | Coincide | Pasa | `meta.service.spec.ts` | MarcosHV0106 |
| FE-04 | Cámara | Unitario | MediaDevices/captura/stop | cámara trasera y limpieza | Coincide | Pasa | `camera.service.spec.ts` | MarcosHV0106 |
| FE-05 | Carga | Componente | inválido/válido/PDF/video/doble submit | valida, preview y un envío | Coincide | Pasa | `evidence-upload-modal.component.spec.ts` | MarcosHV0106 |
| FE-06 | Revisión | Componente | rechazar vacío/con motivo/aprobar/descargar | regla y eventos | Coincide | Pasa | `evidence-review-modal.component.spec.ts` | MarcosHV0106 |
| FE-07 | Contrato | Componente | monto y doble confirmación | comisión visible y un request | Coincide | Pasa | `contract-modal.component.spec.ts` | MarcosHV0106 |
| FE-08 | Producción | Build | `npm run build` | bundle dentro de presupuesto | 574.29 kB | Pasa | salida Angular | MarcosHV0106 |
| FE-09 | Dispositivo | Manual | iOS/Android y permisos | captura/fallback | No ejecutado | Pendiente | checklist manual | Renzo/QA |
| FE-10 | E2E | Sistema | API y DB reales | flujo completo | No ejecutado | Pendiente | guion funcional | Equipo |
