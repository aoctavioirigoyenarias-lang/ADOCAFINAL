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

## ACTUALIZACIÓN DICIEMBRE 2025 - Configuración Final de Textos y Lógica de Venta

### 12. PRECIOS ACTUALIZADOS EN COTIZADOR
- ✅ **$700** - Súper Precio (Nota: Al contratar Cabina, 360 o Key Moments)
- ✅ **$1,000** - Promo Expo (Nota: Precio temporal por tiempo limitado)
- ✅ **$1,500** - Precio Regular (NETO)

### 13. DESCRIPCIÓN DEL MURO EN VIVO
- ✅ "Incluye software de proyección en tiempo real para pantallas o TV. No incluye equipo físico (pantallas/cableado)."

### 14. ALMACENAMIENTO ILIMITADO
- ✅ Cambiado de "Alta Calidad" a "Almacenamiento de fotos ILIMITADO"
- ✅ Aclaración: "La resolución depende del celular del invitado"

### 15. BANNER DEMO (Código 9022)
- ✅ Banner amarillo pulsante para código 9022
- ✅ Texto: "⚠️ Galería de Prueba: El contenido y las interacciones se eliminan automáticamente cada 24 horas."

### 16. MARCA PICPARTYLIVE
- ✅ Todas las referencias actualizadas a PICPARTYLIVE (mayúsculas)
- ✅ Tab del admin: "🔴 PICPARTYLIVE"
- ✅ Título sección: "PICPARTYLIVE - Muro en Vivo"

## Test Results (Diciembre 2025 - Final)
- Precios Actualizados: 100% ✅
- Descripción Proyección: 100% ✅
- Almacenamiento ILIMITADO: 100% ✅
- Banner DEMO 9022: 100% ✅
- Marca PICPARTYLIVE: 100% ✅

## ACTUALIZACIÓN DICIEMBRE 2025 - Reparación Integral

### 17. CÓDIGO DE EVENTO AUTOMÁTICO
- ✅ Generación automática de código numérico de 4 dígitos
- ✅ Validación de unicidad antes de asignar
- ✅ Eliminado campo manual de código

### 18. MENSAJES DE SUBIDA MEJORADOS
- ✅ Éxito: "✅ ¡Foto subida con éxito! Mírala en la pantalla. 📺"
- ✅ Error específico: "📦 Archivo muy pesado (máx 10MB)"
- ✅ Error específico: "⏱️ Tiempo de espera agotado"
- ✅ Error específico: "📡 Error de conexión: Revisa tu internet"

### 19. CONTADOR DE FOTOS REAL-TIME
- ✅ Badge "📸 X fotos" visible en cada evento del admin
- ✅ Actualización automática cada 10 segundos
- ✅ Animación pulse para indicar datos en vivo

### 20. CREDENCIALES ADMIN VISIBLES
- ✅ Hints de usuario/contraseña en formulario de login
- ✅ Credencial de respaldo: ADMIN / admin123

## ACTUALIZACIÓN DICIEMBRE 2025 - Interfaz Maestra PICPARTYLIVE

### 21. MENÚ PRINCIPAL (3 BOTONES)
- ✅ 📺 **PROYECTAR EN TV** - Acceso al selector de efectos
- ✅ 📸 **VER GALERÍA** - Ver fotos y subir nuevas
- ✅ 📥 **DESCARGAR EVENTO** - Protegido con contraseña admin

### 22. SELECTOR DE EFECTOS DE PROYECCIÓN
- ✅ **Slideshow** - Una foto con transición suave (Fade) cada 5 segundos
- ✅ **Mosaico** - Cuadrícula dinámica de fotos
- ✅ **Pop-up** - Nueva foto aparece en grande por 5 segundos
- ✅ Botón de **Pantalla Completa**
- ✅ Logo PICPARTYLIVE en esquina
- ✅ Polling cada 3 segundos en modo proyección

### 23. AUTOMATIZACIÓN
- ✅ Sistema autosuficiente para cliente
- ✅ Mensajes de éxito claros: "✅ ¡Foto subida con éxito! Mírala en la pantalla."
- ✅ Contador de fotos en galería y menú

### 24. ESTABILIDAD
- ✅ Base de datos MongoDB conectada y funcionando
- ✅ Build exitoso sin errores
- ✅ Servicios activos (backend + frontend)

## Próximas Tareas (Backlog)

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
- P2: Descarga ZIP de todas las fotos de un evento (actualmente abre Cloudinary)
- P2: Ruta `/live-tv` para proyectores con feed animado

## ACTUALIZACIÓN DICIEMBRE 2025 - Reconstrucción Cotizador y Smart View

### 25. COTIZADOR RECONSTRUIDO CON PRECIOS REALES
- ✅ **Cabina de Fotos**: 2h ($2,699), 3h ($3,299), 4h ($3,799), 5h ($4,699) NETO
- ✅ **Video 360°**: 2h ($3,299), 3h ($3,899), 4h ($4,499), 5h ($4,999) NETO
- ✅ **PICPARTYLIVE**: $700 (Súper Precio con servicio), $1,000 (Promo Expo), $1,500 (Normal)
- ✅ Interface mobile-first con botones de selección de horas
- ✅ Cálculo automático de subtotal, descuento y total NETO
- ✅ Descarga de PDF con folio único

### 26. GENERACIÓN DE FOLIO ÚNICO
- ✅ Formato: COT-{timestamp}-{random} (ej: COT-MLRF1QBG-O6D)
- ✅ Se genera al calcular cotización
- ✅ Se guarda en backend con todos los datos del cliente

