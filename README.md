# Patrocinapp Angular

Frontend Angular para Patrocinapp, manteniendo la estética del prototipo original: tema oscuro premium, fondos neón, tarjetas deportivas con imágenes, dashboard financiero y flujo de patrocinio por hitos.

## Requisitos

- Node compatible con Angular 22.
- Backend Spring Boot ejecutándose en `http://localhost:8080`.

## Instalación

```bash
npm config set registry https://registry.npmjs.org/
npm install
npm start
```

La aplicación se levanta en:

```bash
http://localhost:4200
```

## Configuración

La URL base se encuentra en:

```bash
src/environments/environment.ts
```

```ts
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```
