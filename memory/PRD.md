# PICPARTYLIVE - Product Requirements Document

## Descripción del Producto
PICPARTYLIVE es una plataforma de galería de fotos en vivo para eventos, que permite a los invitados subir fotos desde el navegador y verlas en tiempo real en la pantalla del evento.

## Stack Tecnológico
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python, Pydantic
- **Database**: MongoDB
- **File Storage**: Cloudinary (Cloud: dpvliv2wl)
- **Authentication**: JWT (Admin con roles: ADMIN, VENTAS, STAFF)
- **PDF Generation**: jsPDF (con logo base64 embebido)

## Última Actualización: Febrero 2026

### Cambios Recientes (Sesión Actual)
1. **Campo "Salón" agregado a Contratos** (P0 - Completado)
   - Campo "Salón / Lugar del Evento" visible en formulario de creación/edición
   - Campo incluido en el PDF del contrato (sección datos del cliente)
   - Backend ya soportaba el campo `salon: Optional[str]`

2. **Logo Base64 en todos los PDFs** (P0 - Completado)
   - Constante `PICPARTY_LOGO_BASE64` agregada con imagen optimizada (~59KB)
   - Logo ahora se renderiza correctamente sin problemas de CORS
   - Implementado en: Contratos PDF, Cotizaciones, Recibos, QR PDF

3. **PDF del QR PicPartyLive Mejorado** (P1 - Completado)
   - Datos fiscales agregados: RFC: IIAA8004021A9, Tel: 614 272 5008, octavio@adoca.net
   - Notas legales: almacenamiento 6 meses, proyección en pantallas no es responsabilidad de PicParty
   - Nuevo botón "JPG WhatsApp" para descargar imagen optimizada para compartir por WhatsApp
   - PDF con mejor diseño y más información del evento

## Paleta de Colores (Premium Theme - Actualizada)
- **Morado Noche** (`#1A0B2E`): Fondo principal obligatorio
- **Púrpura Premium** (`#2D1B4E`): Fondos secundarios
- **Dorado Elegante** (`#d4af37`): Acentos, botones CTA (Champagne/Gold)
- **Dorado Claro** (`#e8c968`): Hover states
- **Blanco Perla** (`#f5f3f0`): Texto principal
- **Perla Muted** (`#c9c5c0`): Texto secundario

## Rutas de la Aplicación
- `/` - Galería principal de eventos
- `/cotizador` - Generador de cotizaciones
- `/picpartylive` - Landing page de ventas
- `/live` - Galería en vivo para invitados (Micrositio)
- `/admin` - Panel de administración (protegido)

## Credenciales de Admin
- **Admin**: Usuario: `OCTAVIO` / Password: `CHELO1980`
- **Staff**: Usuario: `STAFF` / Password: `PICPARTY2026`

## Funcionalidades Implementadas

### 0. Control de Acceso por Roles (Nuevo - Febrero 2026)
- **ADMIN (OCTAVIO)**: Acceso completo - Contratos, Reporte Pagos, Galería Pro, PICPARTYLIVE, Cloudinary
- **STAFF**: Vista restringida - Solo "Galería de Eventos por Contrato"
  - Selector de eventos (contratos)
  - Ver info del evento y servicios contratados
  - Campos para pegar links de fotoshare.co (Fotos y Videos)
  - Botón para descargar templates de Cloudinary

### 1. Galería de Eventos (Actualizada Feb 2026)
- Tarjetas de evento limpias: Solo **Nombre** y **Fecha** (sin Ciudad ni Horario)
- **Orden cronológico inverso**: El último evento SUBIDO aparece siempre arriba (ordenado por `created_at` DESC)
- Botón header: "EN VIVO" en dorado negrita (antes "LIVE")
- Muestra TOP 3 eventos más recientes
- Fondo #1A0B2E obligatorio

### 2. Micrositio PICPARTYLIVE - Efecto Instagram
- **Doble Toque (Double Tap)**: Da like a las fotos
- **Corazón blanco animado**: Aparece al centro al dar like
- **Contador de likes**: Pequeño icono de corazón + número debajo de cada foto
- **Fullscreen**: Un toque abre imagen completa sobre fondo negro
- Lightbox con navegación y botón de like

