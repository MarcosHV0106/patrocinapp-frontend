# Variables Vercel

| Variable | Entornos | Ejemplo |
|---|---|---|
| `API_URL` | Preview y Production | `https://api-patrocinapp.example/api` |

`API_URL` no es un secreto, pero debe apuntar a HTTPS y al ambiente correspondiente. No colocar JWT, credenciales PostgreSQL ni `JWT_SECRET` en Vercel. Sin variable, el build usa `/api`, útil solo cuando existe proxy/rewrite del mismo origen.

Después de cambiar la variable se requiere un nuevo build. Verificar `dist/.../runtime-config.js` y que el backend permita el origen exacto.
