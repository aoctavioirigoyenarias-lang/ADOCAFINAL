# PRD - adoca.net (Photo Event Platform)

## Problem Statement
ORDEN TÉCNICA FINAL: Estructura, escalabilidad y automatización para adoca.net

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui
- **Backend:** FastAPI + MongoDB
- **Routes:** 
  - `/` → Galería de Eventos (calendario buscador + grid escalable)
  - `/cotizador` → Cotizador con PRECIO NETO
  - `/admin` → Panel Admin (gestión eventos, sesiones, preferencias)
  - `/live` → PicParty Live (escáner de código)

## Features Implemented

### 1. ESCALABILIDAD Y MULTISERVICIO
- ✅ Grid flexible que soporta 5+ eventos por día
- ✅ Cada evento puede tener: FOTOS, VIDEO 360, o ambos
- ✅ Etiquetas claras identifican servicios (📸 Fotos / 🎥 360°)

### 2. PORTADAS AUTOMÁTICAS (CERO BATALLAS)
- ✅ Sin obligación de subir fotos
- ✅ Portada automática: color sólido + emoji grande
  - 📸 para Fotos
  - 🎥 para Video 360
  - 📸🎥 para mixto
- ✅ Nombre del cliente en MAYÚSCULAS como protagonista

### 3. CALENDARIO BUSCADOR
- ✅ Funciona como filtro histórico
- ✅ Fechas con eventos resaltadas
- ✅ Filtra galería al seleccionar fecha
- ✅ Botón para limpiar filtro

### 4. FUNCIONES CRÍTICAS
- ✅ Rutas configuradas correctamente
- ✅ Cotizador con PRECIO NETO según preferencias guardadas
- ✅ Opción Video 360 (+$3,000 MXN) en cotizador
- ✅ Links de fotoshare.co inyectados

## Eventos Configurados
| Evento   | Color   | Servicios      | URL Fotoshare                               |
|----------|---------|----------------|---------------------------------------------|
| PAULA    | #EC4899 | 📸 Fotos       | fotoshare.co/e/-AUAT_kcGz8xs9NmSU1gz       |
| FERNANDA | #8B5CF6 | 📸 Fotos       | fotoshare.co/e/LuUlUt1awwHl_k0fD7K2M       |
| RESIDEO  | #3B82F6 | 📸🎥 Fotos+360 | fotoshare.co/e/E8uvCS1AtuKMxXiOYUL1M       |

## Preferencias
- `show_net_price: true` (PRECIO NETO activado)
- `tax_rate: 0.16` (IVA 16%)

## Test Results
- Frontend: 100%
- Backend: 92%
- Integration: 100%

## Next Steps
1. Verificar iconos automáticos en Preview
2. Replace deployment a adoca.net
