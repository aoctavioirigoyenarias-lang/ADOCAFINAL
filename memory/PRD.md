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
- Ordenamiento por fecha de creación descendente (más recientes primero)
- **PDFs optimizados para impresión B&W** (logo fijo, grises 10%, sin colores)

### Sistema de Contratos
- **Apartado Administrativo (Uso Interno)**:
  - Estatus de Anticipo: "Liquidado", "Pendiente", "Día del Evento"
  - Monto de Anticipo recibido
  - Costo Proveedor (gasto real)
  - Utilidad Neta automática (Precio Neto - Costo Proveedor)
- PDF de contrato optimizado para impresión B&W

### Cotizador (`/cotizador`)
- PICPARTYLIVE como primera opción (Paso 1, con badge "RECOMENDADO")
- Precios: $1,000 NETO solo / $700 NETO en combo con Cabina o 360
- Teléfono opcional
- Genera PDF con folio único (optimizado B&W)

### Galería Live (`/live?code=XXXX`)
- Vista móvil: galería directa
- Vista PC/Tablet: menú maestro (Proyectar, Ver Galería, Descargar)
- Subida de fotos en tiempo real
- **Galería limpia sin emojis de reacciones** - fotos protagonistas
- Descarga protegida con clave (últimos 4 dígitos del teléfono)

### Landing Page (`/picpartylive`)
- Página de ventas con demo interactivo
- Botón "Prueba GRATIS" genera demo temporal (24 horas)

### Demo Mode
- Sesiones temporales con prefijo DEMO-
- Auto-limpieza después de 24 horas (apscheduler)

## PDFs Optimizados para Impresión B&W
- **Logo PicParty**: Fijo en esquina superior izquierda (40mm ancho)
- **Cabeceras de tablas**: Gris claro 10% (RGB 245,245,245)
- **Texto principal**: Negro (RGB 30,30,30)
- **Total/Precio Neto**: Recuadro gris oscuro (RGB 60,60,60) con texto blanco
- **Sin emojis**: Texto limpio sin caracteres especiales
- **Sin acentos problemáticos**: Removidos para compatibilidad PDF

## Technical Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI, jsPDF
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
- `POST /api/contracts` - Crear contrato (con campos administrativos)
- `POST /api/demo-session` - Crear demo temporal

## Key DB Schema
### Contract Model (actualizado)
```
{
  client_name, client_phone, client_email,
  event_name, salon, event_date, event_time, service_time, duration_hours,
  contract_type: "public" | "special",
  base_price, subtotal, discount_percent, discount_amount, net_price,
  // Campos Administrativos
  anticipo_status: "pendiente" | "liquidado" | "dia_evento",
  anticipo_amount: Number | null,
  costo_proveedor: Number | null,
  utilidad_neta: Number | null
}
```

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
December 2025 - PDFs B&W + Campos administrativos contratos
