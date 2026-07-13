# Resultados de pruebas frontend

Fecha/entorno: 2026-07-13, Windows, Node compatible con `>=22.22.3`, Angular 22, Vitest 4.1.10, jsdom 29.1.1.

- 7 archivos, **21/21 pruebas aprobadas**.
- Cobertura V8: statements 79.31% (583/735), branches 72.09% (186/258), functions 62.18% (74/119), líneas **87.29% (371/425)**.
- Umbral de líneas 80%: aprobado.
- Build production: 574.29 kB raw y 135.09 kB estimados de transferencia; aprobado sin warning de presupuesto.
- `npm audit --audit-level=high`: salida 0, 3 vulnerabilidades bajas, 0 altas reportadas.
- Escaneo del artefacto: sin `localhost:8080`, `JWT_SECRET`, `DB_PASSWORD` ni clave demo.

Reportes: `coverage/` y `dist/patrocinapp-angular/`. Pendientes: E2E real y validación en dispositivos/navegadores físicos.
