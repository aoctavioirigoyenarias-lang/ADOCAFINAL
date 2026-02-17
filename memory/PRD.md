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

## ACTUALIZACIÓN FEBRERO 2025

### 1. Persistencia de Sesión (24 horas)
- ✅ LocalStorage guarda sesión activa por 24 horas
- ✅ Al reabrir adoca.net/live, entra directo al evento sin pedir QR
- ✅ Botón "Salir del evento" limpia sesión

### 2. Banner PWA "Añadir a Inicio"
- ✅ Banner flotante: "¿Subir fotos más rápido? ¡Agrega a inicio!"
- ✅ Instrucciones específicas iOS/Android
- ✅ Se puede cerrar y no reaparece

### 3. Selector Múltiple de Archivos
- ✅ Atributo `multiple` habilitado
- ✅ Máximo 10 fotos simultáneas
- ✅ Progreso muestra "Subiendo X/Y..."

### 4. Precios PicPartyLive NETO
- ✅ $700 MXN (NETO) - Básico
- ✅ $1,000 MXN (NETO) - Estándar  
- ✅ $1,500 MXN (NETO) - Premium

### 5. Emojis Temáticos
- ✅ Barra decorativa: 👸 ✨ 👑 💃 📸
- ✅ Footer con emojis
- ✅ Tipos de evento actualizados

## REGLA ADOCA
- Precio Neto SIEMPRE activo (show_net_price: true)
- NO modificar DNS/Squarespace

## Test Results (Febrero 2025)
- PicPartyLive: 100% ✅
- Banner PWA: 100% ✅
- Persistencia 24h: 100% ✅
- Precios NETO: 100% ✅

## Preferencias Default
- `show_net_price: true`
- `tax_rate: 0.16`
