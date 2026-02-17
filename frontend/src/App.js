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

// ============ COTIZADOR CON PDF ============
const Cotizador = () => {
  const [clientData, setClientData] = useState({ nombre: "", telefono: "", salon: "", horario: "", descuento: 0 });
  const [quote, setQuote] = useState(null);
  const [basePrice, setBasePrice] = useState(5000);
  const [hours, setHours] = useState(4);
  const [extras, setExtras] = useState([]);
  const [includeVideo360, setIncludeVideo360] = useState(false);
  const [includeLive, setIncludeLive] = useState(false);
  const [livePackage, setLivePackage] = useState(0); // $700, $1000, $1500 NETO
  
  const extraOptions = [
    { id: "photobooth", label: "Photobooth", price: 500 },
    { id: "props", label: "Props Premium", price: 500 },
    { id: "album", label: "Álbum Impreso", price: 500 },
    { id: "prints", label: "Impresiones Ilimitadas", price: 500 },
  ];

  const calculateQuote = () => {
    let subtotal = basePrice * hours;
    subtotal += extras.length * 500;
    if (includeVideo360) subtotal += 3000;
    if (includeLive && livePackage > 0) subtotal += livePackage; // Usar el paquete seleccionado
    
    const descuentoAmount = subtotal * (clientData.descuento / 100);
    const netPrice = subtotal - descuentoAmount;
    
    setQuote({ subtotal, descuento: descuentoAmount, netPrice, descuentoPct: clientData.descuento, livePackage });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  const downloadPDF = async () => {
    if (!clientData.nombre || !clientData.telefono) {
      toast.error("Por favor ingresa nombre y teléfono");
      return;
    }
    if (!quote) {
      toast.error("Primero calcula la cotización");
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
    pdf.text("COTIZACIÓN", pageWidth - 20, 30, { align: 'right' });
    
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
    if (clientData.horario) { pdf.text(`Horario: ${clientData.horario}`, 20, y); y += 6; }
    
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
    pdf.text("Precio", pageWidth - 45, y, { align: 'right' });
    y += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.text(`Servicio Fotográfico (${hours} horas)`, 25, y);
    pdf.text(formatCurrency(basePrice * hours), pageWidth - 45, y, { align: 'right' });
    y += 7;
    
    if (includeVideo360) {
      pdf.text("Video 360°", 25, y);
      pdf.text(formatCurrency(3000) + " (NETO)", pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    if (includeLive && livePackage > 0) {
      const pkgLabel = livePackage === 700 ? "Básico" : livePackage === 1000 ? "Estándar" : "Premium";
      pdf.text(`PicParty Live - ${pkgLabel}`, 25, y);
      pdf.text(formatCurrency(livePackage) + " (NETO)", pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    extras.forEach(extra => {
      const opt = extraOptions.find(e => e.id === extra);
      if (opt) {
        pdf.text(opt.label, 25, y);
        pdf.text(formatCurrency(500), pageWidth - 45, y, { align: 'right' });
        y += 7;
      }
    });
    
    y += 5;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, y, pageWidth - 20, y);
    y += 8;
    
    pdf.text("Subtotal:", 25, y);
    pdf.text(formatCurrency(quote.subtotal), pageWidth - 45, y, { align: 'right' });
    y += 7;
    
    // Descuento en naranja
    if (quote.descuentoPct > 0) {
      pdf.setTextColor(234, 88, 12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Descuento (${quote.descuentoPct}%):`, 25, y);
      pdf.text(`-${formatCurrency(quote.descuento)}`, pageWidth - 45, y, { align: 'right' });
      y += 7;
      pdf.setTextColor(50, 50, 50);
    }
    
    // Total Neto
    y += 3;
    pdf.setFillColor(88, 28, 135);
    pdf.rect(20, y - 5, pageWidth - 40, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("PRECIO NETO:", 25, y + 3);
    pdf.text(formatCurrency(quote.netPrice), pageWidth - 45, y + 3, { align: 'right' });
    
    // Footer
    y = 250;
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont(undefined, 'normal');
    pdf.text("* Precios netos. Cotización válida por 15 días.", pageWidth / 2, y, { align: 'center' });
    pdf.text("PicParty - Cabina Fotográfica | adoca.net", pageWidth / 2, y + 5, { align: 'center' });
    
    pdf.save(`Cotizacion_PicParty_${clientData.nombre.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF descargado correctamente");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-white">Cotizador</span>
          </Link>
          <Link to="/"><Button variant="outline" className="border-white/20 text-white">← Inicio</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cotiza tu Evento</h1>
          <Badge className="bg-green-500/20 text-green-400">✓ Precios Netos</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Datos del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nombre *</Label>
                  <Input 
                    placeholder="Tu nombre" 
                    value={clientData.nombre}
                    onChange={(e) => setClientData({...clientData, nombre: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Teléfono *</Label>
                  <Input 
                    placeholder="10 dígitos" 
                    value={clientData.telefono}
                    onChange={(e) => setClientData({...clientData, telefono: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Salón (opcional)</Label>
                  <Input 
                    placeholder="Nombre del salón" 
                    value={clientData.salon}
                    onChange={(e) => setClientData({...clientData, salon: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Horario (opcional)</Label>
                  <Input 
                    placeholder="ej: 6pm - 10pm" 
                    value={clientData.horario}
                    onChange={(e) => setClientData({...clientData, horario: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Label className="text-white">Paquete Base</Label>
                <Select value={basePrice.toString()} onValueChange={(v) => setBasePrice(parseInt(v))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3000">$3,000 - Básico</SelectItem>
                    <SelectItem value="5000">$5,000 - Estándar</SelectItem>
                    <SelectItem value="8000">$8,000 - Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Horas</Label>
                <Select value={hours.toString()} onValueChange={(v) => setHours(parseInt(v))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2,3,4,5,6,8].map(h => <SelectItem key={h} value={h.toString()}>{h} horas</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
                  <div>
                    <span className="text-cyan-300 font-semibold">🎥 Video 360°</span>
                    <p className="text-gray-400 text-sm">+$3,000 (NETO)</p>
                  </div>
                  <Switch checked={includeVideo360} onCheckedChange={setIncludeVideo360} />
                </div>
                
                {/* Paquetes PicPartyLive con precios NETO */}
                <div className="space-y-2">
                  <p className="text-pink-300 font-semibold">🔴 PicParty Live</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={includeLive && livePackage === 700 ? "default" : "outline"}
                      className={includeLive && livePackage === 700 ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-300"}
                      onClick={() => { setIncludeLive(true); setLivePackage(700); }}
                    >
                      $700 MXN<br/><span className="text-xs">(NETO)</span>
                    </Button>
                    <Button 
                      variant={includeLive && livePackage === 1000 ? "default" : "outline"}
                      className={includeLive && livePackage === 1000 ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-300"}
                      onClick={() => { setIncludeLive(true); setLivePackage(1000); }}
                    >
                      $1,000 MXN<br/><span className="text-xs">(NETO)</span>
                    </Button>
                    <Button 
                      variant={includeLive && livePackage === 1500 ? "default" : "outline"}
                      className={includeLive && livePackage === 1500 ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-300"}
                      onClick={() => { setIncludeLive(true); setLivePackage(1500); }}
                    >
                      $1,500 MXN<br/><span className="text-xs">(NETO)</span>
                    </Button>
                  </div>
                  {includeLive && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-400 text-xs"
                      onClick={() => { setIncludeLive(false); setLivePackage(0); }}
                    >
                      ✕ Quitar PicParty Live
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-white">Extras (+$500 c/u)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {extraOptions.map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={extras.includes(opt.id)}
                        onCheckedChange={(checked) => {
                          setExtras(prev => checked ? [...prev, opt.id] : prev.filter(e => e !== opt.id));
                        }}
                        className="border-white/30"
                      />
                      <Label className="text-gray-300 text-sm">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                <Label className="text-orange-300">🏷️ Descuento (%)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="50"
                  value={clientData.descuento}
                  onChange={(e) => setClientData({...clientData, descuento: parseInt(e.target.value) || 0})}
                  className="bg-white/10 border-orange-500/30 text-orange-300 mt-1"
                />
              </div>

              <Button onClick={calculateQuote} className="w-full bg-purple-500 hover:bg-purple-600">
                Calcular Cotización
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Tu Cotización</CardTitle>
            </CardHeader>
            <CardContent>
              {quote ? (
                <div className="space-y-4">
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>Fotografía ({hours}hrs)</span>
                      <span>{formatCurrency(basePrice * hours)}</span>
                    </div>
                    {includeVideo360 && (
                      <div className="flex justify-between text-cyan-400">
                        <span>Video 360°</span>
                        <span>{formatCurrency(3000)}</span>
                      </div>
                    )}
                    {includeLive && (
                      <div className="flex justify-between text-pink-400">
                        <span>PicParty Live</span>
                        <span>{formatCurrency(2000)}</span>
                      </div>
                    )}
                    {extras.map(extra => {
                      const opt = extraOptions.find(e => e.id === extra);
                      return opt && (
                        <div key={extra} className="flex justify-between">
                          <span>{opt.label}</span>
                          <span>{formatCurrency(500)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-white">
                      <span>Subtotal</span>
                      <span>{formatCurrency(quote.subtotal)}</span>
                    </div>
                    {quote.descuentoPct > 0 && (
                      <div className="flex justify-between text-orange-400 font-semibold">
                        <span>Descuento ({quote.descuentoPct}%)</span>
                        <span>-{formatCurrency(quote.descuento)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-purple-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 font-bold text-lg">PRECIO NETO</span>
                      <span className="text-white text-3xl font-black">{formatCurrency(quote.netPrice)}</span>
                    </div>
                  </div>

                  <Button onClick={downloadPDF} className="w-full bg-green-500 hover:bg-green-600 text-lg h-12">
                    📄 Descargar Cotización PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">🧮</span>
                  <p className="text-gray-400">Configura tu evento para ver la cotización</p>
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

const PicPartyLive = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventCode = searchParams.get('event');
  const [session, setSession] = useState(null);
  const [code, setCode] = useState(eventCode || "");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]); // Muro colaborativo
  const [error, setError] = useState("");
  const [showPWABanner, setShowPWABanner] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" o "gallery"
  const fileInputRef = useRef(null);
  
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
          }
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
        toast.error(`Error subiendo ${file.name}`);
      }
    }
    
    if (uploaded.length > 0) {
      setUploadedPhotos(prev => [...uploaded, ...prev]);
      // Actualizar galería colaborativa
      if (session) fetchGalleryPhotos(session.code);
      toast.success(`¡${uploaded.length} foto(s) subida(s)! ${PICPARTY_EMOJIS[Math.floor(Math.random() * PICPARTY_EMOJIS.length)]}`);
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
          /* ============ INTERFAZ DE INVITADOS ============ */
          <div className="max-w-lg mx-auto">
            {/* Barra de emojis decorativos */}
            <div className="flex justify-center gap-3 mb-3 text-xl">
              {PICPARTY_EMOJIS.map((emoji, i) => (
                <span key={i} className="opacity-70">{emoji}</span>
              ))}
            </div>
            
            {/* Bienvenida */}
            <div className="text-center mb-5">
              <h1 className="text-2xl font-black text-white mb-1">
                ¡Bienvenido a la fiesta! 👸
              </h1>
              <p className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                {session.event_name}
              </p>
              {session.event_type && (
                <Badge className="mt-2 bg-purple-500/30 text-purple-200">
                  {session.event_type === 'boda' && '💍 Boda'}
                  {session.event_type === 'quinceanios' && '👑 Quinceaños'}
                  {session.event_type === 'cumpleanos' && '🎂 Cumpleaños'}
                  {session.event_type === 'empresarial' && '🏢 Empresarial'}
                  {session.event_type === 'fiesta' && '💃 Fiesta'}
                  {session.event_type === 'publico' && '✨ Evento Público'}
                  {session.event_type === 'otro' && `✨ ${session.event_type_custom || 'Evento'}`}
                </Badge>
              )}
            </div>

            {/* TABS: Subir / Galería */}
            <div className="flex gap-2 mb-4">
              <Button 
                variant={activeTab === "upload" ? "default" : "outline"}
                className={activeTab === "upload" ? "flex-1 bg-pink-500" : "flex-1 border-white/20 text-white"}
                onClick={() => setActiveTab("upload")}
              >
                📸 Subir
              </Button>
              <Button 
                variant={activeTab === "gallery" ? "default" : "outline"}
                className={activeTab === "gallery" ? "flex-1 bg-purple-500" : "flex-1 border-white/20 text-white"}
                onClick={() => { setActiveTab("gallery"); fetchGalleryPhotos(session.code); }}
              >
                👑 Galería ({galleryPhotos.length})
              </Button>
            </div>

            {activeTab === "upload" ? (
              <>
                {/* BOTÓN PRINCIPAL DE SUBIDA */}
                <Card className="bg-white/5 border-white/10 backdrop-blur mb-4">
                  <CardContent className="p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="photo-input"
                    />
                    
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-20 text-xl font-black bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 rounded-xl shadow-2xl shadow-pink-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      data-testid="upload-photo-btn"
                    >
                      {uploading ? (
                        <span className="flex flex-col items-center gap-1">
                          <span>✨ Subiendo {currentFileIndex}/{totalFiles}... {uploadProgress}%</span>
                          <div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          📸 SUBIR MI FOTO
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-center text-gray-400 text-xs mt-3">
                      Toca para tomar o seleccionar hasta 10 fotos
                    </p>
                    
                    {/* Aviso de calidad */}
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300/80 text-xs text-center">
                        ⚠️ La calidad de las fotos varía según la resolución y el equipo móvil utilizado.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mis fotos subidas */}
                {uploadedPhotos.length > 0 && (
                  <Card className="bg-white/5 border-white/10 backdrop-blur mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        📷 Mis Fotos ({uploadedPhotos.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedPhotos.slice(0, 9).map(photo => (
                          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                            <img 
                              src={photo.thumbnail || photo.url} 
                              alt={photo.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                      {uploadedPhotos.length > 9 && (
                        <p className="text-center text-gray-400 text-xs mt-2">
                          +{uploadedPhotos.length - 9} fotos más ✨
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              /* ============ MURO COLABORATIVO ============ */
              <Card className="bg-white/5 border-white/10 backdrop-blur mb-4">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span>👑 Muro Colaborativo</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-purple-300 text-xs"
                      onClick={() => fetchGalleryPhotos(session.code)}
                    >
                      🔄 Actualizar
                    </Button>
                  </CardTitle>
                  <p className="text-gray-400 text-xs">Fotos de todos los invitados</p>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {galleryPhotos.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl block mb-2">📸</span>
                      <p className="text-gray-400">Aún no hay fotos</p>
                      <p className="text-gray-500 text-sm">¡Sé el primero en subir!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {galleryPhotos.map(photo => (
                        <div key={photo.id} className="bg-white/5 rounded-xl overflow-hidden">
                          {/* Imagen */}
                          <div className="aspect-square relative">
                            <img 
                              src={photo.cloudinary_url} 
                              alt="Foto del evento"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          
                          {/* Barra de reacciones */}
                          <div className="p-3 flex justify-around items-center bg-black/30">
                            {PICPARTY_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(photo.id, emoji)}
                                className="flex flex-col items-center gap-1 hover:scale-110 transition-transform active:scale-95"
                              >
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-xs text-gray-300">
                                  {photo.reactions?.[emoji] || 0}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Info de carpeta */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
              <p className="text-gray-400 text-xs">
                📁 <span className="text-purple-400 font-mono">
                  {session.cloudinary_folder || `${session.event_name.replace(/\s+/g, '_')}_${session.event_date || 'evento'}`}
                </span>
              </p>
            </div>

            {/* Cerrar sesión - redirige a landing */}
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-gray-400 hover:text-white text-sm"
              onClick={handleLogout}
            >
              ← Salir del evento
            </Button>
          </div>
        )}
      </main>

      {/* Footer con emojis temáticos */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-t border-white/10 py-2">
        <div className="flex justify-center items-center gap-2">
          <span className="text-sm">👸</span>
          <p className="text-gray-500 text-xs">PicParty Live • adoca.net</p>
          <span className="text-sm">✨</span>
        </div>
      </footer>
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
  const [newEvent, setNewEvent] = useState({ name: "", date: "", time: "", description: "", fotoshare_url: "", video360_url: "", location: "", has_photos: true, has_video360: false, color: "" });
  const [newSession, setNewSession] = useState({ 
    code: "", 
    event_name: "", 
    event_type: "boda",
    event_type_custom: "",
    event_date: "",
    is_vip: false, 
    vip_pass: "" 
  });
  
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

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      toast.success("¡Bienvenido, Octavio!");
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

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
    if (!newSession.code || !newSession.event_name || !newSession.event_date) { 
      toast.error("Código, nombre y fecha son requeridos"); 
      return; 
    }
    try {
      const params = new URLSearchParams({
        code: newSession.code,
        event_name: newSession.event_name,
        event_type: newSession.event_type,
        event_date: newSession.event_date,
        is_vip: newSession.is_vip
      });
      if (newSession.event_type === "otro" && newSession.event_type_custom) {
        params.append("event_type_custom", newSession.event_type_custom);
      }
      
      await axios.post(`${API}/live/sessions/create?${params.toString()}`);
      toast.success("Sesión creada con éxito");
      setNewSession({ 
        code: "", event_name: "", event_type: "boda", 
        event_type_custom: "", event_date: "", is_vip: false, vip_pass: "" 
      });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
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
      const qrUrl = `https://${SITE_DOMAIN}/picpartylive?event=${session.code}`;
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
        // Si falla el logo, mostrar texto
        pdf.setFontSize(32);
        pdf.setTextColor(255, 255, 255);
        pdf.text("PICPARTY", pageWidth / 2, 45, { align: 'center' });
      }
      
      // Tipo de evento con emoji
      const typeInfo = getEventTypeInfo(session.event_type, session.event_type_custom);
      pdf.setFontSize(18);
      pdf.setTextColor(236, 72, 153);
      pdf.text(`${typeInfo.label.toUpperCase()}`, pageWidth / 2, 90, { align: 'center' });
      
      // === QR EN ALTA RESOLUCIÓN - Método más robusto ===
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
      
      // QR grande y centrado (120mm)
      const qrSize = 120;
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      pdf.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 100, qrSize, qrSize);
      
      // === NOMBRE DEL EVENTO DEBAJO ===
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
      
      // === DESCARGA DIRECTA ===
      const fileName = `QR_PicParty_${session.event_name.replace(/\s+/g, '_')}_${session.event_date || 'evento'}.pdf`;
      pdf.save(fileName);
      toast.success("¡PDF descargado exitosamente!");
      
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar PDF. Intenta de nuevo.");
    }
  };

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
      pdf.text("PicParty Live", 25, y);
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
              <Input placeholder="Usuario" value={loginUser} onChange={(e) => setLoginUser(e.target.value.toUpperCase())} className="bg-white/10 border-white/20 text-white" />
              <Input type="password" placeholder="Contraseña" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="bg-white/10 border-white/20 text-white" />
              <Button type="submit" className="w-full bg-purple-500">🔐 Ingresar</Button>
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
            <TabsTrigger value="live" className="data-[state=active]:bg-cyan-500">🔴 PicPartyLive ({liveSessions.length})</TabsTrigger>
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

          {/* ============ PESTAÑA PICPARTY LIVE ============ */}
          <TabsContent value="live" className="space-y-4 mt-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <p className="text-cyan-300 font-semibold">🔴 PicParty Live - Social</p>
                <p className="text-gray-400 text-sm">Estos eventos generan carpeta automática en Cloudinary y código QR para invitados.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Crear Sesión Live</CardTitle>
                <CardDescription className="text-gray-400">Genera: QR + Carpeta Cloudinary [Nombre]_[Fecha]</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fila 1: Código y Nombre */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white text-sm">Código del Evento *</Label>
                    <Input 
                      placeholder="ej: BODA-PEDRO" 
                      value={newSession.code} 
                      onChange={(e) => setNewSession({...newSession, code: e.target.value.toUpperCase().replace(/\s+/g, '-')})} 
                      className="bg-slate-700 border-white/10 text-white mt-1" 
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Nombre del Evento *</Label>
                    <Input 
                      placeholder="Boda de Pedro y María" 
                      value={newSession.event_name} 
                      onChange={(e) => setNewSession({...newSession, event_name: e.target.value})} 
                      className="bg-slate-700 border-white/10 text-white mt-1" 
                    />
                  </div>
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
                              <QRCodeSVG value={`https://${SITE_DOMAIN}/picpartylive?event=${session.code}`} size={70} />
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
                              </div>
                              <p className="text-cyan-400 text-xs mt-2 font-mono">
                                https://{SITE_DOMAIN}/picpartylive?event={session.code}
                              </p>
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
          </TabsContent>

          <TabsContent value="cloudinary" className="mt-4">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">☁️ Configuración Cloudinary</CardTitle>
                <CardDescription className="text-gray-400">Almacenamiento de fotos para PicParty Live</CardDescription>
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
