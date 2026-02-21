# PICPARTYLIVE - Product Requirements Document

## Descripción del Producto
PICPARTYLIVE es una plataforma de galería de fotos en vivo para eventos, que permite a los invitados subir fotos desde el navegador y verlas en tiempo real en la pantalla del evento.

## Stack Tecnológico
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python, Pydantic
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Authentication**: JWT (Admin)
- **PDF Generation**: jsPDF

## Paleta de Colores (Premium Theme)
- **Morado Noche** (`--premium-night: #0d0a14`): Fondo principal
- **Púrpura Premium** (`--premium-purple: #1a1025`): Fondos secundarios
- **Dorado Elegante** (`--premium-gold: #d4af37`): Acentos, botones CTA
- **Dorado Claro** (`--premium-gold-light: #e8c968`): Hover states
- **Blanco Perla** (`--premium-pearl: #f5f3f0`): Texto principal
- **Perla Muted** (`--premium-pearl-muted: #c9c5c0`): Texto secundario

## Rutas de la Aplicación
- `/` - Galería principal de eventos
- `/cotizador` - Generador de cotizaciones
- `/picpartylive` - Landing page de ventas
- `/live` - Galería en vivo para invitados
- `/admin` - Panel de administración (protegido)

## Credenciales de Admin
- Usuario: `OCTAVIO`
- Password: `CHELO1980`

## Funcionalidades Implementadas

### 1. Panel de Administración (Completado)
- Login seguro con credenciales hardcodeadas
- Gestión de contratos con precios netos
- Generación de PDFs de contratos (2 páginas, B&W optimizado)
- Gestión de sesiones PICPARTYLIVE
- Sincronización con Cloudinary
- Códigos QR para eventos

### 2. Cotizador (Completado)
- Catálogo de precios fijos (Cabina, Video 360, PICPARTYLIVE)
- Descuentos automáticos por combo
- Generación de PDF de cotización
- Folio único por cotización

### 3. Galería en Vivo (Completado)
- Subida de fotos desde navegador
- Galería estilo Instagram (3 columnas)
- Lightbox fullscreen
- Doble-tap para dar like
- Modo proyección (Slideshow, Mosaico, Pop-up)
- Descarga de fotos con contraseña

### 4. Landing Page de Ventas (Completado)
- Hero section con CTA
- Features destacadas
- Precios NETO
- Demo gratuita 24h

### 5. Visual Design (Completado - Diciembre 2025)
- Paleta Premium implementada globalmente
- Dark mode activado
- Botones dorados destacados
- Cards con glassmorphism
- Headers premium con backdrop blur

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
- Solo: $1,000 NETO (Promo Expo)
- Con Cabina/360: $700 NETO (Precio combo)
- Normal: $1,500 NETO

### Key Moments
- 80 piezas: $2,999
- 100 piezas: $3,250
- 140 piezas: $3,499
- 200 piezas: $4,499

## Integraciones de Terceros
- **Cloudinary**: Almacenamiento de fotos (credentials en backend/.env)
- **MongoDB**: Base de datos principal
- **jsPDF**: Generación de PDFs en frontend

## Estructura de Archivos Clave
```
/app/
├── backend/
│   ├── .env                   # Credentials (Cloudinary, MongoDB)
│   ├── server.py              # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js             # Aplicación React completa
│   │   └── index.css          # Estilos Premium + Shadcn
│   ├── tailwind.config.js     # Configuración con colores Premium
│   └── package.json
└── memory/
    └── PRD.md
```

## Tareas Pendientes (Backlog)

### P2 - Refactoring
- [ ] Descomponer `frontend/src/App.js` en componentes modulares
- [ ] Organizar `backend/server.py` en rutas/modelos/servicios
- [ ] Implementar tests automatizados

### P3 - Mejoras Futuras
- [ ] Desarrollar ruta `/live-tv` para proyector
- [ ] Añadir analytics de eventos
- [ ] Implementar notificaciones push

## Changelog

### Diciembre 2025
- ✅ Implementación completa de paleta Premium (Morado Noche + Dorado Elegante)
- ✅ Dark mode activado globalmente
- ✅ Actualización de todos los componentes con nuevos estilos
- ✅ Botón de "Subir Fotos" destacado en dorado

### Versiones Anteriores
- ✅ Sincronización con Cloudinary
- ✅ Galería estilo Instagram con lightbox
- ✅ Generación de contratos PDF profesionales
- ✅ Sistema de cotización con precios NETO
