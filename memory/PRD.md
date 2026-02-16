# PRD - adoca.net (Photo Event Gallery)

## Original Problem Statement
REPARACIÓN DE EMERGENCIA para adoca.net:
1. Configurar ruta principal (/) para Galería de Eventos con calendario
2. Mover PicParty Live a /live
3. Vincular eventos con links de fotoshare.co (Paula, Fernanda, Resideo)
4. Mantener precio neto en cotizaciones
5. Recuperar Cotizador y Panel Admin

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui
- **Backend:** FastAPI + MongoDB
- **Routes:** 
  - `/` → EventGallery (calendario + 3 eventos)
  - `/cotizador` → Cotizador de servicios con precio neto
  - `/admin` → Panel Admin (gestión eventos, sesiones, preferencias)
  - `/live` → PicPartyLive (escáner de código QR)

## User Personas
- **Clientes:** Acceden a fotos vía fotoshare.co, solicitan cotizaciones
- **Asistentes a eventos:** Usan /live para escanear código QR
- **Admin:** Gestiona eventos, sesiones live y preferencias desde /admin

## Core Requirements (Static)
- ✅ Galería de eventos en portada con calendario
- ✅ Links a fotoshare.co funcionales
- ✅ Cotizador con precio neto configurable
- ✅ Panel Admin para gestión completa
- ✅ PicParty Live en ruta secundaria

## What's Been Implemented
- [2026-01-26] Rutas corregidas (/ = Galería, /live = Live, /cotizador, /admin)
- [2026-01-26] 3 eventos seeded: Paula, Fernanda, Resideo
- [2026-01-26] Cotizador completo con cálculo de precio neto
- [2026-01-26] Panel Admin con tabs: Eventos, Sesiones Live, Preferencias
- [2026-01-26] APIs completas: /events, /preferences, /quote, /live/*
- [2026-01-26] CRUD completo para eventos y sesiones live

## Eventos Configurados
| Evento   | URL Fotoshare                                      |
|----------|---------------------------------------------------|
| Paula    | https://fotoshare.co/e/-AUAT_kcGz8xs9NmSU1gz      |
| Fernanda | https://fotoshare.co/e/LuUlUt1awwHl_k0fD7K2M      |
| Resideo  | https://fotoshare.co/e/E8uvCS1AtuKMxXiOYUL1M      |

## Preferencias Guardadas
- `show_net_price: true` (Precio neto habilitado)
- `tax_rate: 0.16` (IVA 16%)

## Test Results
- Backend: 100% passed
- Frontend: 100% passed
- Integration: 100% passed

## Next Tasks
1. Replace deployment para actualizar dominio adoca.net
2. Agregar más eventos según necesidad desde /admin
