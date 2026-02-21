# PICPARTYLIVE - Product Requirements Document

## Descripción del Producto
PICPARTYLIVE es una plataforma de galería de fotos en vivo para eventos, que permite a los invitados subir fotos desde el navegador y verlas en tiempo real en la pantalla del evento.

## Stack Tecnológico
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python, Pydantic
- **Database**: MongoDB
- **File Storage**: Cloudinary (Cloud: dpvliv2wl)
- **Authentication**: JWT (Admin)
- **PDF Generation**: jsPDF

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
- Usuario: `OCTAVIO`
- Password: `CHELO1980`

## Funcionalidades Implementadas

### 1. Galería de Eventos (Actualizada Dic 2025)
- Tarjetas de evento limpias: Solo **Nombre** y **Fecha** (sin Ciudad ni Horario)
- Botón header: "EN VIVO" en dorado negrita (antes "LIVE")
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