### 3. Cotizador (Actualizado Dic 2025)
- **Campos eliminados**: "Salón / Lugar", "Descuento"
- **Notas legales agregadas**: 
  - "Vigencia: 20 días naturales"
  - "Nota: Puede aplicar costo extra por flete o maniobras"
- Precios NETO mantenidos

### 4. Panel de Administración
- Login seguro con credenciales hardcodeadas
- Gestión de contratos con precios netos
- Generación de PDFs de contratos (2 páginas, B&W optimizado)
- Gestión de sesiones PICPARTYLIVE
- Sincronización con Cloudinary (dpvliv2wl)
- Códigos QR para eventos

## Catálogo de Precios NETO

### Cabina de Fotos
- 2 horas: $2,699
- 3 horas: $3,299
- 4 horas: $3,799
- 5 horas: $4,699

### Video 360°
- 2 horas: $3,299
- 3 horas: $3,899
- 4 horas: $4,499
- 5 horas: $4,999

### PICPARTYLIVE
- **Combo** (con Cabina/360): **$700 NETO**
- Promo Expo (Solo): $1,000 NETO
- Normal: $1,500 NETO

### Key Moments
- 80 piezas: $2,999
- 100 piezas: $3,250
- 140 piezas: $3,499
- 200 piezas: $4,499

## Integraciones de Terceros
- **Cloudinary**: Cloud name `dpvliv2wl` (NO BORRAR)
- **MongoDB**: Base de datos principal
- **jsPDF**: Generación de PDFs en frontend

## Changelog

### 🏁 21 Febrero 2026 - STAFF View & Orden de Eventos (COMPLETADO)
**Sistema de Control de Acceso por Roles y Orden de Lista**

✅ **Orden de Eventos (PRIORITARIO)**:
- Eventos ordenados por `created_at` DESC (último subido primero)
- Backend actualizado: GET /api/events ordena por created_at descendente
- Homepage muestra Top 3 eventos más recientes

✅ **Vista STAFF Restringida**:
- Login separado: STAFF / PICPARTY2026
- Interfaz limitada a "Galería de Eventos por Contrato"
- Selector de eventos muestra todos los contratos con indicadores (✅💰⏳)
- Campos para pegar links de fotoshare.co (Link de FOTOS / Link de VIDEOS)
- Botón "Guardar Links de Fotoshare" (API: PUT /contracts/{id}/links)
- Botón "Abrir Templates en Cloudinary"

✅ **Ticket Fiscal (Recibo PDF)**:
- Incluye links de fotoshare.co bajo título "Tus Fotos y Videos aquí:"
- Datos fiscales del usuario: RFC: IIAA8004021A9 / Adán Octavio Irigoyen Arias
- Altura dinámica del ticket según contenido

✅ **Backend Updates**:
- Modelo Contract: Nuevos campos `link_fotos` y `link_videos`
- Endpoint: PUT /api/contracts/{contract_id}/links

### 🏁 21 Febrero 2026 - DEPLOY FINAL PIC PARTY 2026 (COMPLETADO)
**Sistema de Contratos Profesional - Versión Final**

✅ **Libertad Total de Precios**:
- Campo TOTAL editable (cualquier monto manual)
- Campo Anticipo editable (sin restricciones)
- SALDO calculado en tiempo real (Total - Anticipo)

✅ **PDF Contrato 2 Páginas (Clon MARU)**:
- Página 1: 6 cláusulas legales (OBJETO, PAGO, RESPONSABILIDAD, REQUERIMIENTOS, CANCELACIÓN, USO DE IMAGEN)
- Página 2: Tabla SERVICIOS CONTRATADOS + Desglose Abono/Saldo + Firmas
- Footer: (614) 272 5008 | SINCE 2014 | WWW.PICPARTY.NET
- Folio automático: PIC-2026-[INICIALES][NÚMERO]

