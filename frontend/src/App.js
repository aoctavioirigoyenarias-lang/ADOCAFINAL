import { useState, useEffect, useCallback, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
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
const PICPARTY_LOGO = "https://customer-assets.emergentagent.com/job_net-price-quotes/artifacts/udz3kgwy_logo%20pic%20party.png";

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
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group overflow-hidden">
      <div className="relative overflow-hidden">
        {hasPhoto ? (
          <img src={event.thumbnail} alt={event.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <AutoCover />
        )}
        <div className="absolute top-3 left-3 flex gap-1">
          {event.has_photos && <Badge className="bg-pink-500/90 text-xs">📸 Fotos</Badge>}
          {event.has_video360 && <Badge className="bg-cyan-500/90 text-xs">🎥 360°</Badge>}
        </div>
        <Badge className="absolute top-3 right-3 bg-black/60 text-xs">{event.date}</Badge>
      </div>
      <CardContent className="pt-4">
        <h4 className="text-xl font-black text-white mb-1">{event.name}</h4>
        <p className="text-gray-400 text-sm mb-3">{event.description}</p>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <span>📍 {event.location}</span>
          {event.time && <span>• {event.time}</span>}
        </div>
        <div className="flex gap-2">
          {event.fotoshare_url && (
            <a href={event.fotoshare_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-sm">
                📸 Ver Fotos
              </Button>
            </a>
          )}
          {event.video360_url && (
            <a href={event.video360_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-sm">🎥 Ver 360°</Button>
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
        setFilteredEvents(newResponse.data.slice(0, 5));
      } else {
        setAllEvents(response.data);
        setFilteredEvents(response.data.slice(0, 5));
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
      setFilteredEvents(allEvents.slice(0, 5));
    }
  }, [allEvents]);

  const resetFilter = () => {
    setSelectedDate(null);
    setFilteredEvents(allEvents.slice(0, 5));
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950 flex items-center justify-center">
      <div className="text-white text-xl">Cargando...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950">
      {/* Header con Logo PicParty */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-white">PicParty</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/cotizador">
              <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">💰 Cotizar</Button>
            </Link>
            <Link to="/picpartylive">
              <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/20">🔴 Live</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="text-gray-400 hover:text-white">⚙️</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            PicParty
          </h1>
          <p className="text-gray-300">Cabina Fotográfica • Memorias que Duran</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendario Buscador */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                📅 Busca tu evento por la fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border border-white/10 bg-white/5 text-white"
                modifiers={{ hasEvent: eventDates }}
                modifiersStyles={{ hasEvent: { backgroundColor: 'rgb(168 85 247 / 0.4)', borderRadius: '50%' } }}
              />
              {selectedDate && (
                <Button variant="outline" className="w-full mt-3 border-white/20 text-white" onClick={resetFilter}>
                  ✕ Mostrar todos
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Feed de Eventos */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedDate ? `Eventos del ${selectedDate.toLocaleDateString('es-MX')}` : "Últimos Eventos"}
              </h3>
              <Badge className="bg-purple-500/30 text-purple-300">{filteredEvents.length} evento(s)</Badge>
            </div>
            
            {filteredEvents.length === 0 ? (
              <Card className="bg-white/5 border-white/10 border-dashed p-12 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-white text-xl font-bold mb-2">Buzón Vacío</h3>
                <p className="text-gray-400 mb-4">No hay eventos para mostrar</p>
                <Button onClick={resetFilter} className="bg-purple-500 hover:bg-purple-600">
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

      <footer className="border-t border-white/10 mt-12 py-6 text-center text-gray-500">
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
  
  // Servicio principal seleccionado
  const [mainService, setMainService] = useState(""); // "cabina" o "video360"
  const [serviceHours, setServiceHours] = useState(0);
  
  // ADD-ON PICPARTYLIVE
  const [includeLive, setIncludeLive] = useState(false);
  const [livePackage, setLivePackage] = useState(0); // $700, $1000, $1500 NETO
  
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

  // Calcular cotización
  const calculateQuote = () => {
    // Validar nombre
    if (!clientData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    
    // Validar teléfono (obligatorio)
    if (!clientData.telefono.trim() || clientData.telefono.length < 10) {
      toast.error("El teléfono es obligatorio (mínimo 10 dígitos)");
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
    
    // Calcular precios
    const servicePrice = getServicePrice();
    const livePrice = includeLive ? livePackage : 0;
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
      livePackage
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
        picpartylive: includeLive ? (livePackage === 700 ? "Súper Precio" : livePackage === 1000 ? "Promo Expo" : "Regular") : "No",
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

    toast.info("Generando PDF...");
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header con fondo púrpura
    pdf.setFillColor(88, 28, 135);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise((resolve) => { logoImg.onload = resolve; setTimeout(resolve, 2000); });
      pdf.addImage(logoImg, 'PNG', 15, 8, 35, 35);
    } catch(e) {}
    
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255);
    pdf.text("COTIZACIÓN", pageWidth - 20, 25, { align: 'right' });
    pdf.setFontSize(12);
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
    pdf.text(`Teléfono: ${clientData.telefono}`, 20, y); y += 6;
    if (clientData.salon) { pdf.text(`Salón: ${clientData.salon}`, 20, y); y += 6; }
    if (clientData.fecha) { pdf.text(`Fecha del Evento: ${clientData.fecha}`, 20, y); y += 6; }
    
    y += 10;
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("DETALLE DE SERVICIOS", 20, y);
    y += 10;
    
    // Tabla de servicios
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, y - 5, pageWidth - 40, 8, 'F');
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("Concepto", 25, y);
    pdf.text("Precio Neto", pageWidth - 45, y, { align: 'right' });
    y += 10;
    
    pdf.setFont(undefined, 'normal');
    
    // Servicio principal
    if (quote.mainService && quote.serviceHours) {
      const serviceName = quote.mainService === "cabina" ? "Cabina de Fotos" : "Video 360°";
      pdf.text(`${serviceName} (${quote.serviceHours} horas)`, 25, y);
      pdf.text(formatCurrency(quote.servicePrice), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    // PICPARTYLIVE
    if (quote.livePrice > 0) {
      const pkgLabel = quote.livePackage === 700 ? "Súper Precio (con servicio)" : quote.livePackage === 1000 ? "Promo Expo" : "Regular";
      pdf.text(`PICPARTYLIVE - ${pkgLabel}`, 25, y);
      pdf.text(formatCurrency(quote.livePrice), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    y += 5;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, y, pageWidth - 20, y);
    y += 8;
    
    // Subtotal
    pdf.text("Subtotal:", 25, y);
    pdf.text(formatCurrency(quote.subtotal), pageWidth - 45, y, { align: 'right' });
    y += 7;
    
    // Descuento si aplica
    if (quote.descuentoPct > 0) {
      pdf.setTextColor(220, 120, 50);
      pdf.text(`Descuento (${quote.descuentoPct}%):`, 25, y);
      pdf.text(`-${formatCurrency(quote.descuento)}`, pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    // Total Neto
    y += 3;
    pdf.setFillColor(88, 28, 135);
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
    pdf.text("* Todos los precios son NETOS. Cotización válida por 15 días.", pageWidth / 2, y, { align: 'center' });
    pdf.text("PicParty - Cabina Fotográfica | adoca.net", pageWidth / 2, y + 5, { align: 'center' });
    
    pdf.save(`Cotizacion_${folio}.pdf`);
    toast.success("PDF descargado correctamente");
  };

  // Seleccionar servicio y horas
  const selectService = (service, hours) => {
    setMainService(service);
    setServiceHours(hours);
    // Si selecciona servicio principal, habilitar opción de $700 para PICPARTYLIVE
    if (includeLive && livePackage !== 700) {
      setLivePackage(700); // Auto-aplicar súper precio
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10 object-contain" />
            <span className="text-lg font-bold text-white">Cotizador</span>
          </Link>
          <Link to="/"><Button variant="outline" size="sm" className="border-white/20 text-white">← Inicio</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cotiza tu Evento</h1>
          <Badge className="bg-green-500/20 text-green-400">Precios Netos</Badge>
        </div>

        <div className="space-y-6">
          {/* PASO 1: Datos del Cliente */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                Datos del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nombre *</Label>
                  <Input 
                    placeholder="Tu nombre completo" 
                    value={clientData.nombre}
                    onChange={(e) => setClientData({...clientData, nombre: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    data-testid="cotizador-nombre"
                  />
                </div>
                <div>
                  <Label className="text-white">Teléfono * <span className="text-pink-400 text-xs">(Obligatorio)</span></Label>
                  <Input 
                    placeholder="10 dígitos" 
                    type="tel"
                    maxLength={10}
                    value={clientData.telefono}
                    onChange={(e) => setClientData({...clientData, telefono: e.target.value.replace(/\D/g, '')})}
                    className="bg-white/10 border-white/20 text-white"
                    data-testid="cotizador-telefono"
                  />
                  <p className="text-gray-500 text-xs mt-1">Los últimos 4 dígitos serán tu clave de descarga</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Salón / Lugar</Label>
                  <Input 
                    placeholder="Nombre del salón" 
                    value={clientData.salon}
                    onChange={(e) => setClientData({...clientData, salon: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Fecha del Evento</Label>
                  <Input 
                    type="date"
                    value={clientData.fecha}
                    onChange={(e) => setClientData({...clientData, fecha: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASO 2: Servicio Principal */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Servicio Principal
              </CardTitle>
              <CardDescription className="text-gray-400">Selecciona un servicio (opcional si solo quieres PICPARTYLIVE)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cabina de Fotos */}
              <div className="space-y-2">
                <p className="text-pink-300 font-semibold flex items-center gap-2">
                  <span className="text-xl">📸</span> Cabina de Fotos
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {cabinaPrecios.map(({ horas, precio }) => (
                    <Button 
                      key={`cabina-${horas}`}
                      variant={mainService === "cabina" && serviceHours === horas ? "default" : "outline"}
                      className={`h-auto py-3 ${mainService === "cabina" && serviceHours === horas ? "bg-pink-500 text-white border-pink-500" : "border-pink-500/30 text-pink-300 hover:bg-pink-500/20"}`}
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
              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-cyan-300 font-semibold flex items-center gap-2">
                  <span className="text-xl">🎥</span> Video 360°
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {video360Precios.map(({ horas, precio }) => (
                    <Button 
                      key={`360-${horas}`}
                      variant={mainService === "video360" && serviceHours === horas ? "default" : "outline"}
                      className={`h-auto py-3 ${mainService === "video360" && serviceHours === horas ? "bg-cyan-500 text-white border-cyan-500" : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"}`}
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
                  className="text-gray-400 text-xs"
                  onClick={() => { setMainService(""); setServiceHours(0); }}
                >
                  ✕ Quitar servicio principal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* PASO 3: PICPARTYLIVE */}
          <Card className="bg-white/5 border-white/10 border-pink-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                <span className="text-pink-400">🔴 PICPARTYLIVE</span> <Badge className="bg-pink-500/20 text-pink-300 text-xs">Adicional</Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Muro en vivo con almacenamiento ILIMITADO. Incluye software de proyección en tiempo real para pantallas o TV. No incluye equipo físico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* $700 - Solo si tiene servicio */}
                <Button 
                  variant={includeLive && livePackage === 700 ? "default" : "outline"}
                  className={`h-auto py-4 ${includeLive && livePackage === 700 ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-300"} ${!mainService ? 'opacity-50' : ''}`}
                  onClick={() => { 
                    if (mainService) {
                      setIncludeLive(true); 
                      setLivePackage(700); 
                    } else {
                      toast.error("Selecciona primero un servicio (Cabina o 360) para este precio");
                    }
                  }}
                  data-testid="picpartylive-700"
                >
                  <div className="text-center">
                    <span className="text-2xl font-black">$700</span>
                    <div className="text-xs opacity-80 mt-1">Súper Precio</div>
                    <div className="text-[10px] opacity-60 mt-1">Al contratar servicio</div>
                    <Badge className="mt-2 bg-green-500/30 text-green-300 text-[9px]">NETO</Badge>
                  </div>
                </Button>
                
                {/* $1,000 - Promo Expo */}
                <Button 
                  variant={includeLive && livePackage === 1000 ? "default" : "outline"}
                  className={`h-auto py-4 ${includeLive && livePackage === 1000 ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-300"}`}
                  onClick={() => { setIncludeLive(true); setLivePackage(1000); }}
                  data-testid="picpartylive-1000"
                >
                  <div className="text-center">
                    <span className="text-2xl font-black">$1,000</span>
                    <div className="text-xs opacity-80 mt-1">Promo Expo</div>
                    <div className="text-[10px] opacity-60 mt-1">Precio temporal limitado</div>
                    <Badge className="mt-2 bg-green-500/30 text-green-300 text-[9px]">NETO</Badge>
                  </div>
                </Button>
                
                {/* $1,500 - Normal */}
                <Button 
                  variant={includeLive && livePackage === 1500 ? "default" : "outline"}
                  className={`h-auto py-4 ${includeLive && livePackage === 1500 ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-300"}`}
                  onClick={() => { setIncludeLive(true); setLivePackage(1500); }}
                  data-testid="picpartylive-1500"
                >
                  <div className="text-center">
                    <span className="text-2xl font-black">$1,500</span>
                    <div className="text-xs opacity-80 mt-1">Precio Normal</div>
                    <div className="text-[10px] opacity-60 mt-1">Sin servicio adicional</div>
                    <Badge className="mt-2 bg-green-500/30 text-green-300 text-[9px]">NETO</Badge>
                  </div>
                </Button>
              </div>
              
              {includeLive && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 text-xs mt-3"
                  onClick={() => { setIncludeLive(false); setLivePackage(0); }}
                >
                  ✕ Quitar PICPARTYLIVE
                </Button>
              )}
            </CardContent>
          </Card>

          {/* PASO 4: Descuento (opcional) */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                🏷️ Descuento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  min="0" 
                  max="50"
                  placeholder="0"
                  value={clientData.descuento || ""}
                  onChange={(e) => setClientData({...clientData, descuento: parseInt(e.target.value) || 0})}
                  className="bg-white/10 border-orange-500/30 text-orange-300 w-24 text-center"
                />
                <span className="text-orange-300">%</span>
                <span className="text-gray-500 text-sm">Máximo 50%</span>
              </div>
            </CardContent>
          </Card>

          {/* RESUMEN Y COTIZACIÓN */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-xl">Resumen de Cotización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Desglose */}
              <div className="space-y-2 text-gray-300">
                {mainService && serviceHours > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className={mainService === "cabina" ? "text-pink-300" : "text-cyan-300"}>
                      {mainService === "cabina" ? "📸 Cabina de Fotos" : "🎥 Video 360°"} ({serviceHours}h)
                    </span>
                    <span className="font-bold">{formatCurrency(getServicePrice())}</span>
                  </div>
                )}
                
                {includeLive && livePackage > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-pink-400">
                      🔴 PICPARTYLIVE 
                      <span className="text-xs ml-2 opacity-70">
                        ({livePackage === 700 ? "Súper Precio" : livePackage === 1000 ? "Promo Expo" : "Normal"})
                      </span>
                    </span>
                    <span className="font-bold">{formatCurrency(livePackage)}</span>
                  </div>
                )}
                
                {!mainService && !includeLive && (
                  <p className="text-gray-500 text-center py-4">Selecciona al menos un servicio</p>
                )}
              </div>
              
              {/* Subtotal y descuento */}
              {(mainService || includeLive) && (
                <>
                  <div className="flex justify-between text-white pt-2">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getServicePrice() + (includeLive ? livePackage : 0))}</span>
                  </div>
                  
                  {clientData.descuento > 0 && (
                    <div className="flex justify-between text-orange-400">
                      <span>Descuento ({clientData.descuento}%)</span>
                      <span>-{formatCurrency((getServicePrice() + (includeLive ? livePackage : 0)) * (clientData.descuento / 100))}</span>
                    </div>
                  )}
                  
                  {/* TOTAL */}
                  <div className="p-4 bg-purple-500/30 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 font-bold text-lg">TOTAL NETO</span>
                      <span className="text-white text-3xl font-black">
                        {formatCurrency(
                          (getServicePrice() + (includeLive ? livePackage : 0)) * (1 - clientData.descuento / 100)
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {/* Botones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                <Button 
                  onClick={calculateQuote} 
                  className="w-full bg-purple-500 hover:bg-purple-600 h-12 text-lg"
                  disabled={!mainService && !includeLive}
                  data-testid="generar-cotizacion-btn"
                >
                  Generar Cotización
                </Button>
                
                <Button 
                  onClick={downloadPDF} 
                  className="w-full bg-green-500 hover:bg-green-600 h-12 text-lg"
                  disabled={!quote}
                  data-testid="descargar-pdf-btn"
                >
                  📄 Descargar PDF
                </Button>
              </div>
              
              {/* Folio generado */}
              {folio && (
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm">Folio de cotización:</p>
                  <p className="text-white text-xl font-mono font-bold">{folio}</p>
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-white">PicParty</span>
          </div>
          <Link to="/cotizador">
            <Button className="bg-pink-500 hover:bg-pink-600">
              💰 Cotizar Ahora
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge animado */}
          <div className="mb-6">
            <Badge className="bg-pink-500/20 text-pink-300 px-4 py-2 text-lg animate-pulse">
              🔴 PICPARTYLIVE
            </Badge>
          </div>
          
          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            El Muro de Fotos{" "}
            <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              en Tiempo Real
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Todos los invitados suben fotos desde su celular y aparecen al instante en la pantalla del evento. Sin apps, sin complicaciones.
          </p>
          
          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => navigate('/cotizador')}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 shadow-lg shadow-pink-500/30"
              data-testid="landing-cotizar-btn"
            >
              ✨ Quiero PICPARTYLIVE en mi fiesta
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/live?code=9022')}
              className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10"
              data-testid="landing-demo-btn"
            >
              👀 Ver Demo (Código: 9022)
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/5 border-white/10 p-6 text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-white font-bold text-lg mb-2">Sin Apps</h3>
              <p className="text-gray-400 text-sm">Los invitados escanean un QR y suben fotos directamente desde el navegador.</p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center">
              <div className="text-4xl mb-3">📺</div>
              <h3 className="text-white font-bold text-lg mb-2">Proyección en Vivo</h3>
              <p className="text-gray-400 text-sm">Conecta a cualquier pantalla o TV. Efectos: Slideshow, Mosaico, Pop-up.</p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center">
              <div className="text-4xl mb-3">♾️</div>
              <h3 className="text-white font-bold text-lg mb-2">Almacenamiento Ilimitado</h3>
              <p className="text-gray-400 text-sm">Todas las fotos se guardan en la nube. Descárgalas cuando quieras.</p>
            </Card>
          </div>
          
          {/* Pricing Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Precios NETO</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="text-3xl font-black text-green-400 mb-2">$700</div>
                <div className="text-white font-semibold">Súper Precio</div>
                <p className="text-gray-400 text-sm mt-2">Al contratar Cabina de Fotos o Video 360°</p>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-6">
                <div className="text-3xl font-black text-pink-400 mb-2">$1,000</div>
                <div className="text-white font-semibold">Promo Expo</div>
                <p className="text-gray-400 text-sm mt-2">Precio temporal por tiempo limitado</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                <div className="text-3xl font-black text-purple-400 mb-2">$1,500</div>
                <div className="text-white font-semibold">Precio Normal</div>
                <p className="text-gray-400 text-sm mt-2">PICPARTYLIVE solo (sin servicio adicional)</p>
              </div>
            </div>
          </div>
          
          {/* CTA Final */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">¿Ya tienes un código de evento?</p>
            <Button 
              variant="outline"
              onClick={() => {
                const code = prompt("Ingresa el código de tu evento:");
                if (code) navigate(`/live?code=${code}`);
              }}
              className="border-white/30 text-white hover:bg-white/10"
            >
              🔑 Ingresar Código
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">PICPARTYLIVE • adoca.net</p>
          <p className="text-gray-600 text-sm mt-2">© 2025 PicParty - Cabina Fotográfica</p>
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

  // Agregar reacción a una foto
  const addReaction = async (photoId, emoji) => {
    try {
      await axios.post(`${API}/live/photos/${photoId}/react`, { emoji });
      // Actualizar galería
      if (session) fetchGalleryPhotos(session.code);
      toast.success(`${emoji} agregado!`);
    } catch (e) {
      toast.error("Error al reaccionar");
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

  // Slideshow automático
  useEffect(() => {
    if (viewMode === "projection" && projectionEffect === "slideshow" && galleryPhotos.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % galleryPhotos.length);
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
          // SEGURIDAD: Redirigir a landing si no hay sesión válida
          navigate('/');
          return;
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
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <span className="text-5xl">{PICPARTY_EMOJIS[Math.floor(Math.random() * PICPARTY_EMOJIS.length)]}</span>
          </div>
          <p className="text-white text-xl">Cargando... ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950">
      {/* Banner PWA flotante */}
      {showPWABanner && (
        <div className="fixed top-14 left-2 right-2 z-50 animate-in slide-in-from-top">
          <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-xl p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <p className="text-white text-sm font-medium">
                  ¿Subir fotos más rápido? ¡Agrega a inicio!
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={handleAddToHome} className="bg-white text-pink-600 hover:bg-white/90 text-xs px-2 h-7">
                  Agregar
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissPWABanner} className="text-white hover:bg-white/20 text-xs px-2 h-7">
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold text-white">PicParty</span>
            <Badge className="bg-red-500 animate-pulse text-xs">🔴 LIVE</Badge>
          </div>
          {session && (
            <Badge className="bg-purple-500/30 text-purple-200 text-xs">
              {session.code}
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-20">
        {!session ? (
          /* ============ PANTALLA DE ENTRADA ============ */
          <div className="max-w-md mx-auto text-center pt-8">
            {/* Barra de emojis decorativos */}
            <div className="flex justify-center gap-2 mb-4 text-2xl">
              {PICPARTY_EMOJIS.map((emoji, i) => (
                <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{emoji}</span>
              ))}
            </div>
            
            <div className="w-28 h-28 mx-auto bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-pink-500/30">
              <span className="text-5xl">👑</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">¡Únete a la Fiesta!</h1>
            <p className="text-gray-400 mb-6">Ingresa el código del evento ✨</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <Card className="bg-white/5 border-white/10 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <Input 
                  placeholder="CÓDIGO"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="bg-white/10 border-white/20 text-white text-center text-2xl h-14 tracking-[0.2em] font-bold"
                  data-testid="event-code-input"
                />
                <Button 
                  onClick={() => handleJoin()}
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 shadow-lg shadow-pink-500/30"
                  data-testid="join-event-btn"
                >
                  👑 ENTRAR AL EVENTO
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* ============ INTERFAZ MAESTRA PICPARTYLIVE ============ */
          <>
            {/* Banner DEMO para código 9022 */}
            {session.code === '9022' && (
              <div className="max-w-4xl mx-auto mb-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg animate-pulse">
                <p className="text-amber-300 text-sm text-center font-semibold">
                  ⚠️ Galería de Prueba: El contenido y las interacciones se eliminan automáticamente cada 24 horas.
                </p>
              </div>
            )}

            {/* ============ MODO MENÚ PRINCIPAL ============ */}
            {viewMode === "menu" && (
              <div className="max-w-2xl mx-auto px-4">
                {/* Header del evento */}
                <div className="text-center mb-8">
                  <div className="flex justify-center gap-3 mb-3 text-2xl">
                    {PICPARTY_EMOJIS.map((emoji, i) => (
                      <span key={i} className="opacity-70">{emoji}</span>
                    ))}
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">
                    ¡Bienvenido a la fiesta! 👸
                  </h1>
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                    {session.event_name}
                  </p>
                  {session.event_type && (
                    <Badge className="mt-3 bg-purple-500/30 text-purple-200 text-base px-4 py-1">
                      {session.event_type === 'boda' && '💍 Boda'}
                      {session.event_type === 'quinceanios' && '👑 Quinceaños'}
                      {session.event_type === 'cumpleanos' && '🎂 Cumpleaños'}
                      {session.event_type === 'empresarial' && '🏢 Empresarial'}
                      {session.event_type === 'fiesta' && '💃 Fiesta'}
                      {session.event_type === 'publico' && '✨ Evento Público'}
                      {session.event_type === 'otro' && `✨ ${session.event_type_custom || 'Evento'}`}
                    </Badge>
                  )}
                  <p className="text-gray-400 mt-3">📸 {galleryPhotos.length} fotos en la galería</p>
                </div>

                {/* 3 BOTONES PRINCIPALES */}
                <div className="grid gap-4 mb-8">
                  {/* Botón PROYECTAR */}
                  <Button
                    className="h-24 text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-cyan-500/30"
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

                  {/* Botón VER GALERÍA */}
                  <Button
                    className="h-24 text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/30"
                    onClick={() => setViewMode("gallery")}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">📸</span>
                      <div className="text-left">
                        <div>VER GALERÍA</div>
                        <div className="text-sm font-normal opacity-80">Ver fotos y subir nuevas</div>
                      </div>
                    </div>
                  </Button>

                  {/* Botón DESCARGAR */}
                  <Button
                    className="h-24 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg shadow-green-500/30"
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
                  className="w-full text-gray-400 hover:text-white text-sm"
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
                  className="mb-4 text-gray-400 hover:text-white"
                  onClick={() => setViewMode("menu")}
                >
                  ← Volver al menú
                </Button>
                
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  📺 Selecciona el Efecto de Proyección
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Slideshow */}
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 ${projectionEffect === 'slideshow' ? 'ring-2 ring-cyan-500 bg-cyan-500/20' : 'bg-white/5'} border-white/10`}
                    onClick={() => setProjectionEffect('slideshow')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">🖼️</div>
                      <h3 className="text-white font-bold text-lg">Slideshow</h3>
                      <p className="text-gray-400 text-sm mt-2">Una foto con transición suave (Fade)</p>
                    </CardContent>
                  </Card>

                  {/* Mosaico */}
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 ${projectionEffect === 'mosaic' ? 'ring-2 ring-pink-500 bg-pink-500/20' : 'bg-white/5'} border-white/10`}
                    onClick={() => setProjectionEffect('mosaic')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">🔲</div>
                      <h3 className="text-white font-bold text-lg">Mosaico</h3>
                      <p className="text-gray-400 text-sm mt-2">Cuadrícula dinámica de fotos</p>
                    </CardContent>
                  </Card>

                  {/* Pop-up */}
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 ${projectionEffect === 'popup' ? 'ring-2 ring-purple-500 bg-purple-500/20' : 'bg-white/5'} border-white/10`}
                    onClick={() => setProjectionEffect('popup')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">✨</div>
                      <h3 className="text-white font-bold text-lg">Pop-up</h3>
                      <p className="text-gray-400 text-sm mt-2">Foto nueva aparece grande 5 seg</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  onClick={() => { setViewMode("projection"); fetchGalleryPhotos(session.code); }}
                >
                  🚀 Iniciar Proyección
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

                {/* EFECTO SLIDESHOW */}
                {projectionEffect === "slideshow" && galleryPhotos.length > 0 && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <img 
                      src={galleryPhotos[currentSlideIndex]?.cloudinary_url}
                      alt="Foto del evento"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-1000"
                      style={{ animation: 'fadeIn 1s ease-in-out' }}
                    />
                  </div>
                )}

                {/* EFECTO MOSAICO */}
                {projectionEffect === "mosaic" && (
                  <div className="w-full h-full p-4 overflow-hidden">
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 h-full auto-rows-fr">
                      {galleryPhotos.slice(0, 24).map((photo, idx) => (
                        <div 
                          key={photo._id || idx} 
                          className="relative overflow-hidden rounded-lg"
                          style={{ animation: `fadeIn 0.5s ease-in-out ${idx * 0.1}s both` }}
                        >
                          <img 
                            src={photo.thumbnail_url || photo.cloudinary_url}
                            alt="Foto"
                            className="w-full h-full object-cover"
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                        <div className="relative" style={{ animation: 'scaleIn 0.5s ease-out' }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-pink-500 px-4 py-1 rounded-full text-white font-bold">
                            📸 ¡NUEVA FOTO!
                          </div>
                          <img 
                            src={newPhotoPopup.cloudinary_url}
                            alt="Nueva foto"
                            className="max-w-[80vw] max-h-[80vh] object-contain rounded-xl shadow-2xl ring-4 ring-pink-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mensaje de espera */}
                    {!newPhotoPopup && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-white/60">
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
                    <div className="text-center text-white">
                      <div className="text-8xl mb-4">📷</div>
                      <h3 className="text-2xl font-bold mb-2">Sin fotos aún</h3>
                      <p className="text-gray-400">Las fotos aparecerán aquí en tiempo real</p>
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
                  className="mb-4 text-gray-400 hover:text-white"
                  onClick={() => setViewMode("menu")}
                >
                  ← Volver al menú
                </Button>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">📸 Galería de {session.event_name}</h2>
                  <p className="text-gray-400">{galleryPhotos.length} fotos</p>
                </div>

                {/* TABS: Subir / Ver */}
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant={activeTab === "upload" ? "default" : "outline"}
                    className={activeTab === "upload" ? "flex-1 bg-pink-500" : "flex-1 border-white/20 text-white"}
                    onClick={() => setActiveTab("upload")}
                  >
                    ➕ Subir Fotos
                  </Button>
                  <Button 
                    variant={activeTab === "gallery" ? "default" : "outline"}
                    className={activeTab === "gallery" ? "flex-1 bg-purple-500" : "flex-1 border-white/20 text-white"}
                    onClick={() => { setActiveTab("gallery"); fetchGalleryPhotos(session.code); }}
                  >
                    🖼️ Ver Fotos ({galleryPhotos.length})
                  </Button>
                </div>

                {activeTab === "upload" ? (
                  <Card className="bg-white/5 border-white/10 backdrop-blur">
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
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${uploading ? 'border-pink-500 bg-pink-500/10' : 'border-white/30 hover:border-pink-500 hover:bg-white/5'}`}>
                          {uploading ? (
                            <div className="space-y-3">
                              <div className="text-5xl animate-bounce">📤</div>
                              <p className="text-white font-bold">Subiendo foto {currentFileIndex} de {totalFiles}...</p>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <div className="bg-pink-500 h-3 rounded-full transition-all" style={{width: `${uploadProgress}%`}}></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-6xl mb-4">📸</div>
                              <p className="text-white font-bold text-xl mb-2">SUBIR MIS FOTOS</p>
                              <p className="text-gray-400 text-sm">Toca para seleccionar hasta 10 fotos</p>
                            </>
                          )}
                        </div>
                      </label>
                      
                      {/* Info de almacenamiento */}
                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-300/80 text-sm text-center">
                          ✓ Almacenamiento de fotos ILIMITADO. La resolución depende del celular.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Grid de galería */
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {galleryPhotos.map((photo, idx) => (
                      <Card key={photo._id || idx} className="bg-white/5 border-white/10 overflow-hidden group">
                        <div className="relative aspect-square">
                          <img 
                            src={photo.thumbnail_url || photo.cloudinary_url} 
                            alt="Foto del evento"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Overlay con reacciones */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <div className="flex justify-center gap-1 flex-wrap">
                              {PICPARTY_EMOJIS.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(photo._id, emoji)}
                                  className="bg-white/20 hover:bg-white/40 rounded-full px-2 py-1 text-sm transition-all hover:scale-110"
                                >
                                  {emoji} {photo.reactions?.[emoji] || 0}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {galleryPhotos.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="text-5xl mb-3">📷</div>
                        <p className="text-gray-400">No hay fotos aún. ¡Sé el primero en subir!</p>
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
                  className="mb-4 text-gray-400 hover:text-white"
                  onClick={() => setViewMode("menu")}
                >
                  ← Volver al menú
                </Button>

                <Card className="bg-white/5 border-white/10 backdrop-blur">
                  <CardHeader className="text-center">
                    <div className="text-5xl mb-2">📥</div>
                    <CardTitle className="text-white">Descargar Evento</CardTitle>
                    <CardDescription className="text-gray-400">
                      Descarga todas las fotos del evento. Usa los últimos 4 dígitos del teléfono del cliente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Contraseña de Descarga</Label>
                      <Input 
                        type="password"
                        placeholder="Últimos 4 dígitos del teléfono"
                        maxLength={4}
                        value={downloadPassword}
                        onChange={(e) => setDownloadPassword(e.target.value.replace(/\D/g, ''))}
                        className="bg-white/10 border-white/20 text-white mt-1 text-center text-xl tracking-widest"
                      />
                      <p className="text-gray-500 text-xs mt-1">Ej: Si el teléfono es 5512345678, la clave es 5678</p>
                      {downloadError && (
                        <p className="text-red-400 text-sm mt-1">{downloadError}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-gray-300 text-sm">
                        <strong>📊 Resumen:</strong><br/>
                        • Evento: {session.event_name}<br/>
                        • Fotos disponibles: {galleryPhotos.length}<br/>
                        • Carpeta: {session.cloudinary_folder || 'ADOCA/...'}
                      </p>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleDownload}
                      disabled={isDownloading || galleryPhotos.length === 0}
                    >
                      {isDownloading ? '⏳ Preparando...' : '📥 Descargar Fotos'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer con botón de ventas y privacidad - Solo en modo menú y galería */}
      {viewMode !== "projection" && (
        <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 py-3 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-2">
              {/* Botón de ventas */}
              <Link to="/cotizador">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-bold shadow-lg"
                >
                  ✨ ¡Quiero PICPARTYLIVE en mi fiesta!
                </Button>
              </Link>
              {/* Footer info */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400">PICPARTYLIVE • adoca.net</span>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  🔒 Seguridad y Privacidad
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Modal de Privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-purple-500/50 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🔒 Seguridad y Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300 text-sm">
              <div>
                <h4 className="text-pink-400 font-bold mb-1">Control del Anfitrión</h4>
                <p>Solo el anfitrión decide quién puede ver y subir fotos mediante códigos de acceso únicos.</p>
              </div>
              <div>
                <h4 className="text-pink-400 font-bold mb-1">Fotos Privadas</h4>
                <p>Las fotos solo son visibles para invitados autorizados con el código del evento.</p>
              </div>
              <div>
                <h4 className="text-pink-400 font-bold mb-1">Sin Apps que Descargar</h4>
                <p>Acceso directo desde cualquier navegador. Sin instalaciones ni registros.</p>
              </div>
              <div>
                <h4 className="text-pink-400 font-bold mb-1">Protección de Datos</h4>
                <p>Tus fotos se almacenan de forma segura. El anfitrión tiene control total para eliminar contenido.</p>
              </div>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600 mt-4"
                onClick={() => setShowPrivacyModal(false)}
              >
                Entendido ✓
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

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [events, setEvents] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [preferences, setPreferences] = useState({ show_net_price: true });
  const [loading, setLoading] = useState(true);
  const [photosCounts, setPhotosCounts] = useState({}); // Contador de fotos por evento
  const [newEvent, setNewEvent] = useState({ name: "", date: "", time: "", description: "", fotoshare_url: "", video360_url: "", location: "", has_photos: true, has_video360: false, color: "" });
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
    duration_hours: 4, contract_type: "public", base_package: "standard",
    base_price: 5000, include_video360: false, include_live: false,
    extras: [], discount_percent: 0, special_price: null, notes: ""
  });
  const [contractPreview, setContractPreview] = useState(null);
  
  // Estado para edición de sesiones Live
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({
    event_name: "",
    event_type: "",
    event_type_custom: "",
    event_date: "",
    code: ""
  });

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Credenciales: OCTAVIO / CHELO1980 (o admin / admin para pruebas)
    const isValidMain = loginUser === ADMIN_USER && loginPass === ADMIN_PASS;
    const isValidBackup = loginUser === "ADMIN" && loginPass === "admin123";
    
    if (isValidMain || isValidBackup) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      toast.success("¡Bienvenido, Octavio!");
    } else {
      toast.error("Credenciales incorrectas");
      console.log("Login attempt - User:", loginUser, "Pass length:", loginPass.length);
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

  const createLiveSession = async () => {
    if (!newSession.event_name || !newSession.event_date) { 
      toast.error("Nombre y fecha son requeridos"); 
      return; 
    }
    
    // Validar teléfono (obligatorio)
    if (!newSession.client_phone || newSession.client_phone.length < 10) {
      toast.error("El teléfono del cliente es obligatorio (10 dígitos)");
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
    toast.info("Generando PDF de alta calidad...");
    
    try {
      const qrUrl = `https://${SITE_DOMAIN}/live?code=${session.code}`;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Fondo púrpura profundo
      pdf.setFillColor(59, 7, 100);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // === LOGO PICPARTY ARRIBA ===
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
          pdf.addImage(logoImg, 'PNG', (pageWidth - 60) / 2, 15, 60, 60);
        }
      } catch(e) {
        pdf.setFontSize(32);
        pdf.setTextColor(255, 255, 255);
        pdf.text("PICPARTY", pageWidth / 2, 45, { align: 'center' });
      }
      
      // Tipo de evento
      const typeInfo = getEventTypeInfo(session.event_type, session.event_type_custom);
      pdf.setFontSize(18);
      pdf.setTextColor(236, 72, 153);
      pdf.text(`${typeInfo.label.toUpperCase()}`, pageWidth / 2, 90, { align: 'center' });
      
      // === QR EN ALTA RESOLUCIÓN ===
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
      
      const qrSize = 120;
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      pdf.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 100, qrSize, qrSize);
      
      // Nombre del evento
      pdf.setFontSize(26);
      pdf.setTextColor(255, 255, 255);
      pdf.text(session.event_name.toUpperCase(), pageWidth / 2, 235, { align: 'center' });
      
      // Fecha del evento
      if (session.event_date) {
        pdf.setFontSize(14);
        pdf.setTextColor(200, 200, 200);
        const formattedDate = new Date(session.event_date + 'T12:00:00').toLocaleDateString('es-MX', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        pdf.text(formattedDate, pageWidth / 2, 245, { align: 'center' });
      }
      
      // Footer
      pdf.setFontSize(11);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Escanea el código QR para ver y compartir fotos", pageWidth / 2, 262, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`adoca.net | Código: ${session.code}`, pageWidth / 2, 270, { align: 'center' });
      
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
    let subtotal = contractForm.base_price * contractForm.duration_hours;
    subtotal += contractForm.extras.length * 500;
    if (contractForm.include_video360) subtotal += 3000;
    if (contractForm.include_live) subtotal += 2000;
    
    const discountAmount = subtotal * (contractForm.discount_percent / 100);
    let netPrice;
    
    if (contractForm.contract_type === "special" && contractForm.special_price) {
      netPrice = contractForm.special_price;
    } else {
      netPrice = subtotal - discountAmount;
    }
    
    setContractPreview({ subtotal, discountAmount, netPrice });
  };

  const createContract = async () => {
    if (!contractForm.client_name || !contractForm.client_phone || !contractForm.event_name || !contractForm.salon || !contractForm.event_date) {
      toast.error("Complete los campos obligatorios");
      return;
    }
    try {
      await axios.post(`${API}/contracts`, contractForm);
      toast.success("Contrato creado exitosamente");
      setShowContractForm(false);
      setContractForm({
        client_name: "", client_phone: "", client_email: "",
        event_name: "", salon: "", event_date: "", event_time: "", service_time: "",
        duration_hours: 4, contract_type: "public", base_package: "standard",
        base_price: 5000, include_video360: false, include_live: false,
        extras: [], discount_percent: 0, special_price: null, notes: ""
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

  const printContractPDF = async (contract) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const formatCurrency = (amt) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amt);
    
    // Header púrpura
    pdf.setFillColor(88, 28, 135);
    pdf.rect(0, 0, pageWidth, 55, 'F');
    
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise(r => { logoImg.onload = r; setTimeout(r, 2000); });
      pdf.addImage(logoImg, 'PNG', 15, 8, 40, 40);
    } catch(e) {}
    
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.text("CONTRATO DE SERVICIOS", pageWidth - 20, 25, { align: 'right' });
    pdf.setFontSize(12);
    pdf.text(contract.contract_type === "special" ? "PROVEEDOR / ESPECIAL" : "PÚBLICO", pageWidth - 20, 35, { align: 'right' });
    pdf.text(`#${contract.id.substring(0, 8).toUpperCase()}`, pageWidth - 20, 45, { align: 'right' });
    
    let y = 70;
    pdf.setTextColor(50, 50, 50);
    
    // Datos del cliente
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("DATOS DEL CLIENTE", 20, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Nombre: ${contract.client_name}`, 20, y); y += 6;
    pdf.text(`Teléfono: ${contract.client_phone}`, 20, y); y += 6;
    if (contract.client_email) { pdf.text(`Email: ${contract.client_email}`, 20, y); y += 6; }
    
    y += 8;
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(14);
    pdf.text("DATOS DEL EVENTO", 20, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Evento: ${contract.event_name}`, 20, y); y += 6;
    pdf.text(`Salón: ${contract.salon}`, 20, y); y += 6;
    pdf.text(`Fecha: ${contract.event_date}`, 20, y); y += 6;
    pdf.text(`Horario Evento: ${contract.event_time || 'Por definir'}`, 20, y); y += 6;
    pdf.text(`Horario Servicio: ${contract.service_time || 'Por definir'}`, 20, y); y += 6;
    pdf.text(`Duración: ${contract.duration_hours} horas`, 20, y); y += 6;
    
    y += 8;
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(14);
    pdf.text("DESGLOSE DE SERVICIOS", 20, y);
    y += 10;
    
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, y - 5, pageWidth - 40, 8, 'F');
    pdf.setFontSize(10);
    pdf.text("Concepto", 25, y);
    pdf.text("Precio", pageWidth - 45, y, { align: 'right' });
    y += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.text(`Servicio Fotográfico (${contract.duration_hours} hrs)`, 25, y);
    pdf.text(formatCurrency(contract.base_price * contract.duration_hours), pageWidth - 45, y, { align: 'right' });
    y += 7;
    
    if (contract.include_video360) {
      pdf.text("Video 360°", 25, y);
      pdf.text(formatCurrency(3000), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    if (contract.include_live) {
      pdf.text("PICPARTYLIVE", 25, y);
      pdf.text(formatCurrency(2000), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    
    y += 5;
    pdf.line(20, y, pageWidth - 20, y);
    y += 8;
    
    pdf.text("Subtotal:", 25, y);
    pdf.text(formatCurrency(contract.subtotal), pageWidth - 45, y, { align: 'right' });
    y += 7;
    
    // Descuento en NARANJA
    if (contract.discount_percent > 0) {
      pdf.setTextColor(234, 88, 12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`DESCUENTO (${contract.discount_percent}%):`, 25, y);
      pdf.text(`-${formatCurrency(contract.discount_amount)}`, pageWidth - 45, y, { align: 'right' });
      y += 10;
      pdf.setTextColor(50, 50, 50);
    }
    
    // Precio Neto Final
    pdf.setFillColor(88, 28, 135);
    pdf.rect(20, y - 5, pageWidth - 40, 14, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("PRECIO NETO FINAL:", 25, y + 4);
    pdf.text(formatCurrency(contract.net_price), pageWidth - 45, y + 4, { align: 'right' });
    
    // Footer
    y = 255;
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont(undefined, 'normal');
    pdf.text("* Precios Netos. Contrato válido por 15 días.", pageWidth / 2, y, { align: 'center' });
    pdf.text("PicParty - Cabina Fotográfica | adoca.net", pageWidth / 2, y + 5, { align: 'center' });
    
    pdf.save(`Contrato_PicParty_${contract.client_name.replace(/\s+/g, '_')}.pdf`);
    toast.success("Contrato PDF descargado");
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <img src={PICPARTY_LOGO} alt="PicParty" className="w-32 h-32 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl">Panel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input 
                  placeholder="Usuario" 
                  value={loginUser} 
                  onChange={(e) => setLoginUser(e.target.value.toUpperCase())} 
                  className="bg-white/10 border-white/20 text-white"
                  autoComplete="username"
                />
                <p className="text-gray-500 text-xs mt-1">Usuario: OCTAVIO</p>
              </div>
              <div>
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={loginPass} 
                  onChange={(e) => setLoginPass(e.target.value)} 
                  className="bg-white/10 border-white/20 text-white"
                  autoComplete="current-password"
                />
                <p className="text-gray-500 text-xs mt-1">Contraseña: CHELO1980</p>
              </div>
              <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">🔐 Ingresar</Button>
            </form>
            <Link to="/" className="block text-center mt-4 text-gray-400 hover:text-white">← Volver</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-white/10 bg-slate-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10" />
            <span className="text-xl font-bold text-white">Admin</span>
            <Badge className="bg-green-500/20 text-green-400">👤 OCTAVIO</Badge>
          </div>
          <div className="flex gap-2">
            <Link to="/"><Button variant="outline" className="border-white/20 text-white">← Inicio</Button></Link>
            <Button variant="destructive" onClick={() => { sessionStorage.removeItem("adminAuth"); setIsAuthenticated(false); }}>Salir</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="contracts">
          <TabsList className="bg-slate-800 border border-white/10">
            <TabsTrigger value="contracts" className="data-[state=active]:bg-green-500">📄 Contratos ({contracts.length})</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-500">📸 Galería Pro ({events.length})</TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-cyan-500">🔴 PICPARTYLIVE ({liveSessions.length})</TabsTrigger>
            <TabsTrigger value="cloudinary" className="data-[state=active]:bg-orange-500">☁️ Cloudinary</TabsTrigger>
          </TabsList>

          {/* ============ PESTAÑA DE CONTRATOS ============ */}
          <TabsContent value="contracts" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-white text-xl font-bold">Centro de Contratos</h2>
                <p className="text-gray-400 text-sm">Gestiona contratos independientes con precios netos</p>
              </div>
              <Button onClick={() => setShowContractForm(true)} className="bg-green-500 hover:bg-green-600">
                📄 Crear Contrato
              </Button>
            </div>

            {/* Formulario de Contrato */}
            {showContractForm && (
              <Card className="bg-slate-800 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    <span>Nuevo Contrato</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowContractForm(false)} className="text-gray-400">✕</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tipo de Contrato */}
                  <div className="flex gap-4 p-3 bg-slate-700 rounded">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="contract_type" checked={contractForm.contract_type === "public"} 
                        onChange={() => setContractForm({...contractForm, contract_type: "public", special_price: null})} />
                      <Label className="text-white">📋 Contrato Público (Precios Netos)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="contract_type" checked={contractForm.contract_type === "special"} 
                        onChange={() => setContractForm({...contractForm, contract_type: "special"})} />
                      <Label className="text-orange-400">🤝 Contrato Proveedor/Especial</Label>
                    </div>
                  </div>

                  {/* Datos del Cliente */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white">Nombre Cliente *</Label>
                      <Input value={contractForm.client_name} onChange={(e) => setContractForm({...contractForm, client_name: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-white">Teléfono *</Label>
                      <Input value={contractForm.client_phone} onChange={(e) => setContractForm({...contractForm, client_phone: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-white">Email</Label>
                      <Input value={contractForm.client_email} onChange={(e) => setContractForm({...contractForm, client_email: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                  </div>

                  {/* Datos del Evento */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white">Nombre Evento *</Label>
                      <Input value={contractForm.event_name} onChange={(e) => setContractForm({...contractForm, event_name: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-white">Salón *</Label>
                      <Input value={contractForm.salon} onChange={(e) => setContractForm({...contractForm, salon: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-white">Fecha Evento *</Label>
                      <Input type="date" value={contractForm.event_date} onChange={(e) => setContractForm({...contractForm, event_date: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white">Horario Evento</Label>
                      <Input placeholder="ej: 6:00 PM" value={contractForm.event_time} onChange={(e) => setContractForm({...contractForm, event_time: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-white">Horario Servicio</Label>
                      <Input placeholder="ej: 7:00 PM - 11:00 PM" value={contractForm.service_time} onChange={(e) => setContractForm({...contractForm, service_time: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-white">Duración (horas)</Label>
                      <Select value={contractForm.duration_hours.toString()} onValueChange={(v) => setContractForm({...contractForm, duration_hours: parseInt(v)})}>
                        <SelectTrigger className="bg-slate-700 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[2,3,4,5,6,8,10].map(h => <SelectItem key={h} value={h.toString()}>{h} horas</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Paquete y Precio */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white">Paquete Base</Label>
                      <Select value={contractForm.base_price.toString()} onValueChange={(v) => setContractForm({...contractForm, base_price: parseInt(v)})}>
                        <SelectTrigger className="bg-slate-700 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3000">Básico - $3,000/hr</SelectItem>
                          <SelectItem value="5000">Estándar - $5,000/hr</SelectItem>
                          <SelectItem value="8000">Premium - $8,000/hr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={contractForm.include_video360} onCheckedChange={(c) => setContractForm({...contractForm, include_video360: c})} />
                        <Label className="text-cyan-400">🎥 Video 360° (+$3,000)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={contractForm.include_live} onCheckedChange={(c) => setContractForm({...contractForm, include_live: c})} />
                        <Label className="text-pink-400">🔴 Live (+$2,000)</Label>
                      </div>
                    </div>
                    <div>
                      <Label className="text-orange-400">🏷️ Descuento (%)</Label>
                      <Input type="number" min="0" max="50" value={contractForm.discount_percent} onChange={(e) => setContractForm({...contractForm, discount_percent: parseInt(e.target.value) || 0})} className="bg-slate-700 border-orange-500/30 text-orange-400" />
                    </div>
                  </div>

                  {/* Precio Especial (solo si es contrato especial) */}
                  {contractForm.contract_type === "special" && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                      <Label className="text-orange-400 font-bold">💰 Precio Especial (Convenio)</Label>
                      <Input type="number" placeholder="Ingresa el precio final acordado" value={contractForm.special_price || ""} onChange={(e) => setContractForm({...contractForm, special_price: parseInt(e.target.value) || null})} className="bg-slate-700 border-orange-500/30 text-orange-300 mt-2" />
                    </div>
                  )}

                  {/* Notas */}
                  <div>
                    <Label className="text-white">Notas adicionales</Label>
                    <Textarea value={contractForm.notes} onChange={(e) => setContractForm({...contractForm, notes: e.target.value})} className="bg-slate-700 border-white/10 text-white" rows={2} />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3">
                    <Button onClick={calculateContractPreview} variant="outline" className="border-white/20 text-white">
                      🧮 Calcular
                    </Button>
                    <Button onClick={createContract} className="bg-green-500 hover:bg-green-600">
                      ✓ Crear Contrato
                    </Button>
                  </div>

                  {/* Preview del cálculo */}
                  {contractPreview && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                      <div className="flex justify-between text-white">
                        <span>Subtotal:</span>
                        <span>${contractPreview.subtotal.toLocaleString()}</span>
                      </div>
                      {contractForm.discount_percent > 0 && (
                        <div className="flex justify-between text-orange-400">
                          <span>Descuento ({contractForm.discount_percent}%):</span>
                          <span>-${contractPreview.discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-green-400 font-bold text-xl mt-2 pt-2 border-t border-green-500/30">
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
              <Card className="bg-slate-800/50 border-white/10 border-dashed">
                <CardContent className="p-8 text-center">
                  <span className="text-5xl block mb-4">📄</span>
                  <p className="text-gray-400">No hay contratos creados</p>
                  <p className="text-gray-500 text-sm">Crea tu primer contrato con el botón de arriba</p>
                </CardContent>
              </Card>
            ) : (
              contracts.map(contract => (
                <Card key={contract.id} className="bg-slate-800 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{contract.event_name}</h3>
                          <Badge className={contract.contract_type === "special" ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}>
                            {contract.contract_type === "special" ? "🤝 Especial" : "📋 Público"}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400">{contract.status}</Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{contract.client_name} • {contract.client_phone}</p>
                        <p className="text-gray-500 text-sm">{contract.salon} • {contract.event_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-2xl">${contract.net_price?.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">Precio Neto</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-blue-500" onClick={() => printContractPDF(contract)}>📄 PDF</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteContract(contract.id)}>Eliminar</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ============ PESTAÑA GALERÍA PRO ============ */}
          <TabsContent value="events" className="space-y-4 mt-4">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <p className="text-purple-300 font-semibold">📸 Galería Pro - Solo Visualización</p>
                <p className="text-gray-400 text-sm">Estos eventos son para mostrar en IFRAME. NO generan carpetas en Cloudinary.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-white/10">
              <CardHeader><CardTitle className="text-white">Crear Evento de Galería</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="NOMBRE" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value.toUpperCase()})} className="bg-slate-700 border-white/10 text-white" />
                  <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <Input placeholder="Ubicación" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <Input placeholder="URL Fotoshare (IFRAME)" value={newEvent.fotoshare_url} onChange={(e) => setNewEvent({...newEvent, fotoshare_url: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <Input placeholder="URL Video 360" value={newEvent.video360_url} onChange={(e) => setNewEvent({...newEvent, video360_url: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <Button onClick={createEvent} className="bg-purple-500">✓ Crear</Button>
                </div>
              </CardContent>
            </Card>
            {events.map(event => (
              <Card key={event.id} className="bg-slate-800 border-white/10">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded flex items-center justify-center text-2xl" style={{backgroundColor: event.color || "#7C3AED"}}>📸</div>
                    <div>
                      <h3 className="text-white font-bold">{event.name}</h3>
                      <p className="text-gray-400 text-sm">{event.date} • {event.location}</p>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-1">Solo visualización IFRAME</Badge>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteEvent(event.id)}>Eliminar</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ============ PESTAÑA PICPARTYLIVE ============ */}
          <TabsContent value="live" className="space-y-4 mt-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <p className="text-cyan-300 font-semibold">🔴 PICPARTYLIVE - Muro en Vivo</p>
                <p className="text-gray-400 text-sm">Estos eventos generan carpeta automática en Cloudinary y código QR para invitados. Incluye software de proyección en tiempo real para pantallas o TV. No incluye equipo físico (pantallas/cableado).</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Crear Sesión Live</CardTitle>
                <CardDescription className="text-gray-400">El código de 4 dígitos se genera automáticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fila 1: Nombre del Evento */}
                <div>
                  <Label className="text-white text-sm">Nombre del Evento *</Label>
                  <Input 
                    placeholder="ej: Boda de Pedro y María" 
                    value={newSession.event_name} 
                    onChange={(e) => setNewSession({...newSession, event_name: e.target.value})} 
                    className="bg-slate-700 border-white/10 text-white mt-1" 
                  />
                </div>
                
                {/* Fila 2: Tipo de Evento y Fecha */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white text-sm">Tipo de Evento *</Label>
                    <Select 
                      value={newSession.event_type} 
                      onValueChange={(v) => setNewSession({...newSession, event_type: v, event_type_custom: v === "otro" ? newSession.event_type_custom : ""})}
                    >
                      <SelectTrigger className="bg-slate-700 border-white/10 text-white mt-1">
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
                    <Label className="text-white text-sm">Fecha del Evento *</Label>
                    <Input 
                      type="date" 
                      value={newSession.event_date} 
                      onChange={(e) => setNewSession({...newSession, event_date: e.target.value})} 
                      className="bg-slate-700 border-white/10 text-white mt-1" 
                    />
                  </div>
                </div>
                
                {/* Campo de Teléfono del Cliente (OBLIGATORIO) */}
                <div>
                  <Label className="text-white text-sm">Teléfono del Cliente * <span className="text-pink-400 text-xs">(Clave de descarga)</span></Label>
                  <Input 
                    type="tel"
                    placeholder="10 dígitos - Ej: 5512345678" 
                    maxLength={10}
                    value={newSession.client_phone} 
                    onChange={(e) => setNewSession({...newSession, client_phone: e.target.value.replace(/\D/g, '')})} 
                    className="bg-slate-700 border-white/10 text-white mt-1" 
                  />
                  <p className="text-gray-500 text-xs mt-1">Los últimos 4 dígitos serán la clave para descargar las fotos</p>
                </div>
                
                {/* Campo personalizado si es "Otro" */}
                {newSession.event_type === "otro" && (
                  <div>
                    <Label className="text-white text-sm">Especifica el tipo de evento</Label>
                    <Input 
                      placeholder="ej: Graduación, Bautizo, etc." 
                      value={newSession.event_type_custom} 
                      onChange={(e) => setNewSession({...newSession, event_type_custom: e.target.value})} 
                      className="bg-slate-700 border-white/10 text-white mt-1" 
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
                    <Label className="text-yellow-400">⭐ Evento VIP</Label>
                  </div>
                  <Button onClick={createLiveSession} className="bg-cyan-500 hover:bg-cyan-600 px-6">
                    ✓ Crear Sesión Live
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Lista de sesiones - Ordenadas por fecha descendente */}
            {liveSessions.length === 0 ? (
              <Card className="bg-slate-800/50 border-white/10 border-dashed">
                <CardContent className="p-8 text-center">
                  <span className="text-5xl block mb-4">🔴</span>
                  <p className="text-gray-400">No hay sesiones Live creadas</p>
                  <p className="text-gray-500 text-sm">Crea tu primera sesión con el formulario de arriba</p>
                </CardContent>
              </Card>
            ) : (
              [...liveSessions]
                .sort((a, b) => new Date(b.event_date || '1970-01-01') - new Date(a.event_date || '1970-01-01'))
                .map(session => {
                  const typeInfo = getEventTypeInfo(session.event_type, session.event_type_custom);
                  return (
                    <Card key={session.id} className="bg-slate-800 border-white/10 hover:border-cyan-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          {/* Lado izquierdo: QR y datos */}
                          <div className="flex items-start gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-lg">
                              <QRCodeSVG value={`https://${SITE_DOMAIN}/live?code=${session.code}`} size={70} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-bold text-lg">{session.code}</span>
                                <Badge className={session.is_active ? "bg-green-500/80" : "bg-gray-500"}>
                                  {session.is_active ? "🟢 Activo" : "⚫ Inactivo"}
                                </Badge>
                                {session.is_vip && <Badge className="bg-yellow-500/80">⭐ VIP</Badge>}
                              </div>
                              <p className="text-gray-200 font-medium">{session.event_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                  {typeInfo.emoji} {typeInfo.label}
                                </Badge>
                                {session.event_date && (
                                  <span className="text-gray-400 text-sm">
                                    📅 {new Date(session.event_date + 'T12:00:00').toLocaleDateString('es-MX', { 
                                      day: 'numeric', month: 'short', year: 'numeric' 
                                    })}
                                  </span>
                                )}
                                {/* Contador de fotos en tiempo real */}
                                <Badge className="bg-pink-500/30 text-pink-300 text-xs animate-pulse">
                                  📸 {photosCounts[session.code] || 0} fotos
                                </Badge>
                              </div>
                              <p className="text-cyan-400 text-xs mt-2 font-mono">
                                https://{SITE_DOMAIN}/live?code={session.code}
                              </p>
                              {/* Botones de compartir */}
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 text-xs h-7"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`https://${SITE_DOMAIN}/live?code=${session.code}`);
                                    toast.success("🔗 Link copiado al portapapeles");
                                  }}
                                >
                                  🔗 Copiar Link
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-green-500 hover:bg-green-600 text-xs h-7"
                                  onClick={() => {
                                    const msg = encodeURIComponent(`¡Hola! Tu evento *${session.event_name}* en PICPARTYLIVE está listo.\n\n📸 Acceso directo: https://${SITE_DOMAIN}/live?code=${session.code}\n\n¡Sube tus fotos y compártelas con todos!`);
                                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                                  }}
                                >
                                  🟢 WhatsApp
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Lado derecho: Botones */}
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              className="bg-blue-500 hover:bg-blue-600" 
                              onClick={() => printQRPDF(session)}
                              data-testid={`print-qr-${session.code}`}
                            >
                              🖨️ Imprimir QR
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-amber-500 hover:bg-amber-600"
                              onClick={() => openEditModal(session)}
                              data-testid={`edit-${session.code}`}
                            >
                              ✏️ Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={async () => { 
                                await axios.put(`${API}/live/sessions/${session.id}/toggle`); 
                                fetchData(); 
                              }}
                            >
                              {session.is_active ? "⏸️ Pausar" : "▶️ Activar"}
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
                              🗑️ Eliminar
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
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <Card className="bg-slate-800 border-cyan-500/50 w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      ✏️ Editar Evento: {editingSession.code}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Modifica los datos del evento y guarda los cambios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Código */}
                    <div>
                      <Label className="text-white text-sm">Código del Evento</Label>
                      <Input 
                        value={editForm.code}
                        onChange={(e) => setEditForm({...editForm, code: e.target.value.toUpperCase()})}
                        className="bg-slate-700 border-white/10 text-white mt-1"
                        placeholder="Código único"
                      />
                    </div>
                    
                    {/* Nombre */}
                    <div>
                      <Label className="text-white text-sm">Nombre del Evento *</Label>
                      <Input 
                        value={editForm.event_name}
                        onChange={(e) => setEditForm({...editForm, event_name: e.target.value})}
                        className="bg-slate-700 border-white/10 text-white mt-1"
                        placeholder="Nombre del evento"
                      />
                    </div>
                    
                    {/* Tipo de Evento */}
                    <div>
                      <Label className="text-white text-sm">Tipo de Evento</Label>
                      <Select 
                        value={editForm.event_type} 
                        onValueChange={(v) => setEditForm({...editForm, event_type: v})}
                      >
                        <SelectTrigger className="bg-slate-700 border-white/10 text-white mt-1">
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
                        <Label className="text-white text-sm">Especifica el tipo</Label>
                        <Input 
                          value={editForm.event_type_custom}
                          onChange={(e) => setEditForm({...editForm, event_type_custom: e.target.value})}
                          className="bg-slate-700 border-white/10 text-white mt-1"
                          placeholder="ej: Graduación, Bautizo"
                        />
                      </div>
                    )}
                    
                    {/* Fecha */}
                    <div>
                      <Label className="text-white text-sm">Fecha del Evento *</Label>
                      <Input 
                        type="date"
                        value={editForm.event_date}
                        onChange={(e) => setEditForm({...editForm, event_date: e.target.value})}
                        className="bg-slate-700 border-white/10 text-white mt-1"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        💡 Cambia a fecha de hoy para activar acceso inmediato
                      </p>
                    </div>
                    
                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-white/20 text-white"
                        onClick={closeEditModal}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                        onClick={saveSessionEdit}
                      >
                        💾 Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cloudinary" className="mt-4">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">☁️ Configuración Cloudinary</CardTitle>
                <CardDescription className="text-gray-400">Almacenamiento ILIMITADO de fotos para PICPARTYLIVE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-yellow-400 font-semibold">⚠️ Pendiente de Configurar</p>
                  <p className="text-gray-400 text-sm mt-1">Proporciona tus credenciales de Cloudinary para activar:</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Cloud Name</Label>
                    <Input placeholder="tu-cloud-name" className="bg-slate-700 border-white/10 text-white" disabled />
                  </div>
                  <div>
                    <Label className="text-white">API Key</Label>
                    <Input placeholder="••••••••••" className="bg-slate-700 border-white/10 text-white" disabled />
                  </div>
                  <div>
                    <Label className="text-white">API Secret</Label>
                    <Input type="password" placeholder="••••••••••" className="bg-slate-700 border-white/10 text-white" disabled />
                  </div>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded">
                  <p className="text-purple-300 font-semibold">📁 Estructura de Carpetas</p>
                  <p className="text-gray-400 font-mono text-sm mt-1">[Nombre_Evento]_[YYYY-MM-DD]/</p>
                  <p className="text-gray-500 text-xs mt-1">Ejemplo: BODA_PEDRO_2025-01-26/</p>
                </div>
                <Button className="w-full bg-gray-600" disabled>Guardar Configuración (Próximamente)</Button>
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
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EventGallery />} />
          <Route path="/cotizador" element={<Cotizador />} />
          <Route path="/picpartylive" element={<PicPartyLive />} />
          <Route path="/live" element={<PicPartyLive />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
