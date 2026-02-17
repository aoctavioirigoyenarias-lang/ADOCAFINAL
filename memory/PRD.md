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

## ACTUALIZACIÓN DICIEMBRE 2025 - Branding & Sales Optimization

### 7. BOTONES DE COMPARTIR (Admin Panel)
- ✅ **Copiar Link**: Copia `https://adoca.net/live?code=[CODIGO]` al portapapeles
- ✅ **WhatsApp**: Abre wa.me con mensaje pre-llenado incluyendo el link directo
- ✅ URL mostrada debajo del QR para referencia

### 8. ACCESO DIRECTO CON ?code=
- ✅ Ruta `/live?code=CODIGO` permite acceso directo sin ingresar código
- ✅ Compatible con links compartidos vía WhatsApp o QR
- ✅ Sesión guardada en LocalStorage por 24 horas

### 9. FOOTER DE VENTAS (Guest View)
- ✅ Botón CTA: "✨ ¡Quiero PICPARTYLIVE en mi fiesta!" → /cotizador
- ✅ Branding: "PICPARTYLIVE • adoca.net"
- ✅ Link: "🔒 Seguridad y Privacidad" → Modal informativo

### 10. MODAL DE PRIVACIDAD
- ✅ Control del Anfitrión
- ✅ Fotos Privadas
- ✅ Sin Apps que Descargar
- ✅ Protección de Datos

### 11. QR CODE PDF
- ✅ URL actualizada a `/live?code=[CODIGO]` (consistente con botones)
- ✅ Descarga forzada con Blob URL
- ✅ Link de respaldo si descarga automática falla

## Test Results (Diciembre 2025)
- Admin Login: 100% ✅
- Botones Compartir: 100% ✅
- Precios NETO: 100% ✅
- Acceso Directo ?code=: 100% ✅
- Footer Ventas: 100% ✅
- Modal Privacidad: 100% ✅
- QR PDF Download: 100% ✅

## Próximas Tareas (Backlog)
- P1: Descarga ZIP de todas las fotos de un evento
- P2: Ruta `/live-tv` para proyectores con feed animado