### 27. VALIDACIÓN DE TELÉFONO OBLIGATORIO
- ✅ Campo teléfono marcado como obligatorio en cotizador
- ✅ Validación mínimo 10 dígitos
- ✅ Mensaje: "Los últimos 4 dígitos serán tu clave de descarga"

### 28. SEGURIDAD DE DESCARGA ACTUALIZADA
- ✅ **Ya NO se usa CHELO1980** para descargar fotos
- ✅ La clave son los **últimos 4 dígitos del teléfono del cliente**
- ✅ Campo client_phone agregado al modelo LiveSession
- ✅ Input de descarga solo acepta 4 dígitos numéricos

### 29. LANDING PAGE DE VENTAS EN /live
- ✅ Se muestra cuando se accede a /live SIN código
- ✅ Hero section con badge PICPARTYLIVE animado
- ✅ CTA: "✨ Quiero PICPARTYLIVE en mi fiesta"
- ✅ Botón demo con código 9022
- ✅ Features: Sin Apps, Proyección en Vivo, Almacenamiento Ilimitado
- ✅ Sección de precios NETO ($700, $1,000, $1,500)

### 30. SMART VIEW (Móvil vs PC)
- ✅ **Móvil (< 768px)**: Va directamente a la galería/subida de fotos
- ✅ **PC/Tablet (>= 768px)**: Muestra el menú maestro (Proyectar, Galería, Descargar)
- ✅ Detección automática de dispositivo al unirse al evento

### 31. CAMPO TELÉFONO EN ADMIN
- ✅ "Teléfono del Cliente *" con etiqueta "(Clave de descarga)"
- ✅ Placeholder: "10 dígitos - Ej: 5512345678"
- ✅ Nota: "Los últimos 4 dígitos serán la clave para descargar las fotos"
- ✅ Validación obligatoria al crear sesión Live

### 32. ENDPOINT /api/quotes
- ✅ POST /api/quotes - Crear cotización con folio
- ✅ GET /api/quotes - Listar todas las cotizaciones
- ✅ GET /api/quotes/{folio} - Obtener por folio
- ✅ Campos: folio, cliente, telefono, servicio, horas, precios, descuento, total

## Test Results (Diciembre 2025 - Reconstrucción)
- Cotizador Precios Cabina: 100% ✅
- Cotizador Precios Video 360: 100% ✅
- Cotizador Precios PICPARTYLIVE: 100% ✅
- Validación Teléfono: 100% ✅
- Generación Folio: 100% ✅
- Landing Page /live: 100% ✅
- Smart View: 100% ✅
- Campo Teléfono Admin: 100% ✅
- Endpoint /api/quotes: 100% ✅

## ACTUALIZACIÓN FEBRERO 2026 - Ajustes de Privacidad

### 33. CREDENCIALES ADMIN OCULTAS
- ✅ Eliminados hints "Usuario: OCTAVIO" y "Contraseña: CHELO1980" del login
- ✅ Eliminada credencial de backup (admin/admin123)
- ✅ Login limpio sin exposición de credenciales

### 34. FIX REACCIONES EMOJIS
- ✅ Corregido: usaba `photo._id` (MongoDB) en lugar de `photo.id` (UUID)
- ✅ Reacciones ahora funcionan correctamente en la galería

### 35. VISUALIZACIÓN CLAVE DE DESCARGA EN ADMIN (Febrero 2026)
- ✅ Badge naranja "🔑 Clave descarga: XXXX" en cada evento
- ✅ Botón de copiar clave al portapapeles
- ✅ Si no hay teléfono: "⚠️ Sin teléfono (descarga bloqueada)"
- ✅ Teléfono obligatorio al crear eventos (validación 10 dígitos)

### 36. PRIVACIDAD TOTAL (Febrero 2026)
- ✅ Eliminados hints de credenciales del login
- ✅ Header admin: "🔐 Sesión activa" (no muestra nombre de usuario)
- ✅ Toast de login: "🔐 Acceso autorizado" (no muestra nombre)
- ✅ Ninguna credencial visible en la interfaz

### 37. BOTÓN LIVE → LANDING DE VENTAS
- ✅ Ruta /picpartylive redirige a PicPartyLiveLanding (ventas)
- ✅ Ruta /live redirige a PicPartyLive (galería con código)
- ✅ Precios NETO visibles: $700, $1,000, $1,500

### 38. ORDEN DE SESIONES POR FECHA DE CREACIÓN
- ✅ Sesiones ordenadas por `created_at` descendente
- ✅ Evento más reciente aparece primero en la lista

### 39. AJUSTES FINALES COTIZADOR (Febrero 2026)
- ✅ Teléfono NO obligatorio (placeholder: "10 dígitos (opcional)")
- ✅ Eliminado aviso de "clave de descarga" del cotizador
- ✅ Descuento sin tope (cambio de "Máximo 50%" a "Negociación directa")
- ✅ Texto empático en campo Salón/Lugar sobre requisitos de internet/pantalla

### 40. OPTIMIZACIÓN PROYECCIÓN SLIDESHOW/MOSAICO
- ✅ Fade transitions suaves sin parpadeos negros
- ✅ Pre-carga de imágenes para soporte de 50+ fotos
- ✅ Contador de slides visible (ej: "12 / 45")
- ✅ Animación fadeInMosaic para efecto mosaico

