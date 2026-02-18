# PICPARTYLIVE - Product Requirements Document

## Original Problem Statement
Plataforma de fotos en vivo para eventos (bodas, quinceaños, fiestas). Permite a los invitados subir y ver fotos en tiempo real con proyección en pantalla.

## Core Features Implemented

### Admin Panel (`/admin`)
- Login protegido (Usuario: OCTAVIO, Pass: CHELO1980)
- Crear/editar sesiones Live con código automático de 4 dígitos
- Teléfono del cliente obligatorio (sin límite de caracteres - acepta 10+ dígitos)
- Últimos 4 dígitos del teléfono = clave de descarga
- Botón "Sincronizar Cloudinary" para importar fotos externas
- QR automático para cada evento
- Ordenamiento por fecha descendente (más recientes primero)

### Cotizador (`/cotizador`)
- PICPARTYLIVE como primera opción (Paso 1, con badge "RECOMENDADO")
- Precios: $1,000 NETO solo / $700 NETO en combo con Cabina o 360
- Teléfono opcional
- Genera PDF con folio único

### Galería Live (`/live?code=XXXX`)
- Vista móvil: galería directa
- Vista PC/Tablet: menú maestro (Proyectar, Ver Galería, Descargar)
- Subida de fotos en tiempo real
- Reacciones con emoji
- Descarga protegida con clave (últimos 4 dígitos del teléfono)

### Landing Page (`/picpartylive`)
- Página de ventas con demo interactivo
- Botón "Prueba GRATIS" genera demo temporal (24 horas)

### Demo Mode
- Sesiones temporales con prefijo DEMO-
- Auto-limpieza después de 24 horas (apscheduler)

## Technical Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Auth**: JWT (Passlib, python-jose)
- **Storage**: Cloudinary
- **Background Jobs**: apscheduler

## Key Endpoints
- `POST /api/live/sessions/create` - Crear sesión
- `POST /api/live/sync-cloudinary/{code}` - Sincronizar fotos de Cloudinary
- `GET /api/live/sessions` - Listar sesiones
- `POST /api/quotes` - Crear cotización
- `POST /api/demo-session` - Crear demo temporal

## Pending Items
1. **Cloudinary Sync** - Requiere API keys del usuario para funcionar
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

## Future Tasks (Backlog)
- [ ] Refactorizar App.js en componentes más pequeños
- [ ] Refactorizar server.py en estructura modular
- [ ] Desarrollar ruta /live-tv para proyección dedicada

## Admin Credentials
- Usuario: OCTAVIO
- Password: CHELO1980

## Last Updated
December 2025
