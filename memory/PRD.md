# PRD - PicParty / adoca.net (Photo Event Platform)

## Problem Statement
Aplicación de cabina fotográfica con gestión de eventos, cotizaciones, contratos y PicParty Live para compartir fotos en tiempo real.

## Architecture
- **Frontend:** React + TailwindCSS + shadcn/ui + jsPDF + qrcode
- **Backend:** FastAPI + MongoDB
- **Storage:** Cloudinary (Cloud: dpvliv2wl)
- **Domain:** adoca.net (DNS: 76.76.21.21 - NO MODIFICAR)

## Credenciales Admin
- **Usuario:** OCTAVIO
- **Password:** CHELO1980

## ESTRUCTURA DE CARPETAS CLOUDINARY
```
ADOCA/{{MES}}/{{FECHA}}/{{TIPO}}_{{NOMBRE}}/
```
**Ejemplo:** `ADOCA/MARZO/21-03-26/BODA_ANABEL_Y_RAUL/`

- **MES**: ENERO, FEBRERO, MARZO... (mayúsculas)
- **FECHA**: DD-MM-AA (ej: 21-03-26)
- **TIPO**: BODA, XV, CUMPLEANOS, EMPRESARIAL, FIESTA, etc.
- **NOMBRE**: Nombre del evento en mayúsculas

## ACTUALIZACIÓN FEBRERO 2025

### 1. ESTRUCTURA DE CARPETAS
- ✅ Ruta automática: ADOCA/MES/FECHA/TIPO_NOMBRE/
- ✅ Meses en español mayúsculas
- ✅ Fecha formato DD-MM-AA
- ✅ Quinceaños → XV

### 2. AVISO DE CALIDAD
- ✅ Banner amarillo visible bajo el botón de subir
- ✅ Texto: "⚠️ La calidad de las fotos varía según la resolución y el equipo móvil utilizado."

### 3. ACCESO RESTRINGIDO
- ✅ Ruta `/live` requiere código QR o link directo
- ✅ Sin código válido → Pantalla de entrada
- ✅ "Salir del evento" → Redirige a landing

### 4. MURO COLABORATIVO
- ✅ Todos los invitados ven fotos de todos
- ✅ Actualización automática cada 10 segundos
- ✅ Tabs: "📸 Subir" y "👑 Galería"

### 5. BARRA DE REACCIONES
- ✅ Emojis: 👸 ✨ 👑 💃 📸
- ✅ Contador numérico por emoji

### 6. PRECIOS NETO
- ✅ $700 MXN (NETO) - Básico
- ✅ $1,000 MXN (NETO) - Estándar
- ✅ $1,500 MXN (NETO) - Premium

## REGLA ADOCA
- Precio Neto SIEMPRE activo
- NO modificar DNS/Squarespace

## Test Results (Febrero 2025)
- Estructura Carpetas: 100% ✅
- Aviso de Calidad: 100% ✅
- Acceso Restringido: 100% ✅
- Muro Colaborativo: 100% ✅
- Reacciones: 100% ✅
