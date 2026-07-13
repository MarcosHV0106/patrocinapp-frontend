# Métricas reales frontend

Medición final: 2026-07-13, Windows, Node 24.16.0, npm 11.13.0, Angular 22 y Vitest 4.1.10, después de `npm ci`.

| Medida | Objetivo | Resultado medido | Herramienta | Limitación |
|---|---:|---:|---|---|
| Pruebas | verdes | 7 archivos, 21/21 | Vitest/jsdom | DOM simulado, no navegador real |
| Statements | informar | 79.31% (583/735) | V8 | sin umbral propio |
| Branches | informar | 72.09% (186/258) | V8 | sin umbral propio |
| Functions | informar | 62.18% (74/119) | V8 | sin umbral propio |
| Líneas | ≥80% | 87.29% (371/425) | V8, umbral Angular | no E2E |
| Bundle inicial | <650 kB warning | 574.29 kB raw / 135.09 kB transferencia estimada | Angular production build | estimación de compresión |
| Archivos top-level de dist | informar | 3,517,672 bytes | filesystem | incluye assets top-level, no costo de red total |
| Dependencias npm | sin altas | 3 bajas, 0 altas reportadas; comando salida 0 con `--audit-level=high` | npm audit | registro npm; riesgo cambia en el tiempo |
| Configuración sensible | ninguna embebida | 0 coincidencias para patrones revisados | ripgrep sobre `dist` | no sustituye escáner dedicado |

No se midieron Core Web Vitals, latencia API, accesibilidad automatizada, dispositivos físicos ni disponibilidad de Vercel.
