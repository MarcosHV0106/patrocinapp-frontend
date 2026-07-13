# Flujos de usuario

## Deportista

```mermaid
flowchart TD
  A["Iniciar sesión como deportista"] --> B["Abrir contrato y meta"]
  B --> C{"Elegir origen"}
  C -->|Archivo| D["Validar y previsualizar"]
  C -->|Cámara| E["Pedir permiso y capturar"]
  E --> D
  E -->|Denegado/no soportado| C
  D --> F["Enviar con progreso"]
  F --> G["EN_REVISION"]
  G -->|Rechazada| H["Leer motivo y reenviar"]
  H --> D
  G -->|Aprobada| I["PAGADA + transacción"]
```

## Negocio

```mermaid
flowchart TD
  A["Iniciar sesión como negocio"] --> B["Revisar pendientes"]
  B --> C["Ver o descargar evidencia"]
  C --> D{"Decisión"}
  D -->|Rechazar| E["Escribir motivo obligatorio"]
  E --> F["Notificar y permitir reenvío"]
  D -->|Aprobar| G["Confirmar efecto financiero"]
  G --> H["Liberar fondo una sola vez"]
  H --> I["Actualizar meta, contrato y notificaciones"]
```

Las rutas públicas son `/`, `/marketplace`, `/login`, `/registro`; `/dashboard` requiere sesión. Las acciones se adaptan al rol devuelto por autenticación.
