# PRD - adoca.net (Photo Event Gallery)

## Original Problem Statement
Reparación de emergencia de rutas y portada para adoca.net:
1. Configurar ruta principal (/) para Galería de Eventos
2. Mover PicParty Live a /live
3. Vincular eventos con links de fotoshare.co
4. Mantener precio neto en cotizaciones

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui
- **Backend:** FastAPI + MongoDB
- **Routes:** 
  - `/` → EventGallery (calendario + eventos)
  - `/live` → PicPartyLive (escáner de código)

## User Personas
- **Clientes:** Acceden a fotos de eventos vía fotoshare.co
- **Asistentes a eventos:** Usan /live para escanear código QR

## Core Requirements (Static)
- Galería de eventos en portada
- Calendario interactivo
- Links a fotoshare.co funcionales
- Sistema de cotización con precio neto

## What's Been Implemented
- [2026-01-26] Rutas corregidas (/ = Galería, /live = PicParty Live)
- [2026-01-26] 3 eventos seeded (Paula, Fernanda, Resideo)
- [2026-01-26] Preferencias de precio neto habilitadas
- [2026-01-26] API completa (/events, /preferences, /quote, /live/*)

## Prioritized Backlog
### P0 (Critical)
- ✅ Corregir rutas
- ✅ Inyectar eventos en DB

### P1 (High)
- Sistema de cotización interactivo para clientes

### P2 (Medium)
- Dashboard de administración de eventos
- Integración con QR scanner nativo

## Next Tasks
1. Replace deployment para actualizar dominio adoca.net
2. Agregar más eventos según necesidad
