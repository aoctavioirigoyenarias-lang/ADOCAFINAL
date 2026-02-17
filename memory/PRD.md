# PRD - PicParty / adoca.net (Photo Event Platform)

## Problem Statement
Aplicación de cabina fotográfica con gestión de eventos, cotizaciones, contratos y PicParty Live para compartir fotos en tiempo real.

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui + jsPDF + qrcode
- **Backend:** FastAPI + MongoDB
- **Storage:** Cloudinary (Cloud: dpvliv2wl)
- **Domain:** adoca.net (DNS: 76.76.21.21)
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

### Variables de Entorno Requeridas (Settings > Environment Variables):
```
REACT_APP_CLOUDINARY_CLOUD_NAME=dpvliv2wl
REACT_APP_CLOUDINARY_UPLOAD_PRESET=picparty_unsigned
```

**IMPORTANTE:** Crear el upload preset en Cloudinary:
1. Ir a Settings > Upload > Upload presets
2. Crear preset "picparty_unsigned"
3. Signing Mode: Unsigned
4. Folder: picparty

## Features Implemented

### 1. GALERÍA PRO (Solo visualización IFRAME)
- ✅ Grid flexible que soporta 5+ eventos por día
- ✅ Portadas automáticas con color + emoji + nombre
- ✅ Calendario buscador con fechas resaltadas

### 2. PICPARTY LIVE V2.1 ✅
- ✅ Descarga QR PDF con pdf.save() - NO about:blank
- ✅ QR alta resolución (1200px)
- ✅ Dropdown Tipo de Evento (Boda, Quinceaños, etc.)
- ✅ Selector Fecha del Evento
- ✅ Ordenamiento descendente por fecha
- ✅ Interfaz de invitados con botón "SUBIR MI FOTO"
- ✅ Integración Cloudinary preparada

### 3. SISTEMA DE CONTRATOS
- ✅ Contratos Públicos (Precio Neto)
- ✅ Contratos Especiales/Proveedor
- ✅ Descuento manual configurable
- ✅ PDF de contrato

### 4. COTIZADOR PÚBLICO
- ✅ Formulario con datos cliente
- ✅ Paquetes Base, Video 360, PicParty Live
- ✅ **PRECIO NETO siempre activo**

## REGLA ADOCA: Precio Neto
Todas las cotizaciones y contratos muestran SIEMPRE el precio neto (show_net_price: true).

## Test Results (Febrero 2025)
- PicPartyLive: 100% ✅
- Interfaz Invitados: 100% ✅
- QR PDF Download: 100% ✅

## Pending Tasks
1. **Configurar Upload Preset en Cloudinary** - El usuario debe crear "picparty_unsigned"
2. **Deploy a adoca.net** - Usar "Replace deployment"

## Preferencias Default
- `show_net_price: true` (PRECIO NETO siempre)
- `tax_rate: 0.16` (IVA 16%)