✅ **4 Servicios Activos**:
- Cabina de Fotos
- Video 360
- Key Moments
- PicPartyLive
- ❌ Espejo IA (DESHABILITADO)

✅ **Regla de Liquidación**:
- Si Saldo = $0 → Muestra "** SERVICIO TOTALMENTE LIQUIDADO **" en PDF y formulario

### 21 Febrero 2026 - Libertad de Precios y Lógica de Saldo (COMPLETADO)
- ✅ **TOTAL editable**: Campo manual para escribir cualquier cantidad
- ✅ **Anticipo editable**: Campo independiente para el monto recibido
- ✅ **SALDO en tiempo real**: Cálculo automático (TOTAL - Anticipo)
- ✅ **Mensaje de liquidación**: "✓ SERVICIO TOTALMENTE LIQUIDADO" cuando saldo = $0
- ✅ Backend actualizado: `manual_total` tiene prioridad sobre cálculos automáticos
- ✅ PDF: Imprime TOTAL, Anticipo, Saldo y mensaje de liquidación correctamente

### 21 Febrero 2026 - Actualización de Servicios (COMPLETADO)
- ✅ **Espejo IA DESHABILITADO** - Oculto de todas las opciones de selección
- ✅ **4 servicios disponibles**: Cabina de Fotos, Video 360, Key Moments, PicPartyLive
- ✅ Renombrado "Pic Motion 360" → "Video 360" en formulario de contratos
- ✅ Campo "Descuento" eliminado del formulario de contratos
- ✅ PDF actualizado: Header muestra "Cabina de Fotos | Video 360 | Key Moments" (sin Espejo IA)
- ✅ Tabla de SERVICIOS CONTRATADOS en PDF usa nombres correctos

### 21 Febrero 2026 - Clonación PDF Contrato (COMPLETADO)
- ✅ **PDF de 2 páginas clonado** del formato oficial `Contrato_MARU_PIC-2025-OJ5I.pdf`
- ✅ **Página 1**: 6 cláusulas legales exactas (OBJETO, PAGO, RESPONSABILIDAD, REQUERIMIENTOS, CANCELACIÓN, USO DE IMAGEN)
- ✅ **Página 2**: Tabla SERVICIOS CONTRATADOS, resumen de pagos, área de firmas
- ✅ **Sistema de Folio Automático**: Formato `PIC-2026-[INICIALES][NÚMERO]` (ej: PIC-2026-JP36N)
- ✅ **Lógica de Pagos Dinámica**: 
  - Muestra Anticipo recibido y calcula SALDO automáticamente
  - Mensaje "** SERVICIO TOTALMENTE LIQUIDADO **" si saldo = 0
- ✅ **Footer en ambas páginas**: `(614) 272 5008 | SINCE 2014 | WWW.PICPARTY.NET`
- ✅ **Cortesía/Regalo**: Se imprime en el PDF si está incluido
- ✅ Nombre de archivo incluye folio: `Contrato_[CLIENTE]_[FOLIO].pdf`

### Diciembre 2025 - Super Prompt ADOCA.NET
- ✅ Fondo obligatorio #1A0B2E (Morado Noche más profundo)
- ✅ Botón "EN VIVO" en lugar de "LIVE" (dorado, negrita)
- ✅ Tarjetas de evento: solo Nombre y Fecha (eliminado Ciudad/Horario)
- ✅ Doble Toque para Like con corazón blanco animado
- ✅ Contador de likes + icono corazón debajo de cada foto
- ✅ Fullscreen al tocar una vez (fondo negro)
- ✅ Cotizador: eliminado "Salón / Lugar" y "Descuento"
- ✅ Notas legales: "Vigencia: 20 días naturales. Nota: Puede aplicar costo extra por flete o maniobras"
- ✅ Credenciales Cloudinary preservadas (dpvliv2wl)

### Versiones Anteriores
- ✅ Paleta Premium (Morado Noche + Dorado Elegante)
- ✅ Sincronización con Cloudinary
- ✅ Galería estilo Instagram con lightbox
- ✅ Generación de contratos PDF profesionales
- ✅ Sistema de cotización con precios NETO
