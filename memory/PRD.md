# PRD - PicParty / adoca.net (Photo Event Platform)

## Problem Statement
Aplicación de cabina fotográfica con gestión de eventos, cotizaciones, contratos y PicParty Live para compartir fotos en tiempo real.

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui + jsPDF + qrcode
- **Backend:** FastAPI + MongoDB
- **Routes:** 
  - `/` → Galería de Eventos (calendario buscador + grid escalable)
  - `/cotizador` → Cotizador con PRECIO NETO y PDF
  - `/admin` → Panel Admin (gestión eventos, sesiones Live, contratos)
  - `/picpartylive` o `/live` → PicParty Live (escáner de código QR)

## Credenciales Admin
- **Usuario:** OCTAVIO
- **Password:** CHELO1980

## Features Implemented

### 1. GALERÍA PRO (Solo visualización IFRAME)
- ✅ Grid flexible que soporta 5+ eventos por día
- ✅ Cada evento puede tener: FOTOS, VIDEO 360, o ambos
- ✅ Etiquetas claras identifican servicios (📸 Fotos / 🎥 360°)
- ✅ Portadas automáticas con color + emoji + nombre

### 2. PICPARTY LIVE V2.1 ✅ (Completado Diciembre 2025)
- ✅ **Descarga QR PDF corregida** - pdf.save() descarga directo, NO abre about:blank
- ✅ **QR alta resolución** - Canvas 1200px para impresión
- ✅ **Tipo de Evento** - Dropdown: Boda, Quinceaños, Cumpleaños, Empresarial, Evento Público, Fiesta, Otro
- ✅ **Fecha del Evento** - Selector de fecha obligatorio
- ✅ **Ordenamiento descendente** - Eventos más recientes primero
- ✅ **Badges de tipo** - Emoji + etiqueta en lista de eventos
- ✅ **PDF incluye:** Logo PicParty, QR grande, nombre evento, tipo, fecha

### 3. SISTEMA DE CONTRATOS
- ✅ Contratos Públicos (Precio Neto)
- ✅ Contratos Especiales/Proveedor (Precio editable)
- ✅ Descuento manual configurable
- ✅ Generación de PDF de contrato

### 4. COTIZADOR PÚBLICO
- ✅ Formulario con datos cliente
- ✅ Paquetes Base, Video 360, PicParty Live
- ✅ Extras opcionales
- ✅ Descarga PDF de cotización

## Eventos Configurados (Galería)
| Evento   | Color   | Servicios      | URL Fotoshare                               |
|----------|---------|----------------|---------------------------------------------|
| PAULA    | #EC4899 | 📸 Fotos       | fotoshare.co/e/-AUAT_kcGz8xs9NmSU1gz       |
| FERNANDA | #8B5CF6 | 📸 Fotos       | fotoshare.co/e/LuUlUt1awwHl_k0fD7K2M       |
| RESIDEO  | #3B82F6 | 📸🎥 Fotos+360 | fotoshare.co/e/E8uvCS1AtuKMxXiOYUL1M       |

## Test Results (Diciembre 2025)
- PicPartyLive V2.1: 100% ✅
  - PDF Download: PASS
  - Form Fields: PASS
  - Date Sorting: PASS  
  - Event Type Badge: PASS

## Known Issues
- **CORS Logo en PDF**: El logo de PicParty puede no aparecer en el PDF debido a CORS. El PDF descarga correctamente.

## Pending/Future Tasks (P1-P2)
1. **Cloudinary Integration** - Subida de fotos a carpetas [Nombre]_[Fecha] (requiere API keys del usuario)
2. **ZIP Download** - Descargar todas las fotos de un evento como .zip
3. **Ruta /live-tv** - Feed público con fotos en tiempo real y rankings emoji

## Preferencias
- `show_net_price: true` (PRECIO NETO activado)
- `tax_rate: 0.16` (IVA 16%)
