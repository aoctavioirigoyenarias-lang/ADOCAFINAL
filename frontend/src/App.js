import { useState, useEffect, useCallback, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useSearchParams } from "react-router-dom";
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
    if (includeLive) subtotal += 2000;
    
    const descuentoAmount = subtotal * (clientData.descuento / 100);
    const netPrice = subtotal - descuentoAmount;
    
    setQuote({ subtotal, descuento: descuentoAmount, netPrice, descuentoPct: clientData.descuento });
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
      pdf.text(formatCurrency(3000), pageWidth - 45, y, { align: 'right' });
      y += 7;
    }
    if (includeLive) {
      pdf.text("PicParty Live", 25, y);
      pdf.text(formatCurrency(2000), pageWidth - 45, y, { align: 'right' });
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
                    <p className="text-gray-400 text-sm">+$3,000</p>
                  </div>
                  <Switch checked={includeVideo360} onCheckedChange={setIncludeVideo360} />
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-500/10 border border-pink-500/30 rounded">
                  <div>
                    <span className="text-pink-300 font-semibold">🔴 PicParty Live</span>
                    <p className="text-gray-400 text-sm">+$2,000</p>
                  </div>
                  <Switch checked={includeLive} onCheckedChange={setIncludeLive} />
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
const PicPartyLive = () => {
  const [searchParams] = useSearchParams();
  const eventCode = searchParams.get('event');
  const [session, setSession] = useState(null);
  const [code, setCode] = useState(eventCode || "");

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error("Ingresa un código");
      return;
    }
    try {
      const response = await axios.get(`${API}/live/scan/${code}`);
      setSession(response.data);
      toast.success(`¡Bienvenido a ${response.data.event_name}!`);
    } catch (e) {
      toast.error("Código inválido o evento no activo");
    }
  };

  useEffect(() => {
    if (eventCode) handleJoin();
  }, [eventCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={PICPARTY_LOGO} alt="PicParty" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-white">PicParty Live</span>
            <Badge className="bg-red-500 animate-pulse">🔴 EN VIVO</Badge>
          </div>
          <Link to="/"><Button variant="outline" className="border-white/20 text-white">← Inicio</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {!session ? (
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <span className="text-6xl">📱</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Únete al Evento</h1>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6 space-y-4">
                <Input 
                  placeholder="Código del evento"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="bg-white/10 border-white/20 text-white text-center text-2xl h-14 tracking-widest"
                />
                <Button onClick={handleJoin} className="w-full h-12 bg-gradient-to-r from-pink-500 to-violet-500">
                  🎉 Entrar al Evento
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <CardTitle className="text-white text-2xl">{session.event_name}</CardTitle>
                <CardDescription className="text-gray-400">¡Estás conectado al evento!</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-300">📸 Sube tus fotos y compártelas con todos</p>
                <div className="p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
                  <p className="text-gray-400 text-sm mb-2">Almacenamiento Cloudinary</p>
                  <p className="text-purple-400 font-mono text-sm">{session.event_name.replace(/\s+/g, '_')}_{new Date().toISOString().split('T')[0]}/</p>
                  <p className="text-gray-500 text-xs mt-2">⚠️ Configurar credenciales en Admin</p>
                </div>
                <Button variant="outline" className="border-white/20 text-white" onClick={() => setSession(null)}>
                  Salir del Evento
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
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
  const [newSession, setNewSession] = useState({ code: "", event_name: "", is_vip: false, vip_pass: "" });
  
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
    if (!newSession.code || !newSession.event_name) { toast.error("Código y nombre requeridos"); return; }
    try {
      await axios.post(`${API}/live/sessions/create?code=${newSession.code}&event_name=${encodeURIComponent(newSession.event_name)}`);
      toast.success("Sesión creada");
      setNewSession({ code: "", event_name: "", is_vip: false, vip_pass: "" });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const printQRPDF = async (session) => {
    const qrUrl = `https://${SITE_DOMAIN}/live?event=${session.code}`;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFillColor(88, 28, 135);
    pdf.rect(0, 0, pageWidth, 280, 'F');
    
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = PICPARTY_LOGO;
      await new Promise(r => { logoImg.onload = r; setTimeout(r, 2000); });
      pdf.addImage(logoImg, 'PNG', (pageWidth - 50) / 2, 15, 50, 50);
    } catch(e) {}
    
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255);
    pdf.text(session.event_name.toUpperCase(), pageWidth / 2, 85, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(200, 200, 200);
    pdf.text("Escanea el QR para ver las fotos", pageWidth / 2, 95, { align: 'center' });
    
    const QRCodeLib = await import('qrcode');
    const qrCanvas = document.createElement('canvas');
    await QRCodeLib.toCanvas(qrCanvas, qrUrl, { width: 1000, margin: 2 });
    pdf.addImage(qrCanvas.toDataURL('image/png'), 'PNG', (pageWidth - 120) / 2, 105, 120, 120);
    
    pdf.setFontSize(12);
    pdf.setTextColor(236, 72, 153);
    pdf.text(qrUrl, pageWidth / 2, 235, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Código: ${session.code}`, pageWidth / 2, 250, { align: 'center' });
    
    pdf.output('dataurlnewwindow');
    toast.success("PDF generado");
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
        <Tabs defaultValue="events">
          <TabsList className="bg-slate-800 border border-white/10">
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-500">📸 Eventos ({events.length})</TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-purple-500">🔴 Live ({liveSessions.length})</TabsTrigger>
            <TabsTrigger value="cloudinary" className="data-[state=active]:bg-purple-500">☁️ Cloudinary</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4 mt-4">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader><CardTitle className="text-white">Crear Evento</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="NOMBRE" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value.toUpperCase()})} className="bg-slate-700 border-white/10 text-white" />
                  <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <Input placeholder="Ubicación" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <Input placeholder="URL Fotoshare" value={newEvent.fotoshare_url} onChange={(e) => setNewEvent({...newEvent, fotoshare_url: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
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
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteEvent(event.id)}>Eliminar</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="live" className="space-y-4 mt-4">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Crear Sesión Live</CardTitle>
                <CardDescription className="text-gray-400">Genera QR automático para cada evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input placeholder="CÓDIGO (ej: BODA-PEDRO)" value={newSession.code} onChange={(e) => setNewSession({...newSession, code: e.target.value.toUpperCase().replace(/\s+/g, '-')})} className="bg-slate-700 border-white/10 text-white" />
                  <Input placeholder="Nombre del evento" value={newSession.event_name} onChange={(e) => setNewSession({...newSession, event_name: e.target.value})} className="bg-slate-700 border-white/10 text-white" />
                  <div className="flex items-center gap-2">
                    <Checkbox checked={newSession.is_vip} onCheckedChange={(c) => setNewSession({...newSession, is_vip: c})} />
                    <Label className="text-white">VIP</Label>
                  </div>
                  <Button onClick={createLiveSession} className="bg-cyan-500">Crear</Button>
                </div>
              </CardContent>
            </Card>
            {liveSessions.map(session => (
              <Card key={session.id} className="bg-slate-800 border-white/10">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded">
                      <QRCodeSVG value={`https://${SITE_DOMAIN}/live?event=${session.code}`} size={60} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{session.code}</span>
                        <Badge className={session.is_active ? "bg-green-500" : "bg-gray-500"}>{session.is_active ? "Activo" : "Inactivo"}</Badge>
                      </div>
                      <p className="text-gray-300">{session.event_name}</p>
                      <p className="text-cyan-400 text-sm">https://{SITE_DOMAIN}/live?event={session.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-500" onClick={() => printQRPDF(session)}>🖨️ Imprimir QR</Button>
                    <Button size="sm" variant="destructive" onClick={async () => { await axios.delete(`${API}/live/sessions/${session.id}`); fetchData(); }}>Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
