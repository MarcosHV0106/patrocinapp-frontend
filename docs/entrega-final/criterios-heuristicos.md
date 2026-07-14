# Evaluación heurística

| Heurística | Aplicación verificable | Seguimiento |
|---|---|---|
| Visibilidad del estado | progreso de upload, cargas, badges y mensajes | Validar con usuarios |
| Correspondencia con el mundo real | «monto congelado», «liberado», «motivo de rechazo» | Revisar terminología legal |
| Control y libertad | quitar archivo, cerrar modal, fallback de cámara | No cerrar durante operación |
| Consistencia | componentes y estilos existentes conservados | Revisar futuras pantallas |
| Prevención de errores | tipo/tamaño, motivo obligatorio, doble confirmación, botones ocupados | Cubierto por pruebas |
| Reconocer antes que recordar | historial y motivo visibles en la meta | Cubierto |
| Eficiencia | captura móvil y filtros marketplace | Medición pendiente |
| Diseño minimalista | detalle progresivo en modales | Validación pendiente |
| Recuperación de errores | traducción 0/401/403/404/409/413 | Cubierto por pruebas unitarias |
| Ayuda | mensajes accionables y fallback | Manual contextual futuro |

Accesibilidad implementada: foco visible, navegación por teclado nativa, labels, `aria-live`, texto no dependiente solo del color, contraste, responsive y `prefers-reduced-motion`. Falta auditoría manual con lector de pantalla y dispositivo físico.
