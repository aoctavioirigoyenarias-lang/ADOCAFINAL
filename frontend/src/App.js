import { useState, useEffect, useCallback, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const SITE_DOMAIN = "adoca.net";
const PICPARTY_LOGO = "https://customer-assets.emergentagent.com/job_a3564e90-ad20-475c-89a1-7a897b2adf08/artifacts/om0qxam1_logo%20pic%20party.png";

// ============ DATEPICKER VISUAL ============
const DatePicker = ({ value, onChange, placeholder = "Seleccionar fecha", className = "" }) => {
  const [open, setOpen] = useState(false);
  
  // Convertir string YYYY-MM-DD a Date object
  const selectedDate = value ? new Date(value + 'T12:00:00') : undefined;
  
  // Formatear fecha para mostrar
  const formatDate = (dateStr) => {
    if (!dateStr) return placeholder;
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-full justify-start text-left font-normal input-premium ${!value ? 'text-pearl-muted' : 'text-pearl'} ${className}`}
        >
          <span className="mr-2">📅</span>
          {formatDate(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-night border-gold/30" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              onChange(`${yyyy}-${mm}-${dd}`);
            }
            setOpen(false);
          }}
          initialFocus
          className="rounded-md border border-gold/20 bg-night text-pearl"
        />
      </PopoverContent>
    </Popover>
  );
};


// ============ COMPONENTE DE TARJETA DE EVENTO ============
const EventCard = ({ event }) => {
  const hasPhoto = event.thumbnail && event.thumbnail.trim() !== "";
  
  const getServiceEmoji = () => {
    if (event.has_photos && event.has_video360) return "📸🎥";
    if (event.has_video360) return "🎥";
    return "📸";
  };

  const AutoCover = () => (
    <div 
      className="w-full h-48 flex flex-col items-center justify-center relative"
      style={{ backgroundColor: event.color || "#7C3AED" }}
    >
      <span className="text-6xl mb-2">{getServiceEmoji()}</span>
      <span className="text-white text-2xl font-black tracking-wider drop-shadow-lg">
        {event.name}
      </span>
    </div>
  );

  return (
    <Card className="card-premium hover:border-gold/50 transition-all cursor-pointer group overflow-hidden">
      <div className="relative overflow-hidden">
        {hasPhoto ? (
          <img src={event.thumbnail} alt={event.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <AutoCover />
        )}
        <div className="absolute top-3 left-3 flex gap-1">
          {event.has_photos && <Badge className="badge-gold text-xs">Fotos</Badge>}
          {event.has_video360 && <Badge className="badge-gold text-xs">360°</Badge>}
        </div>
        <Badge className="absolute top-3 right-3 badge-gold text-xs">{event.date}</Badge>
      </div>
      <CardContent className="pt-4">
        <h4 className="text-xl font-black text-pearl mb-2">{event.name}</h4>
        <div className="flex gap-2">
          {event.fotoshare_url && (
            <a href={event.fotoshare_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full btn-gold text-sm">
                Ver Fotos
              </Button>
            </a>
          )}
          {event.video360_url && (
            <a href={event.video360_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full btn-gold-outline text-sm">Ver 360°</Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============ GALERÍA PRINCIPAL (/) ============
const EventGallery = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState([]);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      if (response.data.length === 0) {
        await axios.post(`${API}/seed-events`);
        const newResponse = await axios.get(`${API}/events`);
        setAllEvents(newResponse.data);
        // TOP 3: El backend ya ordena por created_at DESC (último subido primero)
        setFilteredEvents(newResponse.data.slice(0, 3));
      } else {
        setAllEvents(response.data);
        // TOP 3: El backend ya ordena por created_at DESC (último subido primero)
        setFilteredEvents(response.data.slice(0, 3));
      }
      setEventDates(response.data?.map(e => new Date(e.date + 'T12:00:00')) || []);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      const filtered = allEvents.filter(event => event.date === dateStr);
      setFilteredEvents(filtered);
      if (filtered.length === 0) toast.info("No hay eventos para esta fecha");
    } else {
      // TOP 3: Mostrar los 3 eventos más recientes (ya ordenados por created_at del backend)
      setFilteredEvents(allEvents.slice(0, 3));
    }
  }, [allEvents]);

  const resetFilter = () => {
    setSelectedDate(null);
    // TOP 3: Mostrar los 3 eventos más recientes (ya ordenados por created_at del backend)
    setFilteredEvents(allEvents.slice(0, 3));
  };

  if (loading) return (
    <div className="min-h-screen bg-premium-radial flex items-center justify-center">
      <div className="text-pearl text-xl">Cargando...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-premium-radial">
      {/* Header Premium con Logo PicParty */}
      <header className="header-premium sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-gold">PicParty</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/cotizador">
              <Button className="btn-gold-outline">Cotizar</Button>
            </Link>
            <Link to="/picpartylive">
              <Button className="btn-gold font-black">EN VIVO</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="text-pearl-muted hover:text-gold">⚙️</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 text-gold">
            PicParty
          </h1>
          <p className="text-pearl-muted">Cabina Fotográfica • Memorias que Duran</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendario Buscador */}
          <Card className="card-premium">
            <CardHeader className="pb-2">
              <CardTitle className="text-pearl text-lg flex items-center gap-2">
                Busca tu evento por la fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border border-gold/20 bg-night/50 text-pearl"
                modifiers={{ hasEvent: eventDates }}
                modifiersStyles={{ hasEvent: { backgroundColor: 'rgba(212, 175, 55, 0.3)', borderRadius: '50%' } }}
              />
              {selectedDate && (
                <Button variant="outline" className="w-full mt-3 btn-gold-outline" onClick={resetFilter}>
                  Mostrar todos
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Feed de Eventos */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-pearl">
                {selectedDate ? `Eventos del ${selectedDate.toLocaleDateString('es-MX')}` : "Últimos Eventos"}
              </h3>
              <Badge className="badge-gold">{filteredEvents.length} evento(s)</Badge>
            </div>
            
            {filteredEvents.length === 0 ? (
              <Card className="card-premium border-dashed p-12 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-pearl text-xl font-bold mb-2">Buzón Vacío</h3>
                <p className="text-pearl-muted mb-4">No hay eventos para mostrar</p>
                <Button onClick={resetFilter} className="btn-gold">
                  Ver todos los eventos
                </Button>
              </Card>
            ) : (
              <div className={`grid gap-4 ${filteredEvents.length > 2 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/20 mt-12 py-6 text-center text-pearl-muted">
        <p>© 2025 PicParty - Cabina Fotográfica</p>
      </footer>
    </div>
  );
};

// ============ COTIZADOR COMPLETO - PRECIOS REALES NETO ============
const Cotizador = () => {
  // Datos del cliente - TELÉFONO OBLIGATORIO
  const [clientData, setClientData] = useState({ 
    nombre: "", 
    telefono: "", 
    salon: "", 
    fecha: "", 
    horario: "", 
    descuento: 0 
  });
  
  const [quote, setQuote] = useState(null);
  const [folio, setFolio] = useState(null);
  
  // ADD-ON PICPARTYLIVE - AHORA ES PRIORIDAD 1
  const [includeLive, setIncludeLive] = useState(false);
  
  // Servicio principal seleccionado (AHORA PUNTO 2)
  const [mainService, setMainService] = useState(""); // "cabina" o "video360"
  const [serviceHours, setServiceHours] = useState(0);
  
  // PRECIOS REALES - Cabina de Fotos
  const cabinaPrecios = [
    { horas: 2, precio: 2699 },
    { horas: 3, precio: 3299 },
    { horas: 4, precio: 3799 },
    { horas: 5, precio: 4699 },
  ];
  
  // PRECIOS REALES - Video 360°
  const video360Precios = [
    { horas: 2, precio: 3299 },
    { horas: 3, precio: 3899 },
    { horas: 4, precio: 4499 },
    { horas: 5, precio: 4999 },
  ];

  // Generar folio único
  const generateFolio = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `COT-${timestamp}-${random}`;
  };

  // Obtener precio del servicio principal
  const getServicePrice = () => {
    if (!mainService || !serviceHours) return 0;
    const precios = mainService === "cabina" ? cabinaPrecios : video360Precios;
    const found = precios.find(p => p.horas === serviceHours);
    return found ? found.precio : 0;
  };

  // LÓGICA DE PRECIO PICPARTYLIVE AUTOMÁTICA
  // Si tiene Cabina o Video 360 = $700 NETO
  // Si solo PICPARTYLIVE = $1,000 NETO
  const getLivePrice = () => {
    if (!includeLive) return 0;
    return mainService ? 700 : 1000;
  };

  // Calcular ahorro cuando hay combo
  const getAhorro = () => {
    if (includeLive && mainService) {
      return 1500 - 700; // Precio normal - precio combo = $800
    }
    return 0;
  };

  // Calcular cotización
  const calculateQuote = () => {
    // Validar nombre
    if (!clientData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    
    // Validar que haya seleccionado al menos un servicio
    if (!mainService && !includeLive) {
      toast.error("Selecciona al menos un servicio");
      return;
    }
    
    // Si seleccionó servicio principal, validar horas
    if (mainService && !serviceHours) {
      toast.error("Selecciona las horas del servicio");
      return;
    }
    
    // Calcular precios con nueva lógica
    const servicePrice = getServicePrice();
    const livePrice = getLivePrice();
    const subtotal = servicePrice + livePrice;
    
    const descuentoAmount = subtotal * (clientData.descuento / 100);
    const total = subtotal - descuentoAmount;
    
    const newFolio = generateFolio();
    setFolio(newFolio);
    setQuote({ 
      servicePrice,
      livePrice,
      subtotal, 
      descuento: descuentoAmount, 
      total, 
      descuentoPct: clientData.descuento,
      mainService,
      serviceHours,
      livePackage: livePrice
    });
    
    toast.success(`✅ Cotización generada - Folio: ${newFolio}`);
    
    // Guardar en backend
    saveQuoteToBackend(newFolio, servicePrice, livePrice, subtotal, descuentoAmount, total);
  };

  const saveQuoteToBackend = async (newFolio, servicePrice, livePrice, subtotal, descuentoAmount, total) => {
    try {
      await axios.post(`${API}/quotes`, {
        folio: newFolio,
        cliente: clientData.nombre,
        telefono: clientData.telefono,
        salon: clientData.salon || null,
        fecha_evento: clientData.fecha || null,
        servicio_principal: mainService || null,
        horas: serviceHours || null,
        precio_servicio: servicePrice,
        picpartylive: includeLive ? (mainService ? "Combo $700" : "Solo $1,000") : "No",
        picpartylive_precio: livePrice,
        descuento_pct: clientData.descuento,
        descuento_monto: descuentoAmount,
        subtotal: subtotal,
        total: total
      });
    } catch (e) { 
      console.error("Error guardando cotización:", e); 
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);

  const downloadPDF = async () => {
    if (!quote || !folio) {
      toast.error("Primero genera la cotización");
      return;
    }

    toast.info("Generando PDF optimizado para impresión...");
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // === HEADER B&W - Gris claro 10% ===
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo imagen gráfica esquina izquierda
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise((resolve) => { logoImg.onload = resolve; setTimeout(resolve, 2000); });
      pdf.addImage(logoImg, 'PNG', 12, 5, 40, 40);
    } catch(e) {}
    
    pdf.setFontSize(28);
    pdf.setTextColor(30, 30, 30);
    pdf.setFont(undefined, 'bold');
    pdf.text("COTIZACION", pageWidth - 20, 25, { align: 'right' });
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Folio: ${folio}`, pageWidth - 20, 38, { align: 'right' });
    
    // Info del cliente
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    let y = 65;
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("DATOS DEL CLIENTE", 20, y);
    y += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    pdf.text(`Nombre: ${clientData.nombre}`, 20, y); y += 6;
    pdf.text(`Telefono: ${clientData.telefono}`, 20, y); y += 6;
    if (clientData.salon) { pdf.text(`Salon: ${clientData.salon}`, 20, y); y += 6; }
    if (clientData.fecha) { pdf.text(`Fecha del Evento: ${clientData.fecha}`, 20, y); y += 6; }
    
    y += 10;
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("DETALLE DE SERVICIOS", 20, y);
    y += 10;
    
    // Tabla de servicios - Cabecera gris claro 10%
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, y - 5, pageWidth - 40, 8, 'F');
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.text("Concepto", 25, y);
    pdf.text("Precio Neto", pageWidth - 45, y, { align: 'right' });
    y += 10;
    
    pdf.setFont(undefined, 'normal');
    
    // Servicio principal
    if (quote.mainService && quote.serviceHours) {
      const serviceName = quote.mainService === "cabina" ? "Cabina de Fotos" : "Video 360";
      pdf.text(`${serviceName} (${quote.serviceHours} horas)`, 25, y);
      pdf.text(formatCurrency(quote.servicePrice), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    // PICPARTYLIVE
    if (quote.livePrice > 0) {
      const pkgLabel = quote.livePackage === 700 ? "Super Precio (con servicio)" : quote.livePackage === 1000 ? "Promo Expo" : "Regular";
      pdf.text(`PICPARTYLIVE - ${pkgLabel}`, 25, y);
      pdf.text(formatCurrency(quote.livePrice), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    y += 5;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(20, y, pageWidth - 20, y);
    y += 8;
    
    // Subtotal
    pdf.text("Subtotal:", 25, y);
    pdf.text(formatCurrency(quote.subtotal), pageWidth - 45, y, { align: 'right' });
    y += 7;
    
    // Descuento si aplica (gris oscuro, no naranja)
    if (quote.descuentoPct > 0) {
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Descuento (${quote.descuentoPct}%):`, 25, y);
      pdf.text(`-${formatCurrency(quote.descuento)}`, pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    // Total Neto - Recuadro gris oscuro
    y += 3;
    pdf.setFillColor(60, 60, 60);
    pdf.rect(20, y - 5, pageWidth - 40, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("TOTAL NETO:", 25, y + 3);
    pdf.text(formatCurrency(quote.total), pageWidth - 45, y + 3, { align: 'right' });
    
    // Footer
    y = 250;
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont(undefined, 'normal');
    pdf.text("* Todos los precios son NETOS. Cotizacion valida por 15 dias.", pageWidth / 2, y, { align: 'center' });
    pdf.text("PicParty - Cabina Fotografica | adoca.net", pageWidth / 2, y + 5, { align: 'center' });
    
    pdf.save(`Cotizacion_${folio}.pdf`);
    toast.success("PDF descargado correctamente");
  };

  // Seleccionar servicio y horas
  const selectService = (service, hours) => {
    setMainService(service);
    setServiceHours(hours);
  };

  return (
    <div className="min-h-screen bg-premium-radial">
      <header className="header-premium sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10 object-contain" />
            <span className="text-lg font-bold text-gold">Cotizador</span>
          </Link>
          <Link to="/"><Button className="btn-gold-outline">← Inicio</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-pearl mb-2">Cotiza tu Evento</h1>
          <Badge className="badge-gold">Precios Netos</Badge>
        </div>

        <div className="space-y-6">
          {/* ========== PASO 1: PICPARTYLIVE (PRIORIDAD) ========== */}
          <Card className="card-premium border-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-pearl text-xl flex items-center gap-2">
                <span className="bg-gold text-night w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-gold">PICPARTYLIVE</span>
                <Badge className="badge-gold text-xs ml-2">RECOMENDADO</Badge>
              </CardTitle>
              <CardDescription className="text-pearl-muted">
                Muro en vivo con almacenamiento ILIMITADO por 6 meses. Software de proyección en tiempo real. ¡Cero aplicaciones!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant={includeLive ? "default" : "outline"}
                  className={`flex-1 h-16 text-lg ${includeLive ? "btn-gold" : "btn-gold-outline"}`}
                  onClick={() => setIncludeLive(!includeLive)}
                  data-testid="picpartylive-toggle"
                >
                  {includeLive ? "✓ PICPARTYLIVE Incluido" : "Agregar PICPARTYLIVE"}
                </Button>
              </div>
              
              {/* Precio dinámico */}
              {includeLive && (
                <div className="p-4 bg-night/50 rounded-lg border border-gold/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-pearl font-semibold">
                        {mainService ? "¡COMBO ACTIVO!" : "PICPARTYLIVE Solo"}
                      </p>
                      <p className="text-pearl-muted text-sm">
                        {mainService 
                          ? "Al agregar Cabina o Video 360° abajo" 
                          : "Agrega un servicio abajo para precio especial"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-gold">
                        {formatCurrency(getLivePrice())}
                      </span>
                      <span className="text-pearl-muted text-xs block">NETO</span>
                    </div>
                  </div>
                  
                  {/* BANNER DE AHORRO */}
                  {mainService && (
                    <div className="mt-3 p-3 bg-gold/10 border border-gold/30 rounded-lg animate-pulse">
                      <p className="text-gold text-center font-bold text-lg">
                        ¡ESTÁS GANANDO $800 DE DESCUENTO!
                      </p>
                      <p className="text-gold/80 text-center text-xs">
                        Precio normal $1,500 → Tu precio $700
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {!includeLive && (
                <p className="text-pearl-muted text-sm text-center">
                  Precio: <strong className="text-gold">$1,000 NETO</strong> solo, 
                  o <strong className="text-gold">$700 NETO</strong> con Cabina/360
                </p>
              )}
            </CardContent>
          </Card>

          {/* ========== PASO 2: Datos del Cliente ========== */}
          <Card className="card-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-pearl text-lg flex items-center gap-2">
                <span className="bg-gold/80 text-night w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Datos del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-pearl">Nombre *</Label>
                  <Input 
                    placeholder="Tu nombre completo" 
                    value={clientData.nombre}
                    onChange={(e) => setClientData({...clientData, nombre: e.target.value})}
                    className="input-premium"
                    data-testid="cotizador-nombre"
                  />
                </div>
                <div>
                  <Label className="text-pearl">Teléfono</Label>
                  <Input 
                    placeholder="10 dígitos (opcional)" 
                    type="tel"
                    maxLength={10}
                    value={clientData.telefono}
                    onChange={(e) => setClientData({...clientData, telefono: e.target.value.replace(/\D/g, '')})}
                    className="input-premium"
                    data-testid="cotizador-telefono"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-pearl">Fecha del Evento</Label>
                <DatePicker 
                  value={clientData.fecha}
                  onChange={(fecha) => setClientData({...clientData, fecha})}
                  placeholder="Seleccionar fecha"
                />
              </div>
            </CardContent>
          </Card>

          {/* ========== PASO 3: Servicio Principal (Opcional) ========== */}
          <Card className="card-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-pearl text-lg flex items-center gap-2">
                <span className="bg-gold/80 text-night w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                Servicio Principal
                <Badge className="badge-gold text-xs">Opcional</Badge>
              </CardTitle>
              <CardDescription className="text-pearl-muted">Selecciona un servicio (opcional si solo quieres PICPARTYLIVE)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cabina de Fotos */}
              <div className="space-y-2">
                <p className="text-gold font-semibold flex items-center gap-2">
                  <span className="text-xl">📸</span> Cabina de Fotos
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {cabinaPrecios.map(({ horas, precio }) => (
                    <Button 
                      key={`cabina-${horas}`}
                      variant={mainService === "cabina" && serviceHours === horas ? "default" : "outline"}
                      className={`h-auto py-3 ${mainService === "cabina" && serviceHours === horas ? "btn-gold" : "btn-gold-outline"}`}
                      onClick={() => selectService("cabina", horas)}
                      data-testid={`cabina-${horas}h`}
                    >
                      <div className="text-center">
                        <div className="font-bold">{horas}h</div>
                        <div className="text-lg font-black">{formatCurrency(precio)}</div>
                        <div className="text-[10px] opacity-70">NETO</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Video 360° */}
              <div className="space-y-2 pt-4 border-t border-gold/20">
                <p className="text-gold font-semibold flex items-center gap-2">
                  <span className="text-xl">🎥</span> Video 360°
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {video360Precios.map(({ horas, precio }) => (
                    <Button 
                      key={`360-${horas}`}
                      variant={mainService === "video360" && serviceHours === horas ? "default" : "outline"}
                      className={`h-auto py-3 ${mainService === "video360" && serviceHours === horas ? "btn-gold" : "btn-gold-outline"}`}
                      onClick={() => selectService("video360", horas)}
                      data-testid={`video360-${horas}h`}
                    >
                      <div className="text-center">
                        <div className="font-bold">{horas}h</div>
                        <div className="text-lg font-black">{formatCurrency(precio)}</div>
                        <div className="text-[10px] opacity-70">NETO</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quitar servicio */}
              {mainService && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-pearl-muted text-xs"
                  onClick={() => { setMainService(""); setServiceHours(0); }}
                >
                  Quitar servicio principal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* RESUMEN Y COTIZACIÓN */}
          <Card className="card-premium border-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-gold text-xl">Resumen de Cotización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Desglose */}
              <div className="space-y-2 text-pearl-muted">
                {/* PICPARTYLIVE primero en el resumen */}
                {includeLive && (
                  <div className="flex justify-between items-center py-2 border-b border-gold/20">
                    <span className="text-gold">
                      PICPARTYLIVE 
                      <span className="text-xs ml-2 opacity-70">
                        ({mainService ? "Combo" : "Solo"})
                      </span>
                    </span>
                    <span className="font-bold text-pearl">{formatCurrency(getLivePrice())}</span>
                  </div>
                )}
                
                {mainService && serviceHours > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gold/20">
                    <span className="text-gold">
                      {mainService === "cabina" ? "📸 Cabina de Fotos" : "🎥 Video 360°"} ({serviceHours}h)
                    </span>
                    <span className="font-bold text-pearl">{formatCurrency(getServicePrice())}</span>
                  </div>
                )}
                
                {!mainService && !includeLive && (
                  <p className="text-pearl-muted text-center py-4">Selecciona al menos un servicio</p>
                )}
              </div>
              
              {/* Banner de ahorro en el resumen */}
              {includeLive && mainService && (
                <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-gold text-center font-bold">
                    ¡AHORRO DE $800 APLICADO!
                  </p>
                </div>
              )}
              
              {/* TOTAL */}
              {(mainService || includeLive) && (
                <>
                  <div className="p-4 bg-gold/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gold font-bold text-lg">TOTAL NETO</span>
                      <span className="text-pearl text-3xl font-black">
                        {formatCurrency(getServicePrice() + getLivePrice())}
                      </span>
                    </div>
                  </div>
                  
                  {/* Notas legales */}
                  <div className="p-3 bg-night/50 border border-gold/20 rounded-lg">
                    <p className="text-pearl-muted text-xs leading-relaxed">
                      <strong className="text-gold">Vigencia:</strong> 20 días naturales.<br/>
                      <strong className="text-gold">Nota:</strong> Puede aplicar costo extra por flete o maniobras.
                    </p>
                  </div>
                </>
              )}
              
              {/* Botones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                <Button 
                  onClick={calculateQuote} 
                  className="w-full btn-gold h-12 text-lg"
                  disabled={!mainService && !includeLive}
                  data-testid="generar-cotizacion-btn"
                >
                  Generar Cotización
                </Button>
                
                <Button 
                  onClick={downloadPDF} 
                  className="w-full btn-gold-outline h-12 text-lg"
                  disabled={!quote}
                  data-testid="descargar-pdf-btn"
                >
                  Descargar PDF
                </Button>
              </div>
              
              {/* Folio generado */}
              {folio && (
                <div className="text-center pt-4 border-t border-gold/20">
                  <p className="text-pearl-muted text-sm">Folio de cotización:</p>
                  <p className="text-gold text-xl font-mono font-bold">{folio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// ============ PICPARTY LIVE (MICROSITIO) ============
// ============ PICPARTY LIVE - INTERFAZ COMPLETA CON CLOUDINARY ============
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dpvliv2wl';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'picparty_unsigned';

// Emojis temáticos PicParty
const PICPARTY_EMOJIS = ['👸', '✨', '👑', '💃', '📸'];

// Utilidad para LocalStorage con expiración de 24 horas
const SESSION_STORAGE_KEY = 'picparty_active_session';
const SESSION_EXPIRY_HOURS = 24;

const saveSessionToStorage = (sessionData) => {
  const data = {
    session: sessionData,
    expiry: Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000)
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
};

const getSessionFromStorage = () => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    if (Date.now() > data.expiry) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return data.session;
  } catch {
    return null;
  }
};

const clearSessionStorage = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

// ============ LANDING PAGE DE VENTAS PICPARTYLIVE ============
const PicPartyLiveLanding = () => {
  const navigate = useNavigate();
  const [creatingDemo, setCreatingDemo] = useState(false);
  
  // Crear demo temporal individual (24 horas)
  const createTempDemo = async () => {
    setCreatingDemo(true);
    try {
      // Generar código único para demo
      const demoCode = 'DEMO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Crear sesión demo en backend
      const params = new URLSearchParams({
        code: demoCode,
        event_name: `Demo Temporal ${new Date().toLocaleDateString('es-MX')}`,
        event_type: 'demo',
        event_date: new Date().toISOString().split('T')[0],
        client_phone: '0000000000',
        is_demo: 'true'
      });
      
      await axios.post(`${API}/live/sessions/create?${params.toString()}`);
      
      toast.success(`¡Tu demo privada está lista! Código: ${demoCode}`);
      navigate(`/live?code=${demoCode}`);
    } catch (e) {
      toast.error("Error al crear demo. Intenta de nuevo.");
    }
    setCreatingDemo(false);
  };
  
  return (
    <div className="min-h-screen bg-premium-radial">
      {/* Header Premium */}
      <header className="header-premium sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gold">PicParty</span>
          </div>
          <Link to="/cotizador">
            <Button className="btn-gold">
              Cotizar Ahora
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge animado */}
          <div className="mb-6">
            <Badge className="badge-gold px-4 py-2 text-lg animate-pulse">
              PICPARTYLIVE
            </Badge>
          </div>
          
          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl font-black text-pearl mb-4 leading-tight">
            <span className="text-gold">
              Cero Aplicaciones.
            </span>{" "}
            <br className="hidden md:block" />
            Fotos al Instante.
          </h1>
          
          <p className="text-xl text-pearl-muted mb-8 max-w-2xl mx-auto">
            Tus invitados suben fotos desde el navegador y aparecen al instante en la pantalla del evento. Sin descargas, sin complicaciones.
          </p>
          
          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => navigate('/cotizador')}
              className="h-14 px-8 text-lg font-bold btn-gold"
              data-testid="landing-cotizar-btn"
            >
              Quiero PICPARTYLIVE en mi fiesta
            </Button>
            <Button 
              variant="outline"
              onClick={createTempDemo}
              disabled={creatingDemo}
              className="h-14 px-8 text-lg btn-gold-outline"
              data-testid="landing-demo-btn"
            >
              {creatingDemo ? 'Creando...' : 'Probar GRATIS (24h)'}
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="card-premium p-6 text-center">
              <div className="text-4xl mb-3">♾️</div>
              <h3 className="text-gold font-bold text-lg mb-2">Almacenamiento SIN LÍMITE</h3>
              <p className="text-pearl-muted text-sm">Sube todas las fotos que quieras. Sin restricciones de espacio ni cantidad.</p>
            </Card>
            
            <Card className="card-premium p-6 text-center">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-gold font-bold text-lg mb-2">Vigencia 6 MESES</h3>
              <p className="text-pearl-muted text-sm">Tienes hasta 6 meses para descargar todas tus fotos después del evento.</p>
            </Card>
            
            <Card className="card-premium p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-gold font-bold text-lg mb-2">Fotos al Instante</h3>
              <p className="text-pearl-muted text-sm">Las fotos aparecen en la pantalla en tiempo real desde el navegador. Cero apps.</p>
            </Card>
          </div>
          
          {/* Privacidad */}
          <div className="card-premium border-gold/30 rounded-2xl p-6 mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">🔒</span>
              <h3 className="text-xl font-bold text-gold">Galerías 100% Exclusivas</h3>
            </div>
            <p className="text-pearl-muted">
              Cada evento tiene su propia galería privada. Las fotos <strong className="text-gold">NUNCA se mezclan</strong> con otros clientes. 
              Tu código de acceso es único y solo tus invitados pueden ver y subir fotos.
            </p>
          </div>
          
          {/* Pricing Section */}
          <div className="card-premium rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gold mb-6">Precios NETO</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
                <div className="text-3xl font-black text-gold mb-2">$700</div>
                <div className="text-pearl font-semibold">Súper Precio</div>
                <p className="text-pearl-muted text-sm mt-2">Al contratar Cabina de Fotos o Video 360°</p>
              </div>
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
                <div className="text-3xl font-black text-gold mb-2">$1,000</div>
                <div className="text-pearl font-semibold">Promo Expo</div>
                <p className="text-pearl-muted text-sm mt-2">Precio temporal por tiempo limitado</p>
              </div>
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
                <div className="text-3xl font-black text-gold mb-2">$1,500</div>
                <div className="text-pearl font-semibold">Precio Normal</div>
                <p className="text-pearl-muted text-sm mt-2">PICPARTYLIVE solo (sin servicio adicional)</p>
              </div>
            </div>
          </div>
          
          {/* CTA Final */}
          <div className="text-center">
            <p className="text-pearl-muted mb-4">¿Ya tienes un código de evento?</p>
            <Button 
              variant="outline"
              onClick={() => {
                const code = prompt("Ingresa el código de tu evento:");
                if (code) navigate(`/live?code=${code}`);
              }}
              className="btn-gold-outline"
            >
              Ingresar Código
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gold/20 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-pearl-muted">PICPARTYLIVE • adoca.net</p>
          <p className="text-pearl-muted/60 text-sm mt-2">© 2025 PicParty - Cabina Fotográfica</p>
        </div>
      </footer>
    </div>
  );
};

const PicPartyLive = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Soportar tanto ?event= como ?code= para acceso directo
  const eventCode = searchParams.get('event') || searchParams.get('code');
  const [session, setSession] = useState(null);
  const [code, setCode] = useState(eventCode || "");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [error, setError] = useState("");
  const [showPWABanner, setShowPWABanner] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const fileInputRef = useRef(null);
  
  // === INSTAGRAM-STYLE STATES ===
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [likeAnimation, setLikeAnimation] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState(() => {
    const saved = localStorage.getItem('picparty_liked_photos');
    return saved ? JSON.parse(saved) : [];
  });
  const lastTapRef = useRef(0);
  
  // NUEVOS ESTADOS para Interfaz Maestra
  const [viewMode, setViewMode] = useState("menu"); // menu, gallery, projection, download
  const [projectionEffect, setProjectionEffect] = useState("slideshow"); // slideshow, mosaic, popup
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [newPhotoPopup, setNewPhotoPopup] = useState(null);
  const [downloadPassword, setDownloadPassword] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Detección de dispositivo para Smart View
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es móvil al cargar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // < 768px = móvil
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // ID único para este invitado (anónimo)
  const [visitorId] = useState(() => {
    let id = localStorage.getItem('picparty_visitor_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('picparty_visitor_id', id);
    }
    return id;
  });

  // Cargar fotos del muro colaborativo
  const fetchGalleryPhotos = async (eventCode) => {
    try {
      const response = await axios.get(`${API}/live/photos/${eventCode}`);
      setGalleryPhotos(response.data.photos || []);
    } catch (e) {
      console.error("Error cargando galería:", e);
    }
  };

  // === INSTAGRAM-STYLE FUNCTIONS ===
  
  // Handle double tap for like (Instagram style)
  const handlePhotoTap = (photo, idx) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap - dar like
      handleDoubleTapLike(photo);
    } else {
      // Single tap - abrir lightbox después de delay
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          openLightbox(photo, idx);
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTapRef.current = now;
  };
  
  // Handle double tap like with animation
  const handleDoubleTapLike = (photo) => {
    const photoId = photo.id || photo._id;
    
    // Show heart animation
    setLikeAnimation(photoId);
    setTimeout(() => setLikeAnimation(null), 1000);
    
    // Toggle like
    if (!likedPhotos.includes(photoId)) {
      const newLiked = [...likedPhotos, photoId];
      setLikedPhotos(newLiked);
      localStorage.setItem('picparty_liked_photos', JSON.stringify(newLiked));
      // Send like to server
      addReaction(photoId, '❤️');
    }
  };
  
  // Open lightbox
  const openLightbox = (photo, idx) => {
    setLightboxPhoto(photo);
    setLightboxIndex(idx);
  };
  
  // Close lightbox
  const closeLightbox = () => {
    setLightboxPhoto(null);
  };
  
  // Navigate lightbox
  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next' 
      ? (lightboxIndex + 1) % galleryPhotos.length
      : (lightboxIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    setLightboxIndex(newIndex);
    setLightboxPhoto(galleryPhotos[newIndex]);
  };

  // Agregar reacción a una foto
  const addReaction = async (photoId, emoji) => {
    try {
      await axios.post(`${API}/live/photos/${photoId}/react`, { emoji });
      // Actualizar galería
      if (session) fetchGalleryPhotos(session.code);
    } catch (e) {
      console.error("Error al reaccionar");
    }
  };

  // ============ FUNCIONES PARA PROYECCIÓN ============
  
  // Toggle pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => console.log(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Estado para pre-carga de imágenes
  const [preloadedImages, setPreloadedImages] = useState([]);
  const [nextSlideIndex, setNextSlideIndex] = useState(1);
  const [fadeState, setFadeState] = useState('visible'); // 'visible', 'fading'

  // Pre-cargar imágenes para slideshow fluido
  useEffect(() => {
    if (galleryPhotos.length > 0) {
      const preload = galleryPhotos.slice(0, 50).map(photo => {
        const img = new Image();
        img.src = photo.cloudinary_url;
        return img;
      });
      setPreloadedImages(preload);
    }
  }, [galleryPhotos]);

  // Slideshow automático con fade suave
  useEffect(() => {
    if (viewMode === "projection" && projectionEffect === "slideshow" && galleryPhotos.length > 0) {
      const interval = setInterval(() => {
        setFadeState('fading');
        setTimeout(() => {
          setCurrentSlideIndex(prev => {
            const next = (prev + 1) % galleryPhotos.length;
            setNextSlideIndex((next + 1) % galleryPhotos.length);
            return next;
          });
          setFadeState('visible');
        }, 500); // Tiempo del fade
      }, 5000); // Cambiar cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [viewMode, projectionEffect, galleryPhotos.length]);

  // Detectar nuevas fotos para efecto Pop-up
  const prevGalleryLength = useRef(galleryPhotos.length);
  useEffect(() => {
    if (viewMode === "projection" && projectionEffect === "popup") {
      if (galleryPhotos.length > prevGalleryLength.current && galleryPhotos.length > 0) {
        // Nueva foto detectada
        const newPhoto = galleryPhotos[0]; // La más reciente está primero
        setNewPhotoPopup(newPhoto);
        // Ocultar después de 5 segundos
        setTimeout(() => setNewPhotoPopup(null), 5000);
      }
      prevGalleryLength.current = galleryPhotos.length;
    }
  }, [galleryPhotos, viewMode, projectionEffect]);

  // Polling más rápido en modo proyección (cada 3 segundos)
  useEffect(() => {
    if (viewMode === "projection" && session) {
      const interval = setInterval(() => {
        fetchGalleryPhotos(session.code);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [viewMode, session]);

  // Función para intentar descargar ZIP
  const handleDownload = async () => {
    // Validar contraseña: últimos 4 dígitos del teléfono del cliente
    const clientPhone = session?.client_phone || "";
    const last4Digits = clientPhone.slice(-4);
    
    // Si no hay teléfono configurado, mostrar mensaje
    if (!clientPhone || clientPhone.length < 4) {
      setDownloadError("Este evento no tiene contraseña configurada. Contacta al administrador.");
      return;
    }
    
    if (downloadPassword !== last4Digits) {
      setDownloadError("Contraseña incorrecta. Usa los últimos 4 dígitos del teléfono del cliente.");
      return;
    }
    
    setIsDownloading(true);
    setDownloadError("");
    
    try {
      // Crear un zip con las URLs de las fotos
      const photoUrls = galleryPhotos.map(p => p.cloudinary_url);
      if (photoUrls.length === 0) {
        toast.error("No hay fotos para descargar");
        setIsDownloading(false);
        return;
      }
      
      // Por ahora, abrir galería de Cloudinary en nueva pestaña
      const folderPath = session?.cloudinary_folder || `ADOCA/${session?.event_name}`;
      window.open(`https://cloudinary.com/console/media_library/folders/${encodeURIComponent(folderPath)}`, '_blank');
      toast.success("Abriendo galería en Cloudinary...");
      setViewMode("menu");
    } catch (err) {
      toast.error("Error al descargar");
    }
    setIsDownloading(false);
  };

  // Verificar sesión guardada al iniciar
  useEffect(() => {
    const initSession = async () => {
      // Primero verificar si hay código en URL (prioridad)
      if (eventCode) {
        await handleJoin(eventCode);
        setLoading(false);
        return;
      }
      
      // Si no hay código en URL, buscar sesión guardada
      const savedSession = getSessionFromStorage();
      if (savedSession) {
        // Verificar que la sesión sigue activa en el servidor
        try {
          const response = await axios.get(`${API}/live/scan/${savedSession.code}`);
          setSession(response.data);
          saveSessionToStorage(response.data);
          fetchGalleryPhotos(savedSession.code);
          toast.success(`¡Bienvenido de nuevo a ${response.data.event_name}!`);
          
          // SMART VIEW: Si es móvil, ir directo a galería
          if (window.innerWidth < 768) {
            setViewMode("gallery");
          } else {
            setViewMode("menu");
          }
        } catch {
          clearSessionStorage();
          // No redirigir, la Landing Page se mostrará automáticamente
        }
      }
      setLoading(false);
      
      // Mostrar banner PWA después de 3 segundos
      setTimeout(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone && !localStorage.getItem('pwa_banner_dismissed')) {
          setShowPWABanner(true);
        }
      }, 3000);
    };
    
    initSession();
  }, []);

  // Polling para actualizar galería en tiempo real (cada 10 segundos)
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      fetchGalleryPhotos(session.code);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [session]);

  // Unirse al evento
  const handleJoin = async (codeToUse) => {
    const targetCode = codeToUse || code;
    if (!targetCode.trim()) {
      toast.error("Ingresa un código");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API}/live/scan/${targetCode}`);
      setSession(response.data);
      saveSessionToStorage(response.data);
      fetchGalleryPhotos(targetCode);
      toast.success(`¡Bienvenido a ${response.data.event_name}!`);
      
      // SMART VIEW: Si es móvil, ir directo a galería
      if (window.innerWidth < 768) {
        setViewMode("gallery");
      } else {
        setViewMode("menu"); // PC/Tablet: mostrar menú maestro
      }
    } catch (e) {
      setError("Código inválido o evento no activo");
      toast.error("Código inválido o evento no activo");
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión y redirigir a landing
  const handleLogout = () => {
    clearSessionStorage();
    setSession(null);
    setCode("");
    setUploadedPhotos([]);
    setGalleryPhotos([]);
    navigate('/'); // SEGURIDAD: Redirigir a landing
  };

  // Generar estructura de carpeta Cloudinary: ADOCA/MES/FECHA/TIPO_NOMBRE/
  const generateCloudinaryFolder = () => {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                   'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    // Usar fecha del evento o fecha actual
    const eventDate = session.event_date ? new Date(session.event_date + 'T12:00:00') : new Date();
    const mes = meses[eventDate.getMonth()];
    const dia = String(eventDate.getDate()).padStart(2, '0');
    const mesNum = String(eventDate.getMonth() + 1).padStart(2, '0');
    const anio = String(eventDate.getFullYear()).slice(-2);
    const fechaFormato = `${dia}-${mesNum}-${anio}`; // Ej: 21-03-26
    
    // Tipo de evento en mayúsculas
    const tipoEvento = (session.event_type || 'EVENTO').toUpperCase().replace('QUINCEANIOS', 'XV');
    
    // Nombre del evento limpio
    const nombreEvento = session.event_name
      .toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^A-Z0-9\s]/g, '') // Solo letras y números
      .replace(/\s+/g, '_'); // Espacios a guiones bajos
    
    // Estructura final: ADOCA/MES/FECHA/TIPO_NOMBRE/
    return `ADOCA/${mes}/${fechaFormato}/${tipoEvento}_${nombreEvento}`;
  };

  // Subir foto a Cloudinary y registrar en backend
  const uploadToCloudinary = async (file) => {
    const folderPath = generateCloudinaryFolder();
    
    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('ARCHIVO_GRANDE');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folderPath);
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
          timeout: 60000 // 60 segundos timeout
        }
      );
      
      // Registrar foto en el backend para el muro colaborativo
      await axios.post(`${API}/live/photos`, {
        event_code: session.code,
        cloudinary_url: response.data.secure_url,
        thumbnail_url: response.data.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
        uploader_id: visitorId,
        cloudinary_folder: folderPath
      });
      
      return response.data;
    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error);
      // Propagar el error con más contexto
      if (error.message === 'ARCHIVO_GRANDE') {
        throw error;
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('TIMEOUT');
      } else if (!navigator.onLine) {
        throw new Error('SIN_CONEXION');
      }
      throw error;
    }
  };

  // Manejar selección de archivos (máximo 10 fotos)
  const handleFileSelect = async (e) => {
    let files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limitar a 10 fotos máximo
    if (files.length > 10) {
      toast.warning("Máximo 10 fotos a la vez. Se subirán las primeras 10.");
      files = files.slice(0, 10);
    }
    
    setUploading(true);
    setUploadProgress(0);
    setTotalFiles(files.length);
    setCurrentFileIndex(0);
    
    const uploaded = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i + 1);
      try {
        const result = await uploadToCloudinary(file);
        uploaded.push({
          id: result.public_id,
          url: result.secure_url,
          thumbnail: result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/'),
          name: file.name,
          timestamp: new Date().toLocaleTimeString('es-MX'),
          emoji: PICPARTY_EMOJIS[Math.floor(Math.random() * PICPARTY_EMOJIS.length)]
        });
      } catch (err) {
        // Mensajes de error específicos
        let errorMsg = `❌ Error subiendo ${file.name}`;
        if (err.message === 'ARCHIVO_GRANDE') {
          errorMsg = `📦 ${file.name}: Archivo muy pesado (máx 10MB)`;
        } else if (err.message === 'TIMEOUT') {
          errorMsg = `⏱️ ${file.name}: Tiempo de espera agotado`;
        } else if (err.message === 'SIN_CONEXION') {
          errorMsg = `📡 Error de conexión: Revisa tu internet`;
        }
        errors.push(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
      }
    }
    
    if (uploaded.length > 0) {
      setUploadedPhotos(prev => [...uploaded, ...prev]);
      // Actualizar galería colaborativa
      if (session) fetchGalleryPhotos(session.code);
      
      // Mensaje de éxito claro y visible
      if (uploaded.length === 1) {
        toast.success("✅ ¡Foto subida con éxito! Mírala en la pantalla. 📺", { 
          duration: 5000,
          style: { background: '#10B981', color: 'white', fontWeight: 'bold' }
        });
      } else {
        toast.success(`✅ ¡${uploaded.length} fotos subidas con éxito! Míralas en la pantalla. 📺`, { 
          duration: 5000,
          style: { background: '#10B981', color: 'white', fontWeight: 'bold' }
        });
      }
    }
    
    // Si hubo errores pero también éxitos, mostrar resumen
    if (errors.length > 0 && uploaded.length > 0) {
      toast.warning(`${uploaded.length} subidas, ${errors.length} con error`, { duration: 4000 });
    }
    
    // Si todas fallaron
    if (errors.length > 0 && uploaded.length === 0) {
      toast.error("❌ No se pudo subir ninguna foto. Intenta de nuevo.", { duration: 5000 });
    }
    
    setUploading(false);
    setUploadProgress(0);
    setTotalFiles(0);
    setCurrentFileIndex(0);
    
    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para prompt de instalación PWA
  const handleAddToHome = () => {
    setShowPWABanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
    // Mostrar instrucciones según el dispositivo
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      toast.info("Toca el ícono de compartir ⬆️ y luego 'Añadir a pantalla de inicio'", { duration: 5000 });
    } else {
      toast.info("Toca el menú ⋮ y selecciona 'Añadir a pantalla de inicio'", { duration: 5000 });
    }
  };

  const dismissPWABanner = () => {
    setShowPWABanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-premium-radial flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gold/20 border border-gold/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <img src={PICPARTY_LOGO} alt="PicParty" className="w-16 h-16 object-contain" />
          </div>
          <p className="text-pearl text-xl">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // Si no hay código en URL, ni sesión guardada, mostrar Landing Page de Ventas
  if (!eventCode && !session) {
    return <PicPartyLiveLanding />;
  }

  return (
    <div className="min-h-screen bg-premium-radial">
      {/* Banner PWA flotante */}
      {showPWABanner && (
        <div className="fixed top-14 left-2 right-2 z-50 animate-in slide-in-from-top">
          <div className="bg-gold/90 rounded-xl p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <p className="text-night text-sm font-medium">
                  ¿Subir fotos más rápido? ¡Agrega a inicio!
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={handleAddToHome} className="bg-night text-gold hover:bg-night/90 text-xs px-2 h-7">
                  Agregar
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissPWABanner} className="text-night hover:bg-night/20 text-xs px-2 h-7">
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Premium */}
      <header className="header-premium sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold text-gold">PicParty</span>
            <Badge className="badge-gold animate-pulse text-xs">LIVE</Badge>
          </div>
          {session && (
            <Badge className="badge-gold text-xs">
              {session.code}
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-20">
        {!session ? (
          /* ============ PANTALLA DE ENTRADA ============ */
          <div className="max-w-md mx-auto text-center pt-8">
            
            <div className="w-28 h-28 mx-auto bg-gold/20 border border-gold/30 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-gold/20">
              <img src={PICPARTY_LOGO} alt="PicParty" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-pearl mb-2">Únete a la Fiesta</h1>
            <p className="text-pearl-muted mb-6">Ingresa el código del evento</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <Card className="card-premium">
              <CardContent className="pt-6 space-y-4">
                <Input 
                  placeholder="CÓDIGO"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="input-premium text-center text-2xl h-14 tracking-[0.2em] font-bold"
                  data-testid="event-code-input"
                />
                <Button 
                  onClick={() => handleJoin()}
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold btn-gold"
                  data-testid="join-event-btn"
                >
                  ENTRAR AL EVENTO
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* ============ INTERFAZ MAESTRA PICPARTYLIVE ============ */
          <>
            {/* Banner DEMO TEMPORAL (24 horas) */}
            {(session.is_demo || session.code?.startsWith('DEMO-')) && (
              <div className="max-w-4xl mx-auto mb-4 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-lg">
                <p className="text-amber-300 text-center font-semibold flex items-center justify-center gap-2">
                  <span className="text-2xl">⏰</span>
                  <span>
                    <strong>Muestra temporal:</strong> Esta galería se borrará en 24 horas.<br/>
                    <span className="text-amber-400">¡Contrata el plan completo por 6 meses!</span>
                  </span>
                </p>
                <div className="text-center mt-2">
                  <Button 
                    size="sm"
                    className="btn-gold"
                    onClick={() => window.open('/cotizador', '_blank')}
                  >
                    Ver Precios
                  </Button>
                </div>
              </div>
            )}
            
            {/* Banner legado para código 9022 */}
            {session.code === '9022' && !session.is_demo && (
              <div className="max-w-4xl mx-auto mb-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg animate-pulse">
                <p className="text-amber-300 text-sm text-center font-semibold">
                  ⚠️ Galería de Prueba Pública: El contenido se comparte entre todos los visitantes.
                </p>
              </div>
            )}

            {/* ============ MODO MENÚ PRINCIPAL ============ */}
            {viewMode === "menu" && (
              <div className="max-w-2xl mx-auto px-4">
                {/* Header del evento */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4">
                    <img src={PICPARTY_LOGO} alt="PicParty" className="w-full h-full object-contain" />
                  </div>
                  <h1 className="text-3xl font-black text-pearl mb-2">
                    Bienvenido
                  </h1>
                  <p className="text-2xl font-bold text-gold">
                    {session.event_name}
                  </p>
                  {session.event_type && (
                    <Badge className="mt-3 badge-gold text-base px-4 py-1">
                      {session.event_type === 'boda' && 'Boda'}
                      {session.event_type === 'quinceanios' && 'Quinceaños'}
                      {session.event_type === 'cumpleanos' && 'Cumpleaños'}
                      {session.event_type === 'empresarial' && 'Empresarial'}
                      {session.event_type === 'fiesta' && 'Fiesta'}
                      {session.event_type === 'publico' && 'Evento Público'}
                      {session.event_type === 'otro' && `${session.event_type_custom || 'Evento'}`}
                    </Badge>
                  )}
                  <p className="text-pearl-muted mt-3">{galleryPhotos.length} fotos en la galería</p>
                </div>

                {/* 3 BOTONES PRINCIPALES */}
                <div className="grid gap-4 mb-8">
                  {/* Botón PROYECTAR */}
                  <Button
                    className="h-24 text-xl font-bold card-premium border-gold/30 hover:border-gold/50 text-pearl"
                    onClick={() => setViewMode("projection-select")}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">📺</span>
                      <div className="text-left">
                        <div>PROYECTAR EN TV</div>
                        <div className="text-sm font-normal opacity-80">Mostrar fotos en pantalla grande</div>
                      </div>
                    </div>
                  </Button>

                  {/* Botón VER GALERÍA - DESTACADO EN DORADO */}
                  <Button
                    className="h-24 text-xl font-bold btn-upload-gold"
                    onClick={() => setViewMode("gallery")}
                    data-testid="btn-ver-galeria"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">📸</span>
                      <div className="text-left">
                        <div>SUBIR / VER FOTOS</div>
                        <div className="text-sm font-normal opacity-80">Sube fotos y ve la galería</div>
                      </div>
                    </div>
                  </Button>

                  {/* Botón DESCARGAR */}
                  <Button
                    className="h-24 text-xl font-bold card-premium border-gold/30 hover:border-gold/50 text-pearl"
                    onClick={() => setViewMode("download")}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">📥</span>
                      <div className="text-left">
                        <div>DESCARGAR EVENTO</div>
                        <div className="text-sm font-normal opacity-80">Bajar todas las fotos (Admin)</div>
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Botón salir pequeño */}
                <Button 
                  variant="ghost" 
                  className="w-full text-pearl-muted hover:text-gold text-sm"
                  onClick={handleLogout}
                >
                  ← Salir del evento
                </Button>
              </div>
            )}

            {/* ============ MODO SELECTOR DE EFECTOS ============ */}
            {viewMode === "projection-select" && (
              <div className="max-w-3xl mx-auto px-4">
                <Button 
                  variant="ghost" 
                  className="mb-4 text-pearl-muted hover:text-gold"
                  onClick={() => setViewMode("menu")}
                >
                  ← Volver al menú
                </Button>
                
                <h2 className="text-2xl font-bold text-pearl text-center mb-6">
                  Selecciona el Efecto de Proyección
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Slideshow */}
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 card-premium ${projectionEffect === 'slideshow' ? 'ring-2 ring-gold' : ''}`}
                    onClick={() => setProjectionEffect('slideshow')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">🖼️</div>
                      <h3 className="text-pearl font-bold text-lg">Slideshow</h3>
                      <p className="text-pearl-muted text-sm mt-2">Una foto con transición suave (Fade)</p>
                    </CardContent>
                  </Card>

                  {/* Mosaico */}
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 card-premium ${projectionEffect === 'mosaic' ? 'ring-2 ring-gold' : ''}`}
                    onClick={() => setProjectionEffect('mosaic')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">🔲</div>
                      <h3 className="text-pearl font-bold text-lg">Mosaico</h3>
                      <p className="text-pearl-muted text-sm mt-2">Cuadrícula dinámica de fotos</p>
                    </CardContent>
                  </Card>

                  {/* Pop-up */}
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 card-premium ${projectionEffect === 'popup' ? 'ring-2 ring-gold' : ''}`}
                    onClick={() => setProjectionEffect('popup')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">✨</div>
                      <h3 className="text-pearl font-bold text-lg">Pop-up</h3>
                      <p className="text-pearl-muted text-sm mt-2">Foto nueva aparece grande 5 seg</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold btn-gold"
                  onClick={() => { setViewMode("projection"); fetchGalleryPhotos(session.code); }}
                >
                  Iniciar Proyección
                </Button>
              </div>
            )}

            {/* ============ MODO PROYECCIÓN ============ */}
            {viewMode === "projection" && (
              <div className="fixed inset-0 bg-black z-50">
                {/* Logo PICPARTYLIVE en esquina */}
                <div className="absolute top-4 left-4 z-10">
                  <img src={PICPARTY_LOGO} alt="PicParty" className="h-12 opacity-80" />
                  <span className="text-white/60 text-xs ml-2">LIVE</span>
                </div>

                {/* Botones de control */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-black/50 border-white/30 text-white"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? '⏹️ Salir' : '⛶ Pantalla Completa'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-black/50 border-white/30 text-white"
                    onClick={() => { setViewMode("projection-select"); if (document.fullscreenElement) document.exitFullscreen(); }}
                  >
                    ✕ Cerrar
                  </Button>
                </div>

                {/* Contador de fotos */}
                <div className="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-1 rounded-full">
                  <span className="text-white/80 text-sm">📸 {galleryPhotos.length} fotos</span>
                </div>

                {/* EFECTO SLIDESHOW - Optimizado con fade suave */}
                {projectionEffect === "slideshow" && galleryPhotos.length > 0 && (
                  <div className="w-full h-full flex items-center justify-center p-8 bg-black relative">
                    {/* Imagen actual con fade */}
                    <img 
                      src={galleryPhotos[currentSlideIndex]?.cloudinary_url}
                      alt="Foto del evento"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl absolute"
                      style={{ 
                        transition: 'opacity 0.5s ease-in-out',
                        opacity: fadeState === 'visible' ? 1 : 0
                      }}
                    />
                    {/* Pre-carga de siguiente imagen (invisible) */}
                    {galleryPhotos[nextSlideIndex] && (
                      <img 
                        src={galleryPhotos[nextSlideIndex]?.cloudinary_url}
                        alt=""
                        className="hidden"
                        aria-hidden="true"
                      />
                    )}
                    {/* Contador de slides */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
                      <span className="text-white/80 text-sm">
                        {currentSlideIndex + 1} / {galleryPhotos.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* EFECTO MOSAICO - Optimizado con grid fluido */}
                {projectionEffect === "mosaic" && (
                  <div className="w-full h-full p-4 overflow-hidden bg-black">
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 h-full auto-rows-fr">
                      {galleryPhotos.slice(0, 30).map((photo, idx) => (
                        <div 
                          key={photo.id || idx} 
                          className="relative overflow-hidden rounded-lg"
                          style={{ 
                            opacity: 0,
                            animation: `fadeInMosaic 0.6s ease-out ${idx * 0.05}s forwards`
                          }}
                        >
                          <img 
                            src={photo.thumbnail_url || photo.cloudinary_url}
                            alt="Foto"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EFECTO POP-UP */}
                {projectionEffect === "popup" && (
                  <div className="w-full h-full">
                    {/* Mosaico de fondo */}
                    <div className="absolute inset-0 p-4 opacity-40">
                      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 h-full auto-rows-fr">
                        {galleryPhotos.slice(0, 20).map((photo, idx) => (
                          <div key={photo._id || idx} className="rounded overflow-hidden">
                            <img 
                              src={photo.thumbnail_url || photo.cloudinary_url}
                              alt="Foto"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pop-up de nueva foto */}
                    {newPhotoPopup && (
                      <div className="absolute inset-0 flex items-center justify-center bg-night/90 z-20">
                        <div className="relative" style={{ animation: 'scaleIn 0.5s ease-out' }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gold px-4 py-1 rounded-full text-night font-bold">
                            ¡NUEVA FOTO!
                          </div>
                          <img 
                            src={newPhotoPopup.cloudinary_url}
                            alt="Nueva foto"
                            className="max-w-[80vw] max-h-[80vh] object-contain rounded-xl shadow-2xl ring-4 ring-gold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mensaje de espera */}
                    {!newPhotoPopup && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-pearl/60">
                          <div className="text-6xl mb-4 animate-pulse">📸</div>
                          <p className="text-xl">Esperando nuevas fotos...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sin fotos */}
                {galleryPhotos.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-pearl">
                      <div className="text-8xl mb-4">📷</div>
                      <h3 className="text-2xl font-bold mb-2">Sin fotos aún</h3>
                      <p className="text-pearl-muted">Las fotos aparecerán aquí en tiempo real</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============ MODO GALERÍA (con subida) ============ */}
            {viewMode === "gallery" && (
              <div className="max-w-4xl mx-auto px-4 pb-32">
                <Button 
                  variant="ghost" 
                  className="mb-4 text-pearl-muted hover:text-gold"
                  onClick={() => setViewMode("menu")}
                >
                  ← Volver al menú
                </Button>

                {/* Instagram-style header - Solo nombre y contador */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-pearl">{session.event_name}</h2>
                  <p className="text-pearl-muted text-sm">{galleryPhotos.length} fotos</p>
                </div>

                {/* TABS: Subir / Ver - Estilo minimalista */}
                <div className="flex border-b border-gold/20 mb-4">
                  <button 
                    className={`flex-1 py-3 text-center transition-all ${activeTab === "upload" ? "border-b-2 border-gold text-gold" : "text-pearl-muted"}`}
                    onClick={() => setActiveTab("upload")}
                  >
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                  <button 
                    className={`flex-1 py-3 text-center transition-all ${activeTab === "gallery" ? "border-b-2 border-gold text-gold" : "text-pearl-muted"}`}
                    onClick={() => { setActiveTab("gallery"); fetchGalleryPhotos(session.code); }}
                  >
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                    </svg>
                  </button>
                </div>

                {activeTab === "upload" ? (
                  <Card className="card-premium">
                    <CardContent className="p-6">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        id="photo-upload-gallery"
                      />
                      <label 
                        htmlFor="photo-upload-gallery"
                        className="block cursor-pointer"
                      >
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${uploading ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold hover:bg-gold/5'}`}>
                          {uploading ? (
                            <div className="space-y-3">
                              <div className="text-5xl animate-bounce">📤</div>
                              <p className="text-pearl font-bold">Subiendo foto {currentFileIndex} de {totalFiles}...</p>
                              <div className="w-full bg-night rounded-full h-3">
                                <div className="bg-gold h-3 rounded-full transition-all" style={{width: `${uploadProgress}%`}}></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <svg className="w-16 h-16 mx-auto mb-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <p className="text-gold font-semibold text-lg">Subir fotos</p>
                              <p className="text-pearl-muted text-sm">Toca para seleccionar</p>
                            </>
                          )}
                        </div>
                      </label>
                      
                      {/* Info de almacenamiento */}
                      <p className="text-pearl-muted text-xs text-center mt-4">
                        Almacenamiento ilimitado
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  /* === INSTAGRAM-STYLE GRID === */
                  <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                    {galleryPhotos.map((photo, idx) => {
                      const photoId = photo.id || photo._id;
                      const isLiked = likedPhotos.includes(photoId);
                      const showHeartAnim = likeAnimation === photoId;
                      
                      return (
                        <div 
                          key={photoId || idx} 
                          className="relative aspect-square cursor-pointer overflow-hidden bg-black/20"
                          onClick={() => handlePhotoTap(photo, idx)}
                        >
                          <img 
                            src={photo.thumbnail_url || photo.cloudinary_url} 
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                            loading="lazy"
                            draggable={false}
                          />
                          
                          {/* Heart animation on double tap - CORAZÓN BLANCO GRANDE */}
                          {showHeartAnim && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-24 h-24 text-white drop-shadow-2xl like-heart-animation" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            </div>
                          )}
                          
                          {/* Like counter + heart icon debajo de cada foto */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <div className="flex items-center gap-1">
                              <svg 
                                className={`w-4 h-4 ${isLiked ? 'text-red-500' : 'text-white/80'}`} 
                                fill={isLiked ? 'currentColor' : 'none'} 
                                stroke="currentColor" 
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span className="text-white text-xs">{photo.likes || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {galleryPhotos.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-3">
                          <img src={PICPARTY_LOGO} alt="PicParty" className="w-full h-full object-contain opacity-50" />
                        </div>
                        <p className="text-pearl-muted">No hay fotos aún. Sé el primero en subir.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============ MODO DESCARGA ============ */}
            {viewMode === "download" && (
              <div className="max-w-md mx-auto px-4">
                <Button 
                  variant="ghost" 
                  className="mb-4 text-pearl-muted hover:text-gold"
                  onClick={() => setViewMode("menu")}
                >
                  ← Volver al menú
                </Button>

                <Card className="card-premium">
                  <CardHeader className="text-center">
                    <div className="text-5xl mb-2">📥</div>
                    <CardTitle className="text-pearl">Descargar Evento</CardTitle>
                    <CardDescription className="text-pearl-muted">
                      Descarga todas las fotos del evento. Usa los últimos 4 dígitos del teléfono del cliente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-pearl">Contraseña de Descarga</Label>
                      <Input 
                        type="password"
                        placeholder="Últimos 4 dígitos del teléfono"
                        maxLength={4}
                        value={downloadPassword}
                        onChange={(e) => setDownloadPassword(e.target.value.replace(/\D/g, ''))}
                        className="input-premium mt-1 text-center text-xl tracking-widest"
                      />
                      <p className="text-pearl-muted text-xs mt-1">Ej: Si el teléfono es 5512345678, la clave es 5678</p>
                      {downloadError && (
                        <p className="text-red-400 text-sm mt-1">{downloadError}</p>
                      )}
                    </div>
                    
                    <div className="bg-night/50 p-3 rounded-lg border border-gold/20">
                      <p className="text-pearl-muted text-sm">
                        <strong className="text-gold">Resumen:</strong><br/>
                        • Evento: {session.event_name}<br/>
                        • Fotos disponibles: {galleryPhotos.length}<br/>
                        • Carpeta: {session.cloudinary_folder || 'ADOCA/...'}
                      </p>
                    </div>

                    <Button
                      className="w-full btn-gold"
                      onClick={handleDownload}
                      disabled={isDownloading || galleryPhotos.length === 0}
                    >
                      {isDownloading ? 'Preparando...' : 'Descargar Fotos'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* === INSTAGRAM-STYLE LIGHTBOX === */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
            onClick={closeLightbox}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          {/* Navigation arrows */}
          {galleryPhotos.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </>
          )}
          
          {/* Main image */}
          <div 
            className="max-w-full max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxPhoto.cloudinary_url} 
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onDoubleClick={() => handleDoubleTapLike(lightboxPhoto)}
            />
            
            {/* Like heart animation in lightbox - CORAZÓN BLANCO GRANDE */}
            {likeAnimation === (lightboxPhoto.id || lightboxPhoto._id) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-32 h-32 text-white drop-shadow-2xl like-heart-animation" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            )}
          </div>
          
          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {galleryPhotos.length}
          </div>
          
          {/* Like button */}
          <button 
            className="absolute bottom-4 right-4 p-3"
            onClick={(e) => { e.stopPropagation(); handleDoubleTapLike(lightboxPhoto); }}
          >
            <svg 
              className={`w-8 h-8 transition-all ${likedPhotos.includes(lightboxPhoto.id || lightboxPhoto._id) ? 'text-red-500 scale-110' : 'text-white/70 hover:text-red-400'}`} 
              fill={likedPhotos.includes(lightboxPhoto.id || lightboxPhoto._id) ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Footer con botón de ventas y privacidad - Solo en modo menú y galería */}
      {viewMode !== "projection" && (
        <footer className="fixed bottom-0 left-0 right-0 bg-night/90 backdrop-blur-sm border-t border-gold/20 py-3 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-2">
              {/* Botón de ventas */}
              <Link to="/cotizador">
                <Button 
                  size="sm" 
                  className="btn-gold font-bold shadow-lg"
                >
                  ¡Quiero PICPARTYLIVE en mi fiesta!
                </Button>
              </Link>
              {/* Footer info */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-pearl-muted">PICPARTYLIVE • adoca.net</span>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-gold hover:text-gold/80 underline"
                >
                  Seguridad y Privacidad
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Modal de Privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-night/90 flex items-center justify-center z-50 p-4">
          <Card className="card-premium max-w-md w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                Seguridad y Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-pearl-muted text-sm">
              <div>
                <h4 className="text-gold font-bold mb-1">Control del Anfitrión</h4>
                <p>Solo el anfitrión decide quién puede ver y subir fotos mediante códigos de acceso únicos.</p>
              </div>
              <div>
                <h4 className="text-gold font-bold mb-1">Fotos Privadas</h4>
                <p>Las fotos solo son visibles para invitados autorizados con el código del evento.</p>
              </div>
              <div>
                <h4 className="text-gold font-bold mb-1">Sin Apps que Descargar</h4>
                <p>Acceso directo desde cualquier navegador. Sin instalaciones ni registros.</p>
              </div>
              <div>
                <h4 className="text-gold font-bold mb-1">Protección de Datos</h4>
                <p>Tus fotos se almacenan de forma segura. El anfitrión tiene control total para eliminar contenido.</p>
              </div>
              <Button 
                className="w-full btn-gold mt-4"
                onClick={() => setShowPrivacyModal(false)}
              >
                Entendido
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============ ADMIN PANEL ============
const ADMIN_USER = "OCTAVIO";
const ADMIN_PASS = "CHELO1980";
const STAFF_USER = "STAFF";
const STAFF_PASS = "PICPARTY2026";

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // "admin" o "staff"
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [events, setEvents] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [selectedEventCode, setSelectedEventCode] = useState(null);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [preferences, setPreferences] = useState({ show_net_price: true });
  const [loading, setLoading] = useState(true);
  const [photosCounts, setPhotosCounts] = useState({}); // Contador de fotos por evento
  const [newEvent, setNewEvent] = useState({ name: "", date: "", time: "", description: "", fotoshare_url: "", video360_url: "", location: "", has_photos: true, has_video360: false, color: "" });
  // Links de Fotoshare para Staff
  const [fotoshareLinks, setFotoshareLinks] = useState({ fotos: "", videos: "" });
  const [newSession, setNewSession] = useState({ 
    event_name: "", 
    event_type: "boda",
    event_type_custom: "",
    event_date: "",
    client_phone: "",
    is_vip: false, 
    vip_pass: "" 
  });
  
  // Generar código numérico único de 4 dígitos
  const generateUniqueCode = () => {
    const existingCodes = liveSessions.map(s => s.code);
    let code;
    let attempts = 0;
    do {
      // Generar número entre 1000 y 9999
      code = String(Math.floor(1000 + Math.random() * 9000));
      attempts++;
    } while (existingCodes.includes(code) && attempts < 100);
    return code;
  };
  
  // Tipos de evento disponibles con emojis temáticos
  const eventTypes = [
    { value: "boda", label: "💍 Boda", emoji: "💍" },
    { value: "quinceanios", label: "👑 Quinceaños", emoji: "👑" },
    { value: "cumpleanos", label: "🎂 Cumpleaños", emoji: "🎂" },
    { value: "empresarial", label: "🏢 Empresarial", emoji: "🏢" },
    { value: "publico", label: "✨ Evento Público", emoji: "✨" },
    { value: "fiesta", label: "💃 Fiesta", emoji: "💃" },
    { value: "otro", label: "📸 Otro", emoji: "📸" }
  ];
  
  // Estado para contratos
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractForm, setContractForm] = useState({
    client_name: "", client_phone: "", client_email: "",
    event_name: "", salon: "", event_date: "", event_time: "", service_time: "",
    contract_type: "public",
    // Cabina de Fotos (por horas)
    include_cabina: false, cabina_hours: 0, price_cabina: 0,
    // Video 360 (por horas)
    include_video360: false, video360_hours: 0, price_video360: 0,
    // Key Moments (por piezas)
    include_key_moments: false, key_moments_pieces: 0, price_key_moments: 0,
    // PicPartyLive
    include_live: false, price_live: 0,
    extras: [], discount_amount: 0, special_price: null, notes: "",
    // Cortesía / Regalo
    cortesia: "",
    // TOTAL Y ANTICIPO MANUALES
    manual_total: 0, anticipo_amount: 0,
    // Campos administrativos (uso interno)
    anticipo_status: "pendiente", costo_proveedor: null, fecha_pago: null
  });
  const [contractPreview, setContractPreview] = useState(null);
  const [editingContractId, setEditingContractId] = useState(null); // ID del contrato en edición
  
  // CATÁLOGO DE PRECIOS NETOS
  const CATALOGO_CABINA = { 2: 2699, 3: 3299, 4: 3799, 5: 4699 };
  const CATALOGO_360 = { 2: 3299, 3: 3899, 4: 4499, 5: 4999 };
  const CATALOGO_KEY_MOMENTS = { 80: 2999, 100: 3250, 140: 3499, 200: 4499 };
  
  // Estado para edición de sesiones Live
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({
    event_name: "",
    event_type: "",
    event_type_custom: "",
    event_date: "",
    code: ""
  });
  
  // Estado para edición de eventos de Galería Pro
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventForm, setEditEventForm] = useState({
    name: "",
    date: "",
    fotoshare_url: "",
    video360_url: ""
  });

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
      setUserRole(sessionStorage.getItem("userRole") || "admin");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    const isAdmin = loginUser === ADMIN_USER && loginPass === ADMIN_PASS;
    const isStaff = loginUser === STAFF_USER && loginPass === STAFF_PASS;
    
    if (isAdmin) {
      setIsAuthenticated(true);
      setUserRole("admin");
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("userRole", "admin");
      toast.success("🔐 Acceso ADMIN autorizado");
    } else if (isStaff) {
      setIsAuthenticated(true);
      setUserRole("staff");
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("userRole", "staff");
      toast.success("👤 Acceso STAFF autorizado");
    } else {
      toast.error("Credenciales incorrectas");
    }
  };

  const fetchData = async () => {
    try {
      const [eventsRes, sessionsRes, prefsRes, contractsRes] = await Promise.all([
        axios.get(`${API}/events`),
        axios.get(`${API}/live/sessions/all`),
        axios.get(`${API}/preferences`),
        axios.get(`${API}/contracts`).catch(() => ({ data: [] }))
      ]);
      setEvents(eventsRes.data);
      setLiveSessions(sessionsRes.data);
      setPreferences(prefsRes.data);
      setContracts(contractsRes.data);
      
      // Obtener conteo de fotos para cada sesión
      fetchPhotosCounts(sessionsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  
  // Obtener conteo de fotos por evento (para actualización en tiempo real)
  const fetchPhotosCounts = async (sessions) => {
    const counts = {};
    try {
      await Promise.all(
        sessions.map(async (session) => {
          try {
            const res = await axios.get(`${API}/live/photos/${session.code}`);
            counts[session.code] = res.data?.length || 0;
          } catch {
            counts[session.code] = 0;
          }
        })
      );
      setPhotosCounts(counts);
    } catch (e) {
      console.error("Error fetching photos counts:", e);
    }
  };
  
  // Actualizar conteo de fotos cada 10 segundos (real-time)
  useEffect(() => {
    if (isAuthenticated && liveSessions.length > 0) {
      const interval = setInterval(() => {
        fetchPhotosCounts(liveSessions);
      }, 10000); // Cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, liveSessions]);

  const createEvent = async () => {
    if (!newEvent.name || !newEvent.date) { toast.error("Nombre y fecha requeridos"); return; }
    try {
      await axios.post(`${API}/events`, { ...newEvent, event_type: "gallery" });
      toast.success("Evento de galería creado (solo visualización)");
      setNewEvent({ name: "", date: "", time: "", description: "", fotoshare_url: "", video360_url: "", location: "", has_photos: true, has_video360: false, color: "" });
      fetchData();
    } catch (e) { toast.error("Error"); }
  };

  const deleteEvent = async (id) => {
    if (!confirm("¿Eliminar?")) return;
    await axios.delete(`${API}/events/${id}`);
    toast.success("Eliminado");
    fetchData();
  };

  // Guardar edición de evento de Galería Pro
  const saveEventEdit = async (eventId) => {
    if (!editEventForm.name || !editEventForm.date) {
      toast.error("Nombre y fecha son requeridos");
      return;
    }
    try {
      await axios.put(`${API}/events/${eventId}`, {
        name: editEventForm.name,
        date: editEventForm.date,
        fotoshare_url: editEventForm.fotoshare_url || "",
        video360_url: editEventForm.video360_url || ""
      });
      toast.success("Evento actualizado correctamente");
      setEditingEventId(null);
      setEditEventForm({ name: "", date: "", fotoshare_url: "", video360_url: "" });
      fetchData();
    } catch (e) {
      toast.error("Error al actualizar evento");
    }
  };

  const createLiveSession = async () => {
    if (!newSession.event_name || !newSession.event_date) { 
      toast.error("Nombre y fecha son requeridos"); 
      return; 
    }
    
    // Validar teléfono (obligatorio)
    if (!newSession.client_phone || newSession.client_phone.length < 4) {
      toast.error("El teléfono del cliente es obligatorio (mínimo 4 dígitos para clave)");
      return;
    }
    
    // Generar código automático de 4 dígitos
    const autoCode = generateUniqueCode();
    
    try {
      const params = new URLSearchParams({
        code: autoCode,
        event_name: newSession.event_name,
        event_type: newSession.event_type,
        event_date: newSession.event_date,
        client_phone: newSession.client_phone,
        is_vip: newSession.is_vip
      });
      if (newSession.event_type === "otro" && newSession.event_type_custom) {
        params.append("event_type_custom", newSession.event_type_custom);
      }
      
      await axios.post(`${API}/live/sessions/create?${params.toString()}`);
      toast.success(`✅ Sesión creada - Código: ${autoCode}`);
      setNewSession({ 
        event_name: "", event_type: "boda", 
        event_type_custom: "", event_date: "", client_phone: "", is_vip: false, vip_pass: "" 
      });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Error al crear sesión"); }
  };

  // ============ EDICIÓN DE SESIONES LIVE ============
  const openEditModal = (session) => {
    setEditForm({
      event_name: session.event_name || "",
      event_type: session.event_type || "boda",
      event_type_custom: session.event_type_custom || "",
      event_date: session.event_date || "",
      code: session.code || ""
    });
    setEditingSession(session);
  };

  const closeEditModal = () => {
    setEditingSession(null);
    setEditForm({ event_name: "", event_type: "", event_type_custom: "", event_date: "", code: "" });
  };

  const saveSessionEdit = async () => {
    if (!editingSession) return;
    
    try {
      const params = new URLSearchParams();
      if (editForm.event_name) params.append("event_name", editForm.event_name);
      if (editForm.event_type) params.append("event_type", editForm.event_type);
      if (editForm.event_type === "otro" && editForm.event_type_custom) {
        params.append("event_type_custom", editForm.event_type_custom);
      }
      if (editForm.event_date) params.append("event_date", editForm.event_date);
      if (editForm.code && editForm.code !== editingSession.code) {
        params.append("code", editForm.code);
      }
      
      await axios.put(`${API}/live/sessions/${editingSession.id}?${params.toString()}`);
      toast.success("✅ Evento actualizado correctamente");
      closeEditModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al actualizar");
    }
  };

  // Función para obtener el emoji del tipo de evento
  const getEventTypeInfo = (type, custom) => {
    const found = eventTypes.find(t => t.value === type);
    if (type === "otro" && custom) {
      return { emoji: "✨", label: custom };
    }
    return found || { emoji: "📸", label: "Evento" };
  };

  const printQRPDF = async (session) => {
    toast.info("Generando PDF optimizado para impresión...");
    
    try {
      const qrUrl = `https://${SITE_DOMAIN}/live?code=${session.code}`;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // === FONDO BLANCO PARA IMPRESIÓN B&W ===
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // === LOGO PICPARTY - Esquina superior izquierda fija ===
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = PICPARTY_LOGO;
        await new Promise((resolve, reject) => { 
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          setTimeout(resolve, 3000); 
        });
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          // Logo fijo 40mm ancho, proporción mantenida
          pdf.addImage(logoImg, 'PNG', 15, 10, 40, 40);
        }
      } catch(e) {
        pdf.setFontSize(20);
        pdf.setTextColor(30, 30, 30);
        pdf.setFont(undefined, 'bold');
        pdf.text("PICPARTY", 15, 35);
      }
      
      // === ENCABEZADO - Línea decorativa gris claro ===
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(15, 55, pageWidth - 15, 55);
      
      // Tipo de evento (sin emojis, texto gris oscuro)
      const typeInfo = getEventTypeInfo(session.event_type, session.event_type_custom);
      const cleanLabel = typeInfo.label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(undefined, 'normal');
      pdf.text(cleanLabel.toUpperCase(), pageWidth / 2, 68, { align: 'center' });
      
      // === NOMBRE DEL EVENTO - Negro, prominente ===
      pdf.setFontSize(28);
      pdf.setTextColor(20, 20, 20);
      pdf.setFont(undefined, 'bold');
      pdf.text(session.event_name.toUpperCase(), pageWidth / 2, 85, { align: 'center' });
      
      // === QR EN ALTA RESOLUCIÓN - B&W NÍTIDO ===
      const QRCode = (await import('qrcode')).default;
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 1200;
      qrCanvas.height = 1200;
      
      await QRCode.toCanvas(qrCanvas, qrUrl, { 
        width: 1200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      });
      
      const qrSize = 100;
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      pdf.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 95, qrSize, qrSize);
      
      // === CÓDIGO DEL EVENTO ===
      pdf.setFontSize(16);
      pdf.setTextColor(50, 50, 50);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Código: ${session.code}`, pageWidth / 2, 205, { align: 'center' });
      
      // Fecha del evento
      if (session.event_date) {
        pdf.setFontSize(12);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont(undefined, 'normal');
        const formattedDate = new Date(session.event_date + 'T12:00:00').toLocaleDateString('es-MX', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        pdf.text(formattedDate, pageWidth / 2, 215, { align: 'center' });
      }
      
      // === INSTRUCCIONES - Recuadro gris claro 10% ===
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(20, 225, pageWidth - 40, 25, 3, 3, 'F');
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text("Escanea el código QR con tu celular", pageWidth / 2, 235, { align: 'center' });
      pdf.text("para ver y compartir fotos del evento", pageWidth / 2, 243, { align: 'center' });
      
      // Footer
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text("adoca.net | PicParty - Cabina Fotográfica", pageWidth / 2, 265, { align: 'center' });
      
      // === DESCARGA FORZADA CON BLOB URL ===
      const fileName = `QR_PicParty_${session.event_name.replace(/\s+/g, '_')}_${session.event_date || 'evento'}.pdf`;
      
      // Generar Blob del PDF
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Crear enlace de descarga forzada
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      
      // Forzar click para iniciar descarga
      downloadLink.click();
      
      // Limpiar después de un momento
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      // Mostrar toast con enlace de respaldo
      toast.success(
        <div>
          <p>¡PDF generado!</p>
          <a 
            href={blobUrl} 
            download={fileName}
            style={{ color: '#60a5fa', textDecoration: 'underline', display: 'block', marginTop: '8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            👉 Haz clic aquí si no inició la descarga
          </a>
        </div>,
        { duration: 10000 }
      );
      
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar PDF. Intenta de nuevo.");
    }
  };
  
  // Estado para mostrar enlace de descarga manual
  const [manualDownloadUrl, setManualDownloadUrl] = useState(null);
  const [manualDownloadName, setManualDownloadName] = useState("");

  // ============ FUNCIONES DE CONTRATOS ============
  
  const calculateContractPreview = () => {
    let subtotal = 0;
    
    // Cabina de Fotos
    if (contractForm.include_cabina && contractForm.price_cabina > 0) {
      subtotal += contractForm.price_cabina;
    }
    
    // Pic Motion 360
    if (contractForm.include_video360 && contractForm.price_video360 > 0) {
      subtotal += contractForm.price_video360;
    }
    
    // Key Moments
    if (contractForm.include_key_moments && contractForm.price_key_moments > 0) {
      subtotal += contractForm.price_key_moments;
    }
    
    // PicPartyLive
    if (contractForm.include_live) {
      subtotal += contractForm.price_live || 700;
    }
    
    // Descuento en PESOS ($)
    const discountAmount = contractForm.discount_amount || 0;
    let netPrice;
    
    if (contractForm.contract_type === "special" && contractForm.special_price) {
      netPrice = contractForm.special_price;
    } else {
      netPrice = subtotal - discountAmount;
    }
    
    setContractPreview({ subtotal, discountAmount, netPrice });
  };

  const createContract = async () => {
    // Validación mínima: solo nombre, teléfono y fecha
    if (!contractForm.client_name || !contractForm.client_phone || !contractForm.event_date) {
      toast.error("Complete: Nombre, Teléfono y Fecha");
      return;
    }
    try {
      await axios.post(`${API}/contracts`, contractForm);
      toast.success("Contrato creado exitosamente");
      setShowContractForm(false);
      setContractForm({
        client_name: "", client_phone: "", client_email: "",
        event_name: "", salon: "", event_date: "", event_time: "", service_time: "",
        contract_type: "public",
        include_cabina: false, cabina_hours: 0, price_cabina: 0,
        include_video360: false, video360_hours: 0, price_video360: 0,
        include_key_moments: false, key_moments_pieces: 0, price_key_moments: 0,
        include_live: false, price_live: 0,
        extras: [], discount_amount: 0, special_price: null, notes: "",
        cortesia: "",
        manual_total: 0, anticipo_amount: 0,
        anticipo_status: "pendiente", costo_proveedor: null, fecha_pago: null
      });
      setContractPreview(null);
      fetchData();
    } catch (e) {
      toast.error("Error al crear contrato");
    }
  };

  const deleteContract = async (id) => {
    if (!confirm("¿Eliminar contrato?")) return;
    await axios.delete(`${API}/contracts/${id}`);
    toast.success("Contrato eliminado");
    fetchData();
  };

  // ========== EDITAR CONTRATO EXISTENTE ==========
  const startEditContract = (contract) => {
    setEditingContractId(contract.id);
    setContractForm({
      client_name: contract.client_name || "",
      client_phone: contract.client_phone || "",
      client_email: contract.client_email || "",
      event_name: contract.event_name || "",
      salon: contract.salon || "",
      event_date: contract.event_date || "",
      event_time: contract.event_time || "",
      service_time: contract.service_time || "",
      contract_type: contract.contract_type || "public",
      include_cabina: contract.include_cabina || false,
      cabina_hours: contract.cabina_hours || 0,
      price_cabina: contract.price_cabina || 0,
      include_video360: contract.include_video360 || false,
      video360_hours: contract.video360_hours || 0,
      price_video360: contract.price_video360 || 0,
      include_key_moments: contract.include_key_moments || false,
      key_moments_pieces: contract.key_moments_pieces || 0,
      price_key_moments: contract.price_key_moments || 0,
      include_live: contract.include_live || false,
      price_live: contract.price_live || 700,
      extras: contract.extras || [],
      discount_amount: contract.discount_amount || 0,
      special_price: contract.special_price || null,
      notes: contract.notes || "",
      cortesia: contract.cortesia || "",
      manual_total: contract.net_price || 0,
      anticipo_amount: contract.anticipo_amount || 0,
      anticipo_status: contract.anticipo_status || "pendiente",
      costo_proveedor: contract.costo_proveedor || null,
      fecha_pago: contract.fecha_pago || null
    });
    setShowContractForm(true);
    toast.info(`Editando contrato: ${contract.event_name}`);
  };

  const updateContract = async () => {
    if (!editingContractId) return;
    try {
      await axios.put(`${API}/contracts/${editingContractId}`, contractForm);
      toast.success("Contrato actualizado exitosamente");
      setShowContractForm(false);
      setEditingContractId(null);
      setContractForm({
        client_name: "", client_phone: "", client_email: "",
        event_name: "", salon: "", event_date: "", event_time: "", service_time: "",
        contract_type: "public",
        include_cabina: false, cabina_hours: 0, price_cabina: 0,
        include_video360: false, video360_hours: 0, price_video360: 0,
        include_key_moments: false, key_moments_pieces: 0, price_key_moments: 0,
        include_live: false, price_live: 0,
        extras: [], discount_amount: 0, special_price: null, notes: "",
        cortesia: "",
        manual_total: 0, anticipo_amount: 0,
        anticipo_status: "pendiente", costo_proveedor: null, fecha_pago: null
      });
      setContractPreview(null);
      fetchData();
    } catch (e) {
      toast.error("Error al actualizar contrato");
    }
  };

  const cancelEdit = () => {
    setEditingContractId(null);
    setShowContractForm(false);
    setContractForm({
      client_name: "", client_phone: "", client_email: "",
      event_name: "", salon: "", event_date: "", event_time: "", service_time: "",
      contract_type: "public",
      include_cabina: false, cabina_hours: 0, price_cabina: 0,
      include_video360: false, video360_hours: 0, price_video360: 0,
      include_key_moments: false, key_moments_pieces: 0, price_key_moments: 0,
      include_live: false, price_live: 0,
      extras: [], discount_amount: 0, special_price: null, notes: "",
      cortesia: "",
      manual_total: 0, anticipo_amount: 0,
      anticipo_status: "pendiente", costo_proveedor: null, fecha_pago: null
    });
  };

  const printContractPDF = async (contract) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const formatMXN = (amt) => `$${Number(amt).toLocaleString('es-MX')} MXN`;
    
    // ========== GENERAR FOLIO AUTOMÁTICO ==========
    const generateFolio = () => {
      const year = new Date().getFullYear();
      const initials = contract.client_name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2) || 'XX';
      const randomNum = Math.floor(Math.random() * 90 + 10);
      const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return `PIC-${year}-${initials}${randomNum}${randomChar}`;
    };
    const folio = generateFolio();
    
    // ========== FUNCIÓN PARA FOOTER EN AMBAS PÁGINAS ==========
    const addFooter = (pageNum, totalPages) => {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("(614) 272 5008 | SINCE 2014 | WWW.PICPARTY.NET", pageWidth / 2, pageHeight - 12, { align: 'center' });
      pdf.text(`Pagina ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
    };
    
    // ==================== PÁGINA 1: CLÁUSULAS LEGALES ====================
    
    // === HEADER CON LOGO Y FOLIO ===
    // Logo a la izquierda (incluye texto PICPARTY)
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise(r => { logoImg.onload = r; setTimeout(r, 2000); });
      pdf.addImage(logoImg, 'PNG', margin, 5, 38, 38);
    } catch(e) {
      // Fallback solo si falla la carga de imagen
      pdf.setFontSize(18);
      pdf.setTextColor(26, 11, 46);
      pdf.setFont(undefined, 'bold');
      pdf.text("PIC PARTY", margin, 25);
    }
    
    // Servicios debajo del logo
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text("Cabina de Fotos | Video 360 | Key Moments", margin + 42, 28);
    
    // Folio y etiqueta CONTRATO a la derecha
    pdf.setFontSize(11);
    pdf.setTextColor(26, 11, 46);
    pdf.setFont(undefined, 'bold');
    pdf.text(folio, pageWidth - margin, 15, { align: 'right' });
    pdf.setFillColor(26, 11, 46);
    pdf.roundedRect(pageWidth - margin - 28, 18, 28, 8, 1, 1, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text("CONTRATO", pageWidth - margin - 14, 23.5, { align: 'center' });
    
    // === TÍTULO PRINCIPAL ===
    let y = 48;
    pdf.setTextColor(26, 11, 46);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("CONTRATO DE PRESTACION DE SERVICIOS", pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    // Fecha y lugar
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(60, 60, 60);
    const fechaContrato = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    pdf.text(`Fecha: ${fechaContrato}`, margin, y);
    pdf.text("Chihuahua, Chih.", pageWidth - margin, y, { align: 'right' });
    y += 10;
    
    // === DATOS DEL CLIENTE ===
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y, pageWidth - (margin * 2), 20, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, y, pageWidth - (margin * 2), 20, 'S');
    
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont(undefined, 'bold');
    pdf.text("Cliente:", margin + 3, y + 6);
    pdf.text("Telefono:", margin + 3, y + 12);
    pdf.text("Fecha del Evento:", margin + 3, y + 18);
    
    pdf.setFont(undefined, 'normal');
    pdf.text(contract.client_name || '', margin + 25, y + 6);
    pdf.text(contract.client_phone || '', margin + 25, y + 12);
    
    // Formatear fecha del evento
    let fechaEvento = contract.event_date || '';
    try {
      const dateObj = new Date(contract.event_date);
      fechaEvento = dateObj.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) {}
    pdf.text(fechaEvento, margin + 40, y + 18);
    
    // Hora de inicio (si existe)
    if (contract.service_time) {
      pdf.setFont(undefined, 'bold');
      pdf.text("Hora de Inicio:", pageWidth / 2 + 10, y + 12);
      pdf.setFont(undefined, 'normal');
      pdf.text(contract.service_time, pageWidth / 2 + 40, y + 12);
    }
    
    y += 28;
    
    // === 6 CLÁUSULAS LEGALES (EXACTAS DEL PDF ORIGINAL) ===
    const lineHeight = 4;
    const textWidth = pageWidth - (margin * 2);
    pdf.setFontSize(8);
    
    // Cláusula 1 - OBJETO
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 11, 46);
    pdf.text("1. OBJETO", margin, y);
    y += lineHeight;
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    const cl1 = 'PIC PARTY, representada por Adan Octavio Irigoyen Arias ("EL PRESTADOR"), se compromete a proporcionar los servicios de entretenimiento fotografico detallados en la pagina 2 de este contrato.';
    const lines1 = pdf.splitTextToSize(cl1, textWidth);
    pdf.text(lines1, margin, y);
    y += lines1.length * lineHeight + 5;
    
    // Cláusula 2 - PAGO
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 11, 46);
    pdf.text("2. PAGO", margin, y);
    y += lineHeight;
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    const anticipoMonto = contract.anticipo_amount || 0;
    const saldoPendiente = (contract.net_price || 0) - anticipoMonto;
    const cl2 = `Se requiere un anticipo de ${formatMXN(anticipoMonto)} para confirmar la fecha. El saldo restante (${formatMXN(saldoPendiente)}) debe liquidarse antes o el dia del evento. Sin anticipo, la fecha permanece disponible.`;
    const lines2 = pdf.splitTextToSize(cl2, textWidth);
    pdf.text(lines2, margin, y);
    y += lines2.length * lineHeight + 5;
    
    // Cláusula 3 - RESPONSABILIDAD
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 11, 46);
    pdf.text("3. RESPONSABILIDAD", margin, y);
    y += lineHeight;
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    const cl3 = 'El cliente es responsable de cualquier dano causado al equipo durante el evento por invitados o condiciones del lugar. En caso de dano, el cliente cubrira el costo de reparacion o reposicion.';
    const lines3 = pdf.splitTextToSize(cl3, textWidth);
    pdf.text(lines3, margin, y);
    y += lines3.length * lineHeight + 5;
    
    // Cláusula 4 - REQUERIMIENTOS
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 11, 46);
    pdf.text("4. REQUERIMIENTOS", margin, y);
    y += lineHeight;
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    const cl4 = 'El cliente debe garantizar un espacio minimo de 3x3 metros con conexion electrica 110V estable a menos de 10 metros del area de servicio. EL PRESTADOR llegara 1 hora antes para montaje.';
    const lines4 = pdf.splitTextToSize(cl4, textWidth);
    pdf.text(lines4, margin, y);
    y += lines4.length * lineHeight + 5;
    
    // Cláusula 5 - CANCELACIÓN
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 11, 46);
    pdf.text("5. CANCELACION", margin, y);
    y += lineHeight;
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    const cl5 = 'En caso de cancelacion, el anticipo no es reembolsable. Puede aplicarse a otra fecha sujeto a disponibilidad, con cargo adicional del 15% por reprogramacion.';
    const lines5 = pdf.splitTextToSize(cl5, textWidth);
    pdf.text(lines5, margin, y);
    y += lines5.length * lineHeight + 5;
    
    // Cláusula 6 - USO DE IMAGEN
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 11, 46);
    pdf.text("6. USO DE IMAGEN", margin, y);
    y += lineHeight;
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    const cl6 = 'EL CLIENTE autoriza a PIC PARTY a utilizar fotografias del evento con fines promocionales en redes sociales y material publicitario, respetando la privacidad de los invitados.';
    const lines6 = pdf.splitTextToSize(cl6, textWidth);
    pdf.text(lines6, margin, y);
    
    // Footer página 1
    addFooter(1, 2);
    
    // ==================== PÁGINA 2: SERVICIOS Y FIRMAS ====================
    pdf.addPage();
    
    // === HEADER PÁGINA 2 (mismo estilo) ===
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise(r => { logoImg.onload = r; setTimeout(r, 500); });
      pdf.addImage(logoImg, 'PNG', margin, 5, 30, 30);
    } catch(e) {
      pdf.setFontSize(14);
      pdf.setTextColor(26, 11, 46);
      pdf.setFont(undefined, 'bold');
      pdf.text("PIC PARTY", margin, 20);
    }
    
    // Servicios debajo del logo
    pdf.setFontSize(7);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text("Cabina de Fotos | Video 360 | Key Moments", margin + 33, 23);
    
    // Folio página 2
    pdf.setFontSize(10);
    pdf.setTextColor(26, 11, 46);
    pdf.setFont(undefined, 'bold');
    pdf.text(folio, pageWidth - margin, 15, { align: 'right' });
    
    y = 42;
    
    // === TÍTULO: SERVICIOS CONTRATADOS ===
    pdf.setFillColor(26, 11, 46);
    pdf.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("SERVICIOS CONTRATADOS", margin + 5, y + 5.5);
    y += 12;
    
    // === TABLA DE SERVICIOS ===
    // Cabecera de tabla
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, y, pageWidth - (margin * 2), 7, 'S');
    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    pdf.text("SERVICIO", margin + 5, y + 5);
    pdf.text("PRECIO", pageWidth - margin - 5, y + 5, { align: 'right' });
    y += 7;
    
    // Filas de servicios
    pdf.setFont(undefined, 'normal');
    pdf.setDrawColor(220, 220, 220);
    
    const services = [];
    if (contract.include_cabina && contract.price_cabina > 0) {
      services.push({ name: `Cabina de Fotos - ${contract.cabina_hours || 3} horas`, price: contract.price_cabina });
    }
    if (contract.include_video360 && contract.price_video360 > 0) {
      services.push({ name: `Video 360 - ${contract.video360_hours || 3} horas`, price: contract.price_video360 });
    }
    if (contract.include_key_moments && contract.price_key_moments > 0) {
      services.push({ name: `Key Moments - ${contract.key_moments_pieces || 1} piezas`, price: contract.price_key_moments });
    }
    if (contract.include_live && contract.price_live > 0) {
      services.push({ name: 'PicPartyLive - Galeria Digital', price: contract.price_live });
    }
    
    services.forEach((svc) => {
      pdf.rect(margin, y, pageWidth - (margin * 2), 7, 'S');
      pdf.text(svc.name, margin + 5, y + 5);
      pdf.text(formatMXN(svc.price), pageWidth - margin - 5, y + 5, { align: 'right' });
      y += 7;
    });
    
    y += 5;
    
    // === RESUMEN DE TOTALES ===
    const colRight = pageWidth - margin - 60;
    pdf.setFontSize(9);
    
    // Subtotal
    pdf.setFont(undefined, 'normal');
    pdf.text("Subtotal:", colRight, y);
    pdf.text(formatMXN(contract.subtotal || (contract.net_price + (contract.discount_amount || 0))), pageWidth - margin, y, { align: 'right' });
    y += 6;
    
    // Descuento Especial (si aplica)
    if (contract.discount_amount && contract.discount_amount > 0) {
      pdf.setTextColor(200, 50, 50);
      pdf.setFont(undefined, 'bold');
      pdf.text("Descuento Especial:", colRight, y);
      pdf.text(`-${formatMXN(contract.discount_amount)}`, pageWidth - margin, y, { align: 'right' });
      pdf.setTextColor(40, 40, 40);
      pdf.setFont(undefined, 'normal');
      y += 6;
    }
    
    // TOTAL - Recuadro destacado
    pdf.setFillColor(26, 11, 46);
    pdf.rect(colRight - 5, y, pageWidth - colRight + 5 - margin + 5, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    pdf.text("TOTAL:", colRight, y + 5.5);
    pdf.text(formatMXN(contract.net_price), pageWidth - margin, y + 5.5, { align: 'right' });
    y += 12;
    
    // Anticipo Recibido
    pdf.setTextColor(40, 40, 40);
    pdf.setFont(undefined, 'normal');
    pdf.text("Anticipo Recibido:", colRight, y);
    pdf.text(formatMXN(anticipoMonto), pageWidth - margin, y, { align: 'right' });
    y += 6;
    
    // SALDO - Destacado
    pdf.setFillColor(200, 180, 100);
    pdf.rect(colRight - 5, y, pageWidth - colRight + 5 - margin + 5, 8, 'F');
    pdf.setTextColor(26, 11, 46);
    pdf.setFont(undefined, 'bold');
    pdf.text("SALDO:", colRight, y + 5.5);
    pdf.text(formatMXN(saldoPendiente > 0 ? saldoPendiente : 0), pageWidth - margin, y + 5.5, { align: 'right' });
    y += 14;
    
    // === MENSAJE DE SERVICIO LIQUIDADO ===
    if (saldoPendiente <= 0) {
      pdf.setFillColor(34, 139, 34);
      pdf.rect(margin, y, pageWidth - (margin * 2), 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text("** SERVICIO TOTALMENTE LIQUIDADO **", pageWidth / 2, y + 8, { align: 'center' });
      y += 18;
    }
    
    // === CORTESÍA / REGALO (si existe) ===
    if (contract.cortesia) {
      pdf.setFillColor(255, 250, 230);
      pdf.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
      pdf.setDrawColor(200, 180, 100);
      pdf.rect(margin, y, pageWidth - (margin * 2), 10, 'S');
      pdf.setTextColor(26, 11, 46);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text("CORTESIA INCLUIDA:", margin + 5, y + 6.5);
      pdf.setFont(undefined, 'normal');
      pdf.text(contract.cortesia, margin + 45, y + 6.5);
      y += 16;
    }
    
    // === NOTA DE PRECIOS Y VIGENCIA ===
    y += 5;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont(undefined, 'italic');
    pdf.text("* Precios con IVA incluido", margin, y);
    y += 4;
    pdf.text("* Vigencia: 15 dias naturales a partir de la emision.", margin, y);
    y += 4;
    pdf.text("* Flete/Costos adicionales: Sujetos a cambios fuera de Chihuahua.", margin, y);
    
    // === ÁREA DE FIRMAS ===
    y = pageHeight - 55;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y - 5, pageWidth - (margin * 2), 8, 'F');
    pdf.setTextColor(26, 11, 46);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("FIRMAS DE CONFORMIDAD", pageWidth / 2, y, { align: 'center' });
    y += 12;
    
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.3);
    
    // Firma EL PRESTADOR (izquierda)
    const firmaY = y + 15;
    pdf.line(margin, firmaY, margin + 70, firmaY);
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text("ADAN OCTAVIO IRIGOYEN", margin + 35, firmaY + 5, { align: 'center' });
    pdf.setFont(undefined, 'bold');
    pdf.text("(EL PRESTADOR)", margin + 35, firmaY + 10, { align: 'center' });
    
    // Firma EL CLIENTE (derecha)
    pdf.line(pageWidth - margin - 70, firmaY, pageWidth - margin, firmaY);
    pdf.setFont(undefined, 'normal');
    pdf.text("EL CLIENTE", pageWidth - margin - 35, firmaY + 5, { align: 'center' });
    pdf.setFont(undefined, 'bold');
    pdf.text("(FIRMA)", pageWidth - margin - 35, firmaY + 10, { align: 'center' });
    
    // Footer página 2
    addFooter(2, 2);
    
    // === GUARDAR PDF ===
    const fileName = `Contrato_${contract.client_name.replace(/\s+/g, '_')}_${folio}.pdf`;
    pdf.save(fileName);
    toast.success(`Contrato ${folio} descargado correctamente`);
  };

  // ========== GENERAR RECIBO DE PAGO (TICKET VIRTUAL) ==========
  const generateRecibo = async (contract) => {
    // Calcular altura dinámica (más alto si tiene links)
    const hasLinks = contract.link_fotos || contract.link_videos;
    const ticketHeight = hasLinks ? 200 : 170;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, ticketHeight] });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 5;
    
    // Logo centrado (imagen gráfica)
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise(r => { logoImg.onload = r; setTimeout(r, 1000); });
      pdf.addImage(logoImg, 'PNG', (pageWidth - 25) / 2, 3, 25, 25);
    } catch(e) {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text("PIC PARTY", pageWidth / 2, 15, { align: 'center' });
    }
    
    let y = 32;
    
    // Título
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("RECIBO DE PAGO", pageWidth / 2, y, { align: 'center' });
    y += 6;
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.text("EVENTO LIQUIDADO", pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    // Línea divisora
    pdf.setDrawColor(150);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;
    
    // Datos del cliente
    pdf.setFontSize(7);
    pdf.setFont(undefined, 'bold');
    pdf.text("Cliente:", margin, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(contract.client_name || '', margin + 15, y);
    y += 5;
    
    pdf.setFont(undefined, 'bold');
    pdf.text("Tel:", margin, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(contract.client_phone || '', margin + 15, y);
    y += 5;
    
    pdf.setFont(undefined, 'bold');
    pdf.text("Fecha:", margin, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(contract.event_date || '', margin + 15, y);
    y += 8;
    
    // Línea divisora
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;
    
    // Totales
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.text("Total Neto:", margin, y);
    pdf.text(`$${(contract.net_price || 0).toLocaleString()} MXN`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    
    pdf.text("Abono:", margin, y);
    pdf.text(`$${(contract.anticipo_amount || 0).toLocaleString()} MXN`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    
    pdf.setFont(undefined, 'bold');
    pdf.text("Saldo:", margin, y);
    pdf.text("$0 MXN", pageWidth - margin, y, { align: 'right' });
    y += 8;
    
    // Mensaje de liquidado
    pdf.setFillColor(34, 139, 34);
    pdf.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.text("** SERVICIO LIQUIDADO **", pageWidth / 2, y + 5.5, { align: 'center' });
    y += 14;
    
    // ============ LINKS DE FOTOSHARE ============
    if (hasLinks) {
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'bold');
      pdf.text("Tus Fotos y Videos aqui:", pageWidth / 2, y, { align: 'center' });
      y += 6;
      
      pdf.setFontSize(6);
      pdf.setFont(undefined, 'normal');
      if (contract.link_fotos) {
        pdf.text("FOTOS:", margin, y);
        y += 4;
        pdf.setTextColor(0, 0, 255);
        pdf.text(contract.link_fotos, margin, y);
        pdf.setTextColor(0, 0, 0);
        y += 6;
      }
      if (contract.link_videos) {
        pdf.text("VIDEOS:", margin, y);
        y += 4;
        pdf.setTextColor(0, 0, 255);
        pdf.text(contract.link_videos, margin, y);
        pdf.setTextColor(0, 0, 0);
        y += 6;
      }
      y += 2;
    }
    
    // Línea divisora
    pdf.setDrawColor(150);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
    
    // ============ DATOS FISCALES ============
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(6);
    pdf.setFont(undefined, 'bold');
    pdf.text("DATOS FISCALES:", margin, y);
    y += 4;
    pdf.setFont(undefined, 'normal');
    pdf.text("Adan Octavio Irigoyen Arias", margin, y);
    y += 3;
    pdf.text("RFC: IIAA8004021A9", margin, y);
    y += 6;
    
    // Fecha de emisión
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(5);
    pdf.text(`Emitido: ${new Date().toLocaleString('es-MX')}`, pageWidth / 2, y, { align: 'center' });
    y += 3;
    pdf.text("(614) 272 5008 | WWW.PICPARTY.NET", pageWidth / 2, y, { align: 'center' });
    
    // Guardar
    pdf.save(`Recibo_${contract.client_name.replace(/\s+/g, '_')}.pdf`);
    toast.success("Recibo de pago generado");
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-premium-radial flex items-center justify-center">
        <Card className="w-full max-w-md card-premium">
          <CardHeader className="text-center">
            <img src={PICPARTY_LOGO} alt="PicParty" className="w-32 h-32 mx-auto mb-4" />
            <CardTitle className="text-gold text-2xl">Panel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input 
                  placeholder="Usuario" 
                  value={loginUser} 
                  onChange={(e) => setLoginUser(e.target.value.toUpperCase())} 
                  className="input-premium"
                  autoComplete="username"
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={loginPass} 
                  onChange={(e) => setLoginPass(e.target.value)} 
                  className="input-premium"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full btn-gold">Ingresar</Button>
            </form>
            <Link to="/" className="block text-center mt-4 text-pearl-muted hover:text-gold">← Volver</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-night flex items-center justify-center text-pearl">Cargando...</div>;

  // ============ VISTA STAFF - RESTRINGIDA ============
  if (userRole === "staff") {
    return (
      <div className="min-h-screen bg-night">
        <header className="header-premium">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10" />
              <span className="text-xl font-bold text-gold">PicParty STAFF</span>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Staff</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => { sessionStorage.removeItem("adminAuth"); sessionStorage.removeItem("userRole"); setIsAuthenticated(false); }}>Salir</Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Card className="card-premium border-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-gold">Galería de Eventos por Contrato</CardTitle>
              <CardDescription className="text-pearl-muted">
                Selecciona un evento para ver sus templates y agregar los links de Fotoshare
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selector de Eventos (Contratos con fecha) */}
              <div className="mb-4">
                <Label className="text-pearl mb-2 block">Seleccionar Evento:</Label>
                <Select value={selectedEventCode || ""} onValueChange={(val) => {
                  setSelectedEventCode(val);
                  const contract = contracts.find(c => c.id === val);
                  if (contract) {
                    setFotoshareLinks({ fotos: contract.link_fotos || "", videos: contract.link_videos || "" });
                  }
                }}>
                  <SelectTrigger className="input-premium" data-testid="staff-event-selector">
                    <SelectValue placeholder="Selecciona un evento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts
                      .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
                      .map(contract => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.client_name} - {new Date(contract.event_date).toLocaleDateString('es-MX')}
                          {contract.anticipo_status === "pagado" && " ✅"}
                          {contract.anticipo_status === "abonado" && " 💰"}
                          {contract.anticipo_status === "pendiente" && " ⏳"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contenido del evento seleccionado */}
              {selectedEventCode && (() => {
                const selectedContract = contracts.find(c => c.id === selectedEventCode);
                if (!selectedContract) return null;
                
                return (
                  <div className="space-y-6">
                    {/* Info del evento */}
                    <div className="p-4 bg-night/50 rounded-lg border border-gold/20">
                      <h3 className="text-gold text-lg font-bold mb-2">{selectedContract.client_name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-pearl-muted text-sm">
                        <span>Fecha: {new Date(selectedContract.event_date).toLocaleDateString('es-MX')}</span>
                        <span>Teléfono: {selectedContract.client_phone}</span>
                        <span className="flex items-center gap-2">Estado: <Badge className={selectedContract.anticipo_status === "pagado" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>{selectedContract.anticipo_status}</Badge></span>
                      </div>
                    </div>

                    {/* Servicios Contratados */}
                    <div className="p-4 bg-gold/10 rounded-lg border border-gold/30">
                      <h4 className="text-gold font-semibold mb-3">Servicios Contratados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedContract.include_cabina && <Badge className="badge-gold">Cabina de Fotos ({selectedContract.cabina_hours}h)</Badge>}
                        {selectedContract.include_video360 && <Badge className="badge-gold">Video 360 ({selectedContract.video360_hours}h)</Badge>}
                        {selectedContract.include_key_moments && <Badge className="badge-gold">Key Moments ({selectedContract.key_moments_pieces} piezas)</Badge>}
                        {selectedContract.include_live && <Badge className="badge-gold">PicPartyLive</Badge>}
                      </div>
                    </div>

                    {/* ============ LINKS DE FOTOSHARE ============ */}
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                        <span>📎</span> Links de Fotoshare.co
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-pearl text-sm">Link de FOTOS:</Label>
                          <Input 
                            placeholder="https://fotoshare.co/e/..." 
                            value={fotoshareLinks.fotos}
                            onChange={(e) => setFotoshareLinks({...fotoshareLinks, fotos: e.target.value})}
                            className="input-premium mt-1"
                            data-testid="staff-link-fotos"
                          />
                        </div>
                        <div>
                          <Label className="text-pearl text-sm">Link de VIDEOS:</Label>
                          <Input 
                            placeholder="https://fotoshare.co/v/..." 
                            value={fotoshareLinks.videos}
                            onChange={(e) => setFotoshareLinks({...fotoshareLinks, videos: e.target.value})}
                            className="input-premium mt-1"
                            data-testid="staff-link-videos"
                          />
                        </div>
                        <Button 
                          onClick={async () => {
                            try {
                              const params = new URLSearchParams();
                              if (fotoshareLinks.fotos) params.append('link_fotos', fotoshareLinks.fotos);
                              if (fotoshareLinks.videos) params.append('link_videos', fotoshareLinks.videos);
                              await axios.put(`${API}/contracts/${selectedEventCode}/links?${params.toString()}`);
                              toast.success("✅ Links guardados correctamente");
                              fetchData();
                            } catch (e) {
                              toast.error("Error guardando links");
                            }
                          }}
                          className="w-full btn-gold"
                          data-testid="staff-save-links-btn"
                        >
                          Guardar Links de Fotoshare
                        </Button>
                      </div>
                    </div>

                    {/* ============ GALERÍA DE TEMPLATES CLOUDINARY ============ */}
                    <div className="p-4 bg-night/50 rounded-lg border border-gold/20">
                      <h4 className="text-gold font-semibold mb-3 flex items-center gap-2">
                        <span>🖼️</span> Templates del Evento
                      </h4>
                      <p className="text-pearl-muted text-sm mb-3">
                        Descarga los templates (PNG/JPG) para el evento desde Cloudinary
                      </p>
                      <Button 
                        onClick={() => {
                          // Abrir Cloudinary con la carpeta del evento
                          const folderPath = `ADOCA/TEMPLATES/${selectedContract.client_name.replace(/\s+/g, '_').toUpperCase()}`;
                          window.open(`https://cloudinary.com/console/media_library/folders/${encodeURIComponent(folderPath)}`, '_blank');
                          toast.info("Abriendo Cloudinary... Busca la carpeta de templates del evento.");
                        }}
                        className="btn-gold-outline"
                        data-testid="staff-download-templates-btn"
                      >
                        Abrir Templates en Cloudinary
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {!selectedEventCode && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-pearl text-xl font-bold mb-2">Selecciona un Evento</h3>
                  <p className="text-pearl-muted">Elige un evento del selector para ver los templates y agregar links</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ============ VISTA ADMIN - COMPLETA ============
  return (
    <div className="min-h-screen bg-night">
      <header className="header-premium">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10" />
            <span className="text-xl font-bold text-gold">Admin</span>
            <Badge className="badge-gold">Sesión activa</Badge>
          </div>
          <div className="flex gap-2">
            <Link to="/"><Button className="btn-gold-outline">← Inicio</Button></Link>
            <Button variant="destructive" onClick={() => { sessionStorage.removeItem("adminAuth"); setIsAuthenticated(false); }}>Salir</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="contracts">
          <TabsList className="bg-night border border-gold/20">
            <TabsTrigger value="contracts" className="data-[state=active]:bg-gold data-[state=active]:text-night">Contratos ({contracts.length})</TabsTrigger>
            <TabsTrigger value="reporte" className="data-[state=active]:bg-gold data-[state=active]:text-night">Reporte Pagos</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-gold data-[state=active]:text-night">Galería Pro ({events.length})</TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-gold data-[state=active]:text-night">PICPARTYLIVE ({liveSessions.length})</TabsTrigger>
            <TabsTrigger value="cloudinary" className="data-[state=active]:bg-gold data-[state=active]:text-night">Cloudinary</TabsTrigger>
          </TabsList>

          {/* ============ PESTAÑA DE CONTRATOS ============ */}
          <TabsContent value="contracts" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-pearl text-xl font-bold">Centro de Contratos</h2>
                <p className="text-pearl-muted text-sm">Gestiona contratos independientes con precios netos</p>
              </div>
              <Button onClick={() => setShowContractForm(true)} className="btn-gold">
                Crear Contrato
              </Button>
            </div>

            {/* Formulario de Contrato */}
            {showContractForm && (
              <Card className="card-premium border-gold/30">
                <CardHeader>
                  <CardTitle className="text-pearl flex justify-between items-center">
                    <span>{editingContractId ? `Editando: ${contractForm.event_name}` : 'Nuevo Contrato'}</span>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-pearl-muted">✕</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tipo de Contrato */}
                  <div className="flex gap-4 p-3 bg-night/50 rounded">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="contract_type" checked={contractForm.contract_type === "public"} 
                        onChange={() => setContractForm({...contractForm, contract_type: "public", special_price: null})} />
                      <Label className="text-pearl">Contrato Público (Precios Netos)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="contract_type" checked={contractForm.contract_type === "special"} 
                        onChange={() => setContractForm({...contractForm, contract_type: "special"})} />
                      <Label className="text-gold">Contrato Proveedor/Especial</Label>
                    </div>
                  </div>

                  {/* Datos del Cliente - SOLO Nombre y Teléfono */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-pearl">Nombre Cliente *</Label>
                      <Input value={contractForm.client_name} onChange={(e) => setContractForm({...contractForm, client_name: e.target.value})} className="input-premium" />
                    </div>
                    <div>
                      <Label className="text-pearl">Teléfono *</Label>
                      <Input value={contractForm.client_phone} onChange={(e) => setContractForm({...contractForm, client_phone: e.target.value})} className="input-premium" />
                    </div>
                  </div>

                  {/* Fecha y Horarios */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-pearl">Fecha Evento *</Label>
                      <DatePicker value={contractForm.event_date} onChange={(event_date) => setContractForm({...contractForm, event_date})} placeholder="Seleccionar fecha" />
                    </div>
                    <div>
                      <Label className="text-pearl">Horario Evento</Label>
                      <Input placeholder="ej: 6:00 PM" value={contractForm.event_time} onChange={(e) => setContractForm({...contractForm, event_time: e.target.value})} className="input-premium" />
                    </div>
                    <div>
                      <Label className="text-pearl">Inicio Servicio</Label>
                      <Input placeholder="ej: 7:00 PM" value={contractForm.service_time} onChange={(e) => setContractForm({...contractForm, service_time: e.target.value})} className="input-premium" />
                    </div>
                  </div>

                  {/* === TOTAL Y SALDO EN TIEMPO REAL === */}
                  <div className="p-4 bg-gold/20 border border-gold/40 rounded-lg space-y-3">
                    {/* TOTAL CALCULADO AUTOMÁTICAMENTE */}
                    <div className="flex justify-between items-center gap-4">
                      <Label className="text-gold font-bold">TOTAL NETO:</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-gold">$</span>
                        <Input 
                          type="number" 
                          placeholder="Auto o manual" 
                          value={contractForm.manual_total || ((contractForm.price_cabina || 0) + (contractForm.price_video360 || 0) + (contractForm.price_key_moments || 0) + (contractForm.price_live || 0)) || ""} 
                          onChange={(e) => setContractForm({...contractForm, manual_total: parseInt(e.target.value) || 0})} 
                          className="input-premium w-32 text-right text-xl font-bold" 
                        />
                        <span className="text-gold font-bold">MXN</span>
                      </div>
                    </div>
                    <p className="text-pearl-muted/60 text-xs">* Suma automática de servicios. Puedes sobrescribir manualmente.</p>
                    
                    {/* DESCUENTO O PROMOCIÓN */}
                    <div className="flex justify-between items-center gap-4">
                      <Label className="text-red-400">Descuento o Promoción:</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">-$</span>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={contractForm.discount_amount || ""} 
                          onChange={(e) => setContractForm({...contractForm, discount_amount: parseInt(e.target.value) || 0})} 
                          className="input-premium w-32 text-right" 
                        />
                        <span className="text-red-400">MXN</span>
                      </div>
                    </div>
                    
                    {/* ANTICIPO */}
                    <div className="flex justify-between items-center gap-4">
                      <Label className="text-pearl-muted">Anticipo recibido:</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-pearl-muted">$</span>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={contractForm.anticipo_amount || ""} 
                          onChange={(e) => setContractForm({...contractForm, anticipo_amount: parseInt(e.target.value) || 0})} 
                          className="input-premium w-32 text-right" 
                        />
                        <span className="text-pearl-muted">MXN</span>
                      </div>
                    </div>
                    
                    {/* SALDO EN TIEMPO REAL (considera descuento) */}
                    {(() => {
                      const totalCalc = contractForm.manual_total || ((contractForm.price_cabina || 0) + (contractForm.price_video360 || 0) + (contractForm.price_key_moments || 0) + (contractForm.price_live || 0));
                      const totalConDescuento = totalCalc - (contractForm.discount_amount || 0);
                      const saldo = totalConDescuento - (contractForm.anticipo_amount || 0);
                      return (
                        <>
                          {contractForm.discount_amount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-pearl-muted">Total con descuento:</span>
                              <span className="text-pearl">${totalConDescuento.toLocaleString()} MXN</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t border-gold/30">
                            <span className="text-gold font-bold text-lg">SALDO:</span>
                            <span className={`text-2xl font-black ${saldo <= 0 ? 'text-green-400' : 'text-pearl'}`}>
                              ${Math.max(0, saldo).toLocaleString()} MXN
                            </span>
                          </div>
                          {saldo <= 0 && totalConDescuento > 0 && (
                            <div className="p-2 bg-green-500/20 border border-green-500/50 rounded text-center">
                              <span className="text-green-400 font-bold">✓ SERVICIO TOTALMENTE LIQUIDADO</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* === CATÁLOGO DE SERVICIOS (4 ÚNICOS) === */}
                  <div className="p-4 bg-night/50 border border-gold/20 rounded-lg space-y-4">
                    <Label className="text-gold font-bold text-sm block">SERVICIOS A CONTRATAR (Precios NETO)</Label>
                    
                    {/* CABINA DE FOTOS */}
                    <div className="p-3 bg-night/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox checked={contractForm.include_cabina} onCheckedChange={(c) => setContractForm({...contractForm, include_cabina: c, cabina_hours: c ? 2 : 0, price_cabina: c ? CATALOGO_CABINA[2] : 0})} />
                        <Label className="text-gold font-bold">Cabina de Fotos</Label>
                      </div>
                      {contractForm.include_cabina && (
                        <Select value={contractForm.cabina_hours.toString()} onValueChange={(v) => setContractForm({...contractForm, cabina_hours: parseInt(v), price_cabina: CATALOGO_CABINA[parseInt(v)]})}>
                          <SelectTrigger className="bg-night border-gold/30 text-gold">
                            <SelectValue placeholder="Selecciona horas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 horas - $2,699 NETO</SelectItem>
                            <SelectItem value="3">3 horas - $3,299 NETO</SelectItem>
                            <SelectItem value="4">4 horas - $3,799 NETO</SelectItem>
                            <SelectItem value="5">5 horas - $4,699 NETO</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* VIDEO 360 */}
                    <div className="p-3 bg-night/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox checked={contractForm.include_video360} onCheckedChange={(c) => setContractForm({...contractForm, include_video360: c, video360_hours: c ? 2 : 0, price_video360: c ? CATALOGO_360[2] : 0})} />
                        <Label className="text-gold font-bold">Video 360</Label>
                      </div>
                      {contractForm.include_video360 && (
                        <Select value={contractForm.video360_hours.toString()} onValueChange={(v) => setContractForm({...contractForm, video360_hours: parseInt(v), price_video360: CATALOGO_360[parseInt(v)]})}>
                          <SelectTrigger className="bg-night border-gold/30 text-gold">
                            <SelectValue placeholder="Selecciona horas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 horas - $3,299 NETO</SelectItem>
                            <SelectItem value="3">3 horas - $3,899 NETO</SelectItem>
                            <SelectItem value="4">4 horas - $4,499 NETO</SelectItem>
                            <SelectItem value="5">5 horas - $4,999 NETO</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* KEY MOMENTS */}
                    <div className="p-3 bg-night/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox checked={contractForm.include_key_moments} onCheckedChange={(c) => setContractForm({...contractForm, include_key_moments: c, key_moments_pieces: c ? 80 : 0, price_key_moments: c ? CATALOGO_KEY_MOMENTS[80] : 0})} />
                        <Label className="text-gold font-bold">Key Moments</Label>
                      </div>
                      {contractForm.include_key_moments && (
                        <Select value={contractForm.key_moments_pieces.toString()} onValueChange={(v) => setContractForm({...contractForm, key_moments_pieces: parseInt(v), price_key_moments: CATALOGO_KEY_MOMENTS[parseInt(v)]})}>
                          <SelectTrigger className="bg-night border-gold/30 text-gold">
                            <SelectValue placeholder="Selecciona piezas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="80">80 piezas - $2,999 NETO</SelectItem>
                            <SelectItem value="100">100 piezas - $3,250 NETO</SelectItem>
                            <SelectItem value="140">140 piezas - $3,499 NETO</SelectItem>
                            <SelectItem value="200">200 piezas - $4,499 NETO</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* PICPARTYLIVE */}
                    <div className="p-3 bg-night/30 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={contractForm.include_live} onCheckedChange={(c) => setContractForm({...contractForm, include_live: c, price_live: c ? 700 : 0})} />
                          <Label className="text-gold font-bold">PicPartyLive</Label>
                        </div>
                        <span className="text-gold text-sm">$700 NETO</span>
                      </div>
                      {contractForm.include_live && (
                        <p className="text-gold/80 text-xs mt-2 p-2 bg-gold/10 rounded">
                          Internet y pantallas corren por cuenta del anfitrion.
                        </p>
                      )}
                    </div>
                    
                  </div>

                  {/* Precio Especial (solo si es contrato especial) */}
                  {contractForm.contract_type === "special" && (
                    <div className="p-3 bg-gold/10 border border-gold/30 rounded">
                      <Label className="text-gold font-bold">Precio Especial (Convenio)</Label>
                      <Input type="number" placeholder="Ingresa el precio final acordado" value={contractForm.special_price || ""} onChange={(e) => setContractForm({...contractForm, special_price: parseInt(e.target.value) || null})} className="input-premium mt-2" />
                    </div>
                  )}

                  {/* Notas */}
                  <div>
                    <Label className="text-pearl">Notas adicionales</Label>
                    <Textarea value={contractForm.notes} onChange={(e) => setContractForm({...contractForm, notes: e.target.value})} className="input-premium" rows={2} />
                  </div>

                  {/* Cortesía / Regalo */}
                  <div className="p-3 bg-gold/10 border border-gold/30 rounded">
                    <Label className="text-gold font-bold text-sm">Cortesía / Regalo</Label>
                    <Input 
                      placeholder="Ej: Foto impresa 20x30, Marco de madera, etc." 
                      value={contractForm.cortesia || ""} 
                      onChange={(e) => setContractForm({...contractForm, cortesia: e.target.value})} 
                      className="input-premium mt-1" 
                    />
                    <p className="text-pearl-muted text-xs mt-1">Se imprimirá en el contrato como cortesía incluida</p>
                  </div>

                  {/* === APARTADO DE PAGOS (USO INTERNO) === */}
                  <div className="p-4 bg-night/70 border border-pearl-muted/20 rounded-lg">
                    <h4 className="text-pearl-muted font-bold text-sm mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 bg-pearl-muted/20 rounded flex items-center justify-center text-xs">$</span>
                      USO INTERNO
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Estado del Pago */}
                      <div>
                        <Label className="text-pearl-muted text-xs">Estado del Pago</Label>
                        <Select value={contractForm.anticipo_status} onValueChange={(v) => setContractForm({...contractForm, anticipo_status: v})}>
                          <SelectTrigger className="bg-night border-pearl-muted/30 text-pearl mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="abonado">Abonado</SelectItem>
                            <SelectItem value="pagado">PAGADO - Liquidado</SelectItem>
                            <SelectItem value="dia_evento">Día del Evento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Costo Proveedor */}
                      <div>
                        <Label className="text-pearl-muted text-xs">Costo Proveedor</Label>
                        <Input 
                          type="number" 
                          placeholder="Tu costo real" 
                          value={contractForm.costo_proveedor || ""} 
                          onChange={(e) => setContractForm({...contractForm, costo_proveedor: parseInt(e.target.value) || null})} 
                          className="input-premium mt-1" 
                        />
                        {contractForm.costo_proveedor && contractForm.manual_total > 0 && (
                          <p className="text-gold text-xs mt-1">
                            Utilidad: ${(contractForm.manual_total - contractForm.costo_proveedor).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Fecha de Pago (si está pagado) */}
                    {contractForm.anticipo_status === "pagado" && (
                      <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded">
                        <div className="flex items-center gap-2">
                          <Label className="text-green-400 text-xs">Fecha de Liquidación</Label>
                          <div className="w-48">
                            <DatePicker 
                              value={contractForm.fecha_pago || new Date().toISOString().split('T')[0]} 
                              onChange={(fecha_pago) => setContractForm({...contractForm, fecha_pago})} 
                              placeholder="Fecha pago"
                            />
                          </div>
                        </div>
                        <p className="text-green-400 text-sm font-bold mt-2">✓ SERVICIOS LIQUIDADOS</p>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3">
                    {editingContractId ? (
                      <>
                        <Button onClick={cancelEdit} className="btn-gold-outline">
                          Cancelar
                        </Button>
                        <Button onClick={updateContract} className="btn-gold">
                          Guardar Cambios
                        </Button>
                      </>
                    ) : (
                      <Button onClick={createContract} className="btn-gold">
                        Crear Contrato
                      </Button>
                    )}
                  </div>

                  {/* Preview del cálculo */}
                  {contractPreview && (
                    <div className="p-4 bg-gold/10 border border-gold/30 rounded">
                      <div className="flex justify-between text-pearl">
                        <span>Subtotal:</span>
                        <span>${contractPreview.subtotal.toLocaleString()} NETO</span>
                      </div>
                      {contractForm.discount_amount > 0 && (
                        <div className="flex justify-between text-gold">
                          <span>Descuento:</span>
                          <span>-${contractForm.discount_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gold font-bold text-xl mt-2 pt-2 border-t border-gold/30">
                        <span>PRECIO NETO:</span>
                        <span>${contractPreview.netPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lista de Contratos */}
            {contracts.length === 0 ? (
              <Card className="card-premium border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-night rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-pearl-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <p className="text-pearl-muted">No hay contratos creados</p>
                  <p className="text-pearl-muted/70 text-sm">Crea tu primer contrato con el boton de arriba</p>
                </CardContent>
              </Card>
            ) : (
              [...contracts]
                .sort((a, b) => new Date(a.event_date || '2099-12-31') - new Date(b.event_date || '2099-12-31'))
                .map(contract => (
                <Card key={contract.id} className="card-premium">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-pearl font-bold">{contract.event_name}</h3>
                          <Badge className={contract.contract_type === "special" ? "badge-gold" : "badge-gold"}>
                            {contract.contract_type === "special" ? "Especial" : "Publico"}
                          </Badge>
                          <Badge className="badge-gold">{contract.status}</Badge>
                        </div>
                        <p className="text-pearl-muted text-sm">{contract.client_name} - {contract.client_phone}</p>
                        <p className="text-pearl-muted/70 text-sm">{contract.event_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-bold text-2xl">${contract.net_price?.toLocaleString()}</p>
                        <p className="text-pearl-muted text-sm">Precio Neto</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="btn-gold-outline" onClick={() => startEditContract(contract)}>Editar</Button>
                          <Button size="sm" className="btn-gold" onClick={() => printContractPDF(contract)}>PDF</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteContract(contract.id)}>Eliminar</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ============ PESTAÑA REPORTE DE PAGOS ============ */}
          <TabsContent value="reporte" className="space-y-4 mt-4">
            <Card className="card-premium border-gold/30">
              <CardHeader>
                <CardTitle className="text-pearl flex items-center gap-2">
                  <span className="text-gold">$</span> Reporte de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/30">
                        <th className="text-left text-gold py-3 px-2">Nombre</th>
                        <th className="text-left text-gold py-3 px-2">Celular</th>
                        <th className="text-left text-gold py-3 px-2">Fecha Evento</th>
                        <th className="text-right text-gold py-3 px-2">Total Neto</th>
                        <th className="text-right text-gold py-3 px-2">Abono</th>
                        <th className="text-right text-gold py-3 px-2">Saldo</th>
                        <th className="text-center text-gold py-3 px-2">Estado</th>
                        <th className="text-center text-gold py-3 px-2">Recibo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => {
                        const total = contract.net_price || 0;
                        const abono = contract.anticipo_amount || 0;
                        const saldo = total - abono;
                        const liquidado = saldo <= 0;
                        return (
                          <tr key={contract.id} className="border-b border-pearl-muted/20 hover:bg-gold/5">
                            <td className="py-3 px-2 text-pearl">{contract.client_name}</td>
                            <td className="py-3 px-2 text-pearl-muted">{contract.client_phone}</td>
                            <td className="py-3 px-2 text-pearl-muted">{contract.event_date}</td>
                            <td className="py-3 px-2 text-right text-pearl font-bold">${total.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right text-green-400">${abono.toLocaleString()}</td>
                            <td className={`py-3 px-2 text-right font-bold ${liquidado ? 'text-green-400' : 'text-red-400'}`}>
                              ${Math.max(0, saldo).toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {liquidado ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">LIQUIDADO</Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">SALDO PENDIENTE</Badge>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {liquidado && (
                                <Button size="sm" className="btn-gold-outline text-xs" onClick={() => generateRecibo(contract)}>
                                  Recibo
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {contracts.length === 0 && (
                  <p className="text-pearl-muted text-center py-8">No hay contratos registrados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ PESTAÑA GALERÍA PRO ============ */}
          <TabsContent value="events" className="space-y-4 mt-4">
            <Card className="card-premium border-gold/30">
              <CardContent className="p-4">
                <p className="text-gold font-semibold">Galería Pro - Solo Visualización</p>
                <p className="text-pearl-muted text-sm">Estos eventos son para mostrar en IFRAME. NO generan carpetas en Cloudinary.</p>
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardHeader><CardTitle className="text-pearl">Crear Evento de Galería</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input placeholder="NOMBRE *" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value.toUpperCase()})} className="input-premium" />
                  <div className="relative">
                    <DatePicker value={newEvent.date} onChange={(date) => setNewEvent({...newEvent, date})} placeholder="Fecha *" />
                  </div>
                  <Input placeholder="URL Fotoshare (IFRAME)" value={newEvent.fotoshare_url} onChange={(e) => setNewEvent({...newEvent, fotoshare_url: e.target.value})} className="input-premium" />
                  <Input placeholder="URL Video 360" value={newEvent.video360_url} onChange={(e) => setNewEvent({...newEvent, video360_url: e.target.value})} className="input-premium" />
                  <Button onClick={createEvent} className="btn-gold col-span-2 md:col-span-1">Crear Evento</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Lista de Eventos con Edición */}
            {events.map(event => (
              <Card key={event.id} className="card-premium">
                <CardContent className="p-4">
                  {editingEventId === event.id ? (
                    /* === MODO EDICIÓN === */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Input 
                          placeholder="NOMBRE" 
                          value={editEventForm.name || ''} 
                          onChange={(e) => setEditEventForm({...editEventForm, name: e.target.value.toUpperCase()})} 
                          className="input-premium" 
                        />
                        <DatePicker 
                          value={editEventForm.date || ''} 
                          onChange={(date) => setEditEventForm({...editEventForm, date})} 
                          placeholder="Fecha"
                        />
                        <Input 
                          placeholder="URL Fotoshare" 
                          value={editEventForm.fotoshare_url || ''} 
                          onChange={(e) => setEditEventForm({...editEventForm, fotoshare_url: e.target.value})} 
                          className="input-premium" 
                        />
                        <Input 
                          placeholder="URL Video 360" 
                          value={editEventForm.video360_url || ''} 
                          onChange={(e) => setEditEventForm({...editEventForm, video360_url: e.target.value})} 
                          className="input-premium" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="btn-gold" onClick={() => saveEventEdit(event.id)}>Guardar</Button>
                        <Button size="sm" variant="outline" className="btn-gold-outline" onClick={() => setEditingEventId(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    /* === MODO VISUALIZACIÓN === */
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded flex items-center justify-center text-2xl bg-gold/20">📸</div>
                        <div>
                          <h3 className="text-pearl font-bold">{event.name}</h3>
                          <p className="text-pearl-muted text-sm">{event.date}</p>
                          <Badge className="badge-gold text-xs mt-1">Solo visualización IFRAME</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="btn-gold-outline" onClick={() => { setEditingEventId(event.id); setEditEventForm({name: event.name, date: event.date, fotoshare_url: event.fotoshare_url, video360_url: event.video360_url}); }}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>Eliminar</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ============ PESTAÑA PICPARTYLIVE ============ */}
          <TabsContent value="live" className="space-y-4 mt-4">
            <Card className="card-premium border-gold/30">
              <CardContent className="p-4">
                <p className="text-gold font-semibold">PICPARTYLIVE - Muro en Vivo</p>
                <p className="text-pearl-muted text-sm">Estos eventos generan carpeta automática en Cloudinary y código QR para invitados. Incluye software de proyección en tiempo real para pantallas o TV. No incluye equipo físico (pantallas/cableado).</p>
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-pearl">Crear Sesión Live</CardTitle>
                <CardDescription className="text-pearl-muted">El código de 4 dígitos se genera automáticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fila 1: Nombre del Evento */}
                <div>
                  <Label className="text-pearl text-sm">Nombre del Evento *</Label>
                  <Input 
                    placeholder="ej: Boda de Pedro y María" 
                    value={newSession.event_name} 
                    onChange={(e) => setNewSession({...newSession, event_name: e.target.value})} 
                    className="input-premium mt-1" 
                  />
                </div>
                
                {/* Fila 2: Tipo de Evento y Fecha */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-pearl text-sm">Tipo de Evento *</Label>
                    <Select 
                      value={newSession.event_type} 
                      onValueChange={(v) => setNewSession({...newSession, event_type: v, event_type_custom: v === "otro" ? newSession.event_type_custom : ""})}
                    >
                      <SelectTrigger className="bg-night border-gold/30 text-pearl mt-1">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.emoji} {type.label.replace(type.emoji, '').trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-pearl text-sm">Fecha del Evento *</Label>
                    <div className="mt-1">
                      <DatePicker 
                        value={newSession.event_date} 
                        onChange={(event_date) => setNewSession({...newSession, event_date})} 
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Campo de Teléfono del Cliente (OBLIGATORIO) */}
                <div>
                  <Label className="text-pearl text-sm">Teléfono del Cliente * <span className="text-gold text-xs">(Clave de descarga)</span></Label>
                  <Input 
                    type="text"
                    placeholder="Ej: 6146010070" 
                    value={newSession.client_phone} 
                    onChange={(e) => setNewSession({...newSession, client_phone: e.target.value})} 
                    className="input-premium mt-1" 
                  />
                  <p className="text-pearl-muted/70 text-xs mt-1">Los últimos 4 dígitos serán la clave para descargar las fotos</p>
                </div>
                
                {/* Campo personalizado si es "Otro" */}
                {newSession.event_type === "otro" && (
                  <div>
                    <Label className="text-pearl text-sm">Especifica el tipo de evento</Label>
                    <Input 
                      placeholder="ej: Graduación, Bautizo, etc." 
                      value={newSession.event_type_custom} 
                      onChange={(e) => setNewSession({...newSession, event_type_custom: e.target.value})} 
                      className="input-premium mt-1" 
                    />
                  </div>
                )}
                
                {/* Fila 3: VIP y Botón */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={newSession.is_vip} 
                      onCheckedChange={(c) => setNewSession({...newSession, is_vip: c})} 
                    />
                    <Label className="text-gold">VIP</Label>
                  </div>
                  <Button onClick={createLiveSession} className="btn-gold px-6">
                    Crear Sesión Live
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Lista de sesiones - Ordenadas por fecha descendente */}
            {liveSessions.length === 0 ? (
              <Card className="card-premium border-dashed">
                <CardContent className="p-8 text-center">
                  <span className="text-5xl block mb-4">📺</span>
                  <p className="text-pearl-muted">No hay sesiones Live creadas</p>
                  <p className="text-pearl-muted/70 text-sm">Crea tu primera sesión con el formulario de arriba</p>
                </CardContent>
              </Card>
            ) : (
              [...liveSessions]
                .sort((a, b) => new Date(b.created_at || '1970-01-01') - new Date(a.created_at || '1970-01-01'))
                .map(session => {
                  const typeInfo = getEventTypeInfo(session.event_type, session.event_type_custom);
                  return (
                    <Card key={session.id} className="card-premium hover:border-gold/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          {/* Lado izquierdo: QR y datos */}
                          <div className="flex items-start gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-lg">
                              <QRCodeSVG value={`https://${SITE_DOMAIN}/live?code=${session.code}`} size={70} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-pearl font-bold text-lg">{session.code}</span>
                                <Badge className={session.is_active ? "bg-gold text-night" : "bg-pearl-muted/30 text-pearl-muted"}>
                                  {session.is_active ? "Activo" : "Inactivo"}
                                </Badge>
                                {session.is_vip && <Badge className="bg-gold text-night">VIP</Badge>}
                              </div>
                              <p className="text-pearl font-medium">{session.event_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge className="badge-gold text-xs">
                                  {typeInfo.emoji} {typeInfo.label}
                                </Badge>
                                {session.event_date && (
                                  <span className="text-pearl-muted text-sm">
                                    {new Date(session.event_date + 'T12:00:00').toLocaleDateString('es-MX', { 
                                      day: 'numeric', month: 'short', year: 'numeric' 
                                    })}
                                  </span>
                                )}
                                {/* Contador de fotos en tiempo real */}
                                <Badge className="badge-gold text-xs animate-pulse">
                                  {photosCounts[session.code] || 0} fotos
                                </Badge>
                              </div>
                              <p className="text-gold/70 text-xs mt-2 font-mono">
                                https://{SITE_DOMAIN}/live?code={session.code}
                              </p>
                              {/* Clave de descarga (últimos 4 dígitos del teléfono) */}
                              {session.client_phone && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="badge-gold text-xs">
                                    Clave descarga: <span className="font-mono font-bold ml-1">{session.client_phone.slice(-4)}</span>
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="text-gold hover:bg-gold/20 text-xs h-6 px-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(session.client_phone.slice(-4));
                                      toast.success("Clave copiada: " + session.client_phone.slice(-4));
                                    }}
                                  >
                                    📋
                                  </Button>
                                </div>
                              )}
                              {!session.client_phone && (
                                <Badge className="bg-red-500/30 text-red-300 text-xs mt-1">
                                  Sin teléfono (descarga bloqueada)
                                </Badge>
                              )}
                              
                              {/* Botón de sincronizar Cloudinary */}
                              <div className="flex items-center gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="btn-gold-outline text-xs h-7"
                                  onClick={async () => {
                                    const folder = prompt(
                                      "Ingresa la ruta de Cloudinary:\n(Ej: ADOCA/FEBRERO/28-02-26/EXPO PÚBLICO BODA)", 
                                      session.cloudinary_folder || "ADOCA/"
                                    );
                                    if (folder) {
                                      try {
                                        toast.info("Sincronizando fotos...");
                                        const res = await axios.post(`${API}/live/sync-cloudinary/${session.code}?folder_path=${encodeURIComponent(folder)}`);
                                        toast.success(`${res.data.imported} fotos importadas, ${res.data.skipped} ya existían`);
                                        fetchData();
                                      } catch (e) {
                                        toast.error("Error: " + (e.response?.data?.detail || "No se pudo sincronizar"));
                                      }
                                    }
                                  }}
                                >
                                  Sincronizar Cloudinary
                                </Button>
                                {session.cloudinary_folder && (
                                  <span className="text-pearl-muted/60 text-[10px] truncate max-w-[150px]" title={session.cloudinary_folder}>
                                    {session.cloudinary_folder}
                                  </span>
                                )}
                              </div>
                              
                              {/* Botones de compartir */}
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="btn-gold-outline text-xs h-7"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`https://${SITE_DOMAIN}/live?code=${session.code}`);
                                    toast.success("Link copiado al portapapeles");
                                  }}
                                >
                                  Copiar Link
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                  onClick={() => {
                                    const msg = encodeURIComponent(`¡Hola! Tu evento *${session.event_name}* en PICPARTYLIVE está listo.\n\n📸 Acceso directo: https://${SITE_DOMAIN}/live?code=${session.code}\n\n¡Sube tus fotos y compártelas con todos!`);
                                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                                  }}
                                >
                                  WhatsApp
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Lado derecho: Botones */}
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              className="btn-gold" 
                              onClick={() => printQRPDF(session)}
                              data-testid={`print-qr-${session.code}`}
                            >
                              Imprimir QR
                            </Button>
                            <Button 
                              size="sm" 
                              className="btn-gold-outline"
                              onClick={() => openEditModal(session)}
                              data-testid={`edit-${session.code}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="btn-gold-outline"
                              onClick={async () => { 
                                await axios.put(`${API}/live/sessions/${session.id}/toggle`); 
                                fetchData(); 
                              }}
                            >
                              {session.is_active ? "Pausar" : "Activar"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={async () => { 
                                if (confirm('¿Eliminar esta sesión?')) {
                                  await axios.delete(`${API}/live/sessions/${session.id}`); 
                                  fetchData(); 
                                }
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}

            {/* ============ MODAL DE EDICIÓN ============ */}
            {editingSession && (
              <div className="fixed inset-0 bg-night/90 flex items-center justify-center z-50">
                <Card className="card-premium border-gold/50 w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle className="text-pearl flex items-center gap-2">
                      Editar Evento: {editingSession.code}
                    </CardTitle>
                    <CardDescription className="text-pearl-muted">
                      Modifica los datos del evento y guarda los cambios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Código */}
                    <div>
                      <Label className="text-pearl text-sm">Código del Evento</Label>
                      <Input 
                        value={editForm.code}
                        onChange={(e) => setEditForm({...editForm, code: e.target.value.toUpperCase()})}
                        className="input-premium mt-1"
                        placeholder="Código único"
                      />
                    </div>
                    
                    {/* Nombre */}
                    <div>
                      <Label className="text-pearl text-sm">Nombre del Evento *</Label>
                      <Input 
                        value={editForm.event_name}
                        onChange={(e) => setEditForm({...editForm, event_name: e.target.value})}
                        className="input-premium mt-1"
                        placeholder="Nombre del evento"
                      />
                    </div>
                    
                    {/* Tipo de Evento */}
                    <div>
                      <Label className="text-pearl text-sm">Tipo de Evento</Label>
                      <Select 
                        value={editForm.event_type} 
                        onValueChange={(v) => setEditForm({...editForm, event_type: v})}
                      >
                        <SelectTrigger className="bg-night border-gold/30 text-pearl mt-1">
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.emoji} {type.label.replace(type.emoji, '').trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Campo personalizado si es "Otro" */}
                    {editForm.event_type === "otro" && (
                      <div>
                        <Label className="text-pearl text-sm">Especifica el tipo</Label>
                        <Input 
                          value={editForm.event_type_custom}
                          onChange={(e) => setEditForm({...editForm, event_type_custom: e.target.value})}
                          className="input-premium mt-1"
                          placeholder="ej: Graduación, Bautizo"
                        />
                      </div>
                    )}
                    
                    {/* Fecha */}
                    <div>
                      <Label className="text-pearl text-sm">Fecha del Evento *</Label>
                      <div className="mt-1">
                        <DatePicker 
                          value={editForm.event_date}
                          onChange={(event_date) => setEditForm({...editForm, event_date})}
                          placeholder="Seleccionar fecha"
                        />
                      </div>
                      <p className="text-pearl-muted/70 text-xs mt-1">
                        Cambia a fecha de hoy para activar acceso inmediato
                      </p>
                    </div>
                    
                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="flex-1 btn-gold-outline"
                        onClick={closeEditModal}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="flex-1 btn-gold"
                        onClick={saveSessionEdit}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cloudinary" className="mt-4">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-pearl">Galería de Imágenes por Evento</CardTitle>
                <CardDescription className="text-pearl-muted">Solo imágenes PNG/JPG - Descarga directa para Staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector de Evento */}
                <div className="space-y-2">
                  <Label className="text-pearl">Seleccionar Evento</Label>
                  <Select onValueChange={(code) => setSelectedEventCode(code)}>
                    <SelectTrigger className="bg-night border-gold/30 text-pearl">
                      <SelectValue placeholder="Selecciona un evento para ver sus imágenes" />
                    </SelectTrigger>
                    <SelectContent>
                      {liveSessions.map(session => (
                        <SelectItem key={session.code} value={session.code}>
                          {session.name} - {session.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Galería de Fotos del Evento Seleccionado */}
                {selectedEventCode && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-bold">Imágenes del Evento: {selectedEventCode}</h3>
                      <Button 
                        className="btn-gold-outline" 
                        onClick={async () => {
                          try {
                            const res = await axios.get(`${API}/live/photos/${selectedEventCode}`);
                            setEventPhotos(res.data.photos || []);
                            toast.success(`${res.data.total} imágenes cargadas`);
                          } catch(e) {
                            toast.error("Error cargando imágenes");
                          }
                        }}
                      >
                        Cargar Imágenes
                      </Button>
                    </div>
                    
                    {eventPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {eventPhotos.map((photo, idx) => (
                          <div key={photo.id || idx} className="relative group">
                            <img 
                              src={photo.photo_url} 
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-32 object-cover rounded border border-gold/30"
                            />
                            <a 
                              href={photo.photo_url} 
                              download={`evento_${selectedEventCode}_foto_${idx + 1}.jpg`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-night/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Button size="sm" className="btn-gold">
                                Descargar
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-pearl-muted text-center py-8">Haz clic en "Cargar Imágenes" para ver las fotos del evento</p>
                    )}
                    
                    {eventPhotos.length > 0 && (
                      <div className="p-3 bg-gold/10 border border-gold/30 rounded">
                        <p className="text-gold text-sm font-semibold">Descarga Masiva</p>
                        <p className="text-pearl-muted text-xs">Haz clic en cada imagen para descargarla. Solo formatos PNG/JPG soportados.</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-green-400 font-semibold">Sistema Optimizado</p>
                  <p className="text-pearl-muted text-sm mt-1">Solo imágenes PNG/JPG. Sin videos ni audios.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// ============ APP PRINCIPAL ============
function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EventGallery />} />
          <Route path="/cotizador" element={<Cotizador />} />
          <Route path="/picpartylive" element={<PicPartyLiveLanding />} />
          <Route path="/live" element={<PicPartyLive />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
