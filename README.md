# Gimnasio USM — Frontend

Aplicación web (PWA) del sistema de reservas del gimnasio de la USM. React 19 + Vite + Tailwind CSS.

## Requisitos

- Node.js 20 o superior (solo para compilar)

## Desarrollo local

```bash
npm ci
cp .env.example .env      # VITE_API_URL apunta al backend local
npm run dev               # http://localhost:5173
```

El backend debe estar corriendo con `DJANGO_DEBUG=True` (permite el origen `http://localhost:5173`).

## Compilación para producción

```bash
VITE_API_URL=https://gimnasio.usm.cl/api/ npm run build
```

Genera la carpeta `dist/` con archivos estáticos, que se sirven con Nginx (ver guía de despliegue). Las rutas de React Router requieren redirigir a `index.html` (`try_files $uri /index.html`). La instalación como app (PWA) requiere HTTPS.

## Sesión

- Login con RUT y contraseña contra `/api/token/`.
- El token de acceso (30 min) se renueva automáticamente con el refresh token; al cerrar sesión el refresh token se invalida en el servidor (`/api/token/logout/`).
