# PRD - PicParty / adoca.net (Photo Event Platform)

## Problem Statement
Aplicación de cabina fotográfica con gestión de eventos, cotizaciones, contratos y PicParty Live para compartir fotos en tiempo real.

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui + jsPDF + qrcode
- **Backend:** FastAPI + MongoDB
- **Storage:** Cloudinary (Cloud: dpvliv2wl)
- **Domain:** adoca.net (DNS: 76.76.21.21 - NO MODIFICAR)
- **Routes:** 
  - `/` → Galería de Eventos
  - `/cotizador` → Cotizador con PRECIO NETO
  - `/admin` → Panel Admin
  - `/live` o `/picpartylive` → PicParty Live (invitados)

## Credenciales Admin
- **Usuario:** OCTAVIO
- **Password:** CHELO1980

## Cloudinary Configuration
- **Cloud Name:** dpvliv2wl
- **Upload Preset:** picparty_unsigned (unsigned)
- **Folder Structure:** picparty/[Nombre_Evento]_[Fecha]/

## ACTUALIZACIÓN FEBRERO 2025 - SEGURIDAD Y GALERÍA COLABORATIVA

### 1. ACCESO RESTRINGIDO
- ✅ Ruta `/live` requiere código de evento válido (QR o link)
- ✅ Sin código válido → Pantalla de entrada pidiendo código
- ✅ Sesión inválida → Redirige a landing principal

### 2. MURO COLABORATIVO
- ✅ Todos los invitados ven galería completa de fotos del evento
- ✅ Actualización en tiempo real cada 10 segundos
- ✅ Botón "🔄 Actualizar" manual
- ✅ Tabs: "📸 Subir" y "👑 Galería"

### 3. BARRA DE REACCIONES
- ✅ Emojis 👸 ✨ 👑 💃 📸 debajo de cada foto
- ✅ Contador numérico por emoji (ej: 👑 10)
- ✅ Click para agregar reacción

### 4. PERSISTENCIA 24 HORAS
- ✅ LocalStorage guarda sesión activa por 24h
- ✅ Reentrada directa sin pedir QR nuevamente
- ✅ "Salir del evento" limpia sesión

### 5. PRECIOS NETO
- ✅ $700 MXN (NETO) - Básico
- ✅ $1,000 MXN (NETO) - Estándar
- ✅ $1,500 MXN (NETO) - Premium

## API Endpoints - Muro Colaborativo
- `GET /api/live/photos/{event_code}` - Obtener fotos del evento
- `POST /api/live/photos` - Agregar foto al muro
- `POST /api/live/photos/{photo_id}/react` - Agregar reacción
- `GET /api/live/photos/{photo_id}/reactions` - Ver reacciones

## REGLA ADOCA
- Precio Neto SIEMPRE activo (show_net_price: true)
- NO modificar DNS/Squarespace

## Test Results (Febrero 2025)
- Acceso Restringido: 100% ✅
- Muro Colaborativo: 100% ✅
- Barra Reacciones: 100% ✅
- Persistencia 24h: 100% ✅
- Precios NETO: 100% ✅

## Preferencias Default
- `show_net_price: true`
- `tax_rate: 0.16`
