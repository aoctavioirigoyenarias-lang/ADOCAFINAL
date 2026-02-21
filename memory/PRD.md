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

### Sistema de Contratos (2 páginas PDF)
- **Servicios dinámicos**: Cabina de Fotos, Video 360, Key Moments, PicPartyLive
- **Precios personalizables** por servicio
- **Nota automática PicPartyLive**: "Internet y pantallas por cuenta del anfitrión"
- **Cláusulas legales** incluidas:
  1. PRECIOS NETOS - Todos los montos son NETO
  2. ANTICIPO Y LIQUIDACION - Si anticipo es $0, pago antes del evento
  3. CONDICIONES CLIMATICAS - Cliente protege el equipo, tiempo perdido no reembolsable
  4. DAÑOS AL EQUIPO - Cliente responsable de daños
  5. CANCELACION - 15 días anticipación
  6. DERECHOS DE IMAGEN
  7. VIGENCIA - 15 días
- **Apartado Administrativo (NO se imprime)**:
  - Estatus de Anticipo: "Liquidado", "Pendiente", "Día del Evento"
  - Monto de Anticipo recibido
  - Costo Proveedor (gasto real)
  - Utilidad Neta automática (Precio Neto - Costo Proveedor)
- **Sección de firmas** al final del documento

### Cotizador (`/cotizador`)
- PICPARTYLIVE como primera opción (Paso 1, con badge "RECOMENDADO")
- Precios: $1,000 NETO solo / $700 NETO en combo con Cabina o 360
- Teléfono opcional
- Genera PDF con folio único (optimizado B&W)

### Galería Live (`/live?code=XXXX`) - Estilo Instagram
- **Grid 3 columnas** compacto sin espacios
- **Double tap para like** con animación de corazón
- **Lightbox fullscreen** al tocar una foto
- Navegación con flechas y contador de fotos
- Header minimalista (solo nombre + contador)
- Tabs con iconos (subir + galería)
- Descarga protegida con clave (últimos 4 dígitos del teléfono)
- Likes persistentes en localStorage

### Landing Page (`/picpartylive`)
- Página de ventas con demo interactivo
- Botón "Prueba GRATIS" genera demo temporal (24 horas)

### Demo Mode
- Sesiones temporales con prefijo DEMO-
- Auto-limpieza después de 24 horas (apscheduler)

## PDFs Optimizados para Impresión B&W
- **Logo PicParty**: Fijo en esquina superior izquierda (35-40mm ancho)
- **Cabeceras de tablas**: Gris claro 10% (RGB 245,245,245)
- **Texto principal**: Gris Oxford (RGB 40,40,40)
- **Total/Precio Neto**: Recuadro gris oscuro (RGB 50,50,50) con texto blanco
- **Sin emojis**: Texto limpio sin caracteres especiales
- **Contratos**: 2 páginas con cláusulas legales y firmas

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
### Contract Model
```
{
  client_name, client_phone, client_email,
  event_name, salon, event_date, event_time, service_time, duration_hours,
  contract_type: "public" | "special",
  // Servicios
  include_cabina, price_cabina,
  include_video360, price_video360,
  include_key_moments, price_key_moments,
  include_live, price_live,
  // Totales
  subtotal, discount_percent, discount_amount, net_price,
  // Campos Administrativos (NO SE IMPRIMEN)
  anticipo_status: "pendiente" | "liquidado" | "dia_evento",
  anticipo_amount: Number | null,
  costo_proveedor: Number | null,
  utilidad_neta: Number | null
}
```

## Pending Items
~~1. **Cloudinary Sync** - Requiere API keys del usuario para funcionar~~
   - ✅ COMPLETADO - 32 fotos sincronizadas exitosamente

## Cloudinary Configuration
- CLOUDINARY_CLOUD_NAME: dpvliv2wl
- CLOUDINARY_API_KEY: configurado
- CLOUDINARY_API_SECRET: configurado
- Carpeta de prueba: `ADOCA/FEBRERO/28-02-26/PUBLICO_EXPO_BODA`

## Future Tasks (Backlog)
- [ ] Refactorizar App.js en componentes más pequeños
- [ ] Refactorizar server.py en estructura modular
- [ ] Desarrollar ruta /live-tv para proyección dedicada

## Admin Credentials
- Usuario: OCTAVIO
- Password: CHELO1980

## Last Updated
December 2025 - Contrato legal 2 páginas con cláusulas completas
