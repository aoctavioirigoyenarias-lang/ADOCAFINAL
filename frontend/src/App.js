import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ============ COMPONENTE DE TARJETA DE EVENTO CON PORTADA AUTOMÁTICA ============
const EventCard = ({ event }) => {
  const hasPhoto = event.thumbnail && event.thumbnail.trim() !== "";
  
  // Determinar emoji según servicios
  const getServiceEmoji = () => {
    if (event.has_photos && event.has_video360) return "📸🎥";
    if (event.has_video360) return "🎥";
    return "📸";
  };

  // Portada automática con color + emoji
  const AutoCover = () => (
    <div 
      className="w-full h-48 flex flex-col items-center justify-center relative"
      style={{ backgroundColor: event.color || "#EC4899" }}
    >
      <span className="text-6xl mb-2">{getServiceEmoji()}</span>
      <span className="text-white text-2xl font-black tracking-wider drop-shadow-lg">
        {event.name}
      </span>
    </div>
  );

  return (
    <Card 
      className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group overflow-hidden"
      data-testid={`event-card-${event.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="relative overflow-hidden">
        {hasPhoto ? (
          <img 
            src={event.thumbnail} 
            alt={event.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <AutoCover />
        )}
        
        {/* Etiquetas de servicios */}
        <div className="absolute top-3 left-3 flex gap-1">
          {event.has_photos && (
            <Badge className="bg-pink-500/90 hover:bg-pink-500 text-xs">
              📸 Fotos
            </Badge>
          )}
          {event.has_video360 && (
            <Badge className="bg-cyan-500/90 hover:bg-cyan-500 text-xs">
              🎥 360°
            </Badge>
          )}
        </div>
        
        <Badge className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-xs">
          {event.date}
        </Badge>
      </div>
      
      <CardContent className="pt-4">
        <h4 className="text-xl font-black text-white mb-1 tracking-wide">{event.name}</h4>
        <p className="text-gray-400 text-sm mb-3">{event.description}</p>
        
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
          {event.time && <span className="ml-2">• {event.time}</span>}
        </div>
        
        <div className="flex gap-2">
          {event.fotoshare_url && (
            <a 
              href={event.fotoshare_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
              data-testid={`view-photos-${event.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-sm">
                📸 Ver Fotos
              </Button>
            </a>
          )}
          {event.video360_url && (
            <a 
              href={event.video360_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-sm">
                🎥 Ver 360°
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============ GALERÍA DE EVENTOS (RUTA PRINCIPAL /) ============
const EventGallery = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      if (response.data.length === 0) {
        await axios.post(`${API}/seed-events`);
        const newResponse = await axios.get(`${API}/events`);
        setAllEvents(newResponse.data);
        setFilteredEvents(newResponse.data);
        setEventDates(newResponse.data.map(e => new Date(e.date + 'T12:00:00')));
      } else {
        setAllEvents(response.data);
        setFilteredEvents(response.data);
        setEventDates(response.data.map(e => new Date(e.date + 'T12:00:00')));
      }
    } catch (e) {
      console.error("Error fetching events:", e);
      try {
        await axios.post(`${API}/seed-events`);
        const response = await axios.get(`${API}/events`);
        setAllEvents(response.data);
        setFilteredEvents(response.data);
      } catch (seedError) {
        console.error("Error seeding events:", seedError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtro por fecha del calendario
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      const filtered = allEvents.filter(event => event.date === dateStr);
      setFilteredEvents(filtered);
      if (filtered.length === 0) {
        toast.info(`No hay eventos para ${dateStr}`);
      } else {
        toast.success(`${filtered.length} evento(s) encontrado(s)`);
      }
    } else {
      setFilteredEvents(allEvents);
    }
  }, [allEvents]);

  const clearFilter = () => {
    setSelectedDate(null);
    setFilteredEvents(allEvents);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" data-testid="event-gallery">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">📸</span>
            </div>
            <h1 className="text-2xl font-bold text-white">adoca.net</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/cotizador">
              <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20" data-testid="cotizador-btn">
                💰 Cotizador
              </Button>
            </Link>
            <Link to="/live">
              <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/20" data-testid="go-live-btn">
                🔴 Live
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" data-testid="admin-btn">
                ⚙️ Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Galería de Eventos</h2>
          <p className="text-gray-400">Explora nuestros eventos y accede a las fotos</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar Section - Filtro Histórico */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                📅 Calendario Buscador
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Selecciona una fecha para filtrar eventos históricos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border border-white/10 bg-white/5 text-white"
                modifiers={{ hasEvent: eventDates }}
                modifiersStyles={{
                  hasEvent: { 
                    backgroundColor: 'rgb(236 72 153 / 0.4)',
                    borderRadius: '50%',
                    fontWeight: 'bold'
                  }
                }}
              />
              {selectedDate && (
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                  onClick={clearFilter}
                >
                  ✕ Limpiar filtro
                </Button>
              )}
              <div className="mt-3 p-2 bg-white/5 rounded text-xs text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full bg-pink-500/40 mr-2"></span>
                Fechas con eventos
              </div>
            </CardContent>
          </Card>

          {/* Events Grid - ESCALABLE hasta 5+ eventos */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedDate 
                  ? `Eventos del ${selectedDate.toLocaleDateString('es-MX')}` 
                  : "Todos los Eventos"
                } ({filteredEvents.length})
              </h3>
            </div>
            
            {filteredEvents.length === 0 ? (
              <Card className="bg-white/5 border-white/10 p-12 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-400 text-lg">No hay eventos para esta fecha</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-pink-500/50 text-pink-400"
                  onClick={clearFilter}
                >
                  Ver todos los eventos
                </Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 adoca.net - PicParty Events</p>
        </div>
      </footer>
    </div>
  );
};

// ============ COTIZADOR (RUTA /cotizador) ============
const Cotizador = () => {
  const [preferences, setPreferences] = useState({ show_net_price: true, tax_rate: 0.16 });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [basePrice, setBasePrice] = useState(5000);
  const [hours, setHours] = useState(4);
  const [extras, setExtras] = useState([]);
  const [includeVideo360, setIncludeVideo360] = useState(false);
  
  const extraOptions = [
    { id: "photobooth", label: "Photobooth", price: 500 },
    { id: "drone", label: "Tomas con Drone", price: 500 },
    { id: "album", label: "Álbum Impreso", price: 500 },
    { id: "video", label: "Video Highlight", price: 500 },
    { id: "prints", label: "Impresiones Extra", price: 500 },
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API}/preferences`);
      setPreferences(response.data);
    } catch (e) {
      console.error("Error fetching preferences:", e);
    }
  };

  const calculateQuote = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/quote`, {
        base_price: basePrice,
        hours: hours,
        extras: extras,
        include_video360: includeVideo360
      });
      setQuote(response.data);
      toast.success("Cotización calculada");
    } catch (e) {
      toast.error("Error al calcular cotización");
    } finally {
      setLoading(false);
    }
  };

  const toggleExtra = (extraId) => {
    setExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(e => e !== extraId)
        : [...prev, extraId]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900" data-testid="cotizador-page">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Cotizador</h1>
          </Link>
          <Link to="/">
            <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20">
              ← Galería
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Cotizador de Servicios</h2>
            <p className="text-gray-400">Calcula el precio de tu evento fotográfico</p>
            {preferences.show_net_price && (
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                ✓ Mostrando PRECIO NETO
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Configura tu Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Precio Base por Hora</Label>
                  <Select value={basePrice.toString()} onValueChange={(v) => setBasePrice(parseInt(v))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3000">$3,000 MXN - Básico</SelectItem>
                      <SelectItem value="5000">$5,000 MXN - Estándar</SelectItem>
                      <SelectItem value="8000">$8,000 MXN - Premium</SelectItem>
                      <SelectItem value="12000">$12,000 MXN - Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Horas de Cobertura</Label>
                  <Select value={hours.toString()} onValueChange={(v) => setHours(parseInt(v))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="6">6 horas</SelectItem>
                      <SelectItem value="8">8 horas</SelectItem>
                      <SelectItem value="10">10 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Video 360 Option */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-cyan-300 font-semibold">🎥 Video 360°</Label>
                      <p className="text-gray-400 text-sm">+$3,000 MXN</p>
                    </div>
                    <Switch
                      checked={includeVideo360}
                      onCheckedChange={setIncludeVideo360}
                      data-testid="video360-switch"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Extras (+$500 c/u)</Label>
                  <div className="space-y-2">
                    {extraOptions.map((extra) => (
                      <div key={extra.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={extra.id}
                          checked={extras.includes(extra.id)}
                          onCheckedChange={() => toggleExtra(extra.id)}
                          className="border-white/30 data-[state=checked]:bg-emerald-500"
                        />
                        <Label htmlFor={extra.id} className="text-gray-300 cursor-pointer">
                          {extra.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={calculateQuote} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                  data-testid="calculate-quote-btn"
                >
                  {loading ? "Calculando..." : "Calcular Cotización"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Tu Cotización</CardTitle>
              </CardHeader>
              <CardContent>
                {quote ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">📸 Fotografía x {hours}hrs</span>
                      <span className="text-white">{formatCurrency(quote.base_price * hours)}</span>
                    </div>
                    
                    {includeVideo360 && (
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-gray-400">🎥 Video 360°</span>
                        <span className="text-cyan-400">{formatCurrency(3000)}</span>
                      </div>
                    )}
                    
                    {extras.length > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-gray-400">✨ Extras ({extras.length})</span>
                        <span className="text-white">{formatCurrency(extras.length * 500)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatCurrency(quote.subtotal)}</span>
                    </div>

                    {quote.show_net_price ? (
                      <>
                        <div className="flex justify-between items-center py-4 bg-emerald-500/20 rounded-lg px-4" data-testid="net-price-display">
                          <span className="text-emerald-300 font-bold text-lg">💵 PRECIO NETO</span>
                          <span className="text-emerald-400 text-3xl font-black">{formatCurrency(quote.net_price)}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          * Precio neto antes de impuestos según tus preferencias guardadas
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">IVA (16%)</span>
                          <span className="text-white">{formatCurrency(quote.tax)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-white/10 rounded-lg px-4">
                          <span className="text-white font-semibold">TOTAL</span>
                          <span className="text-white text-2xl font-bold">{formatCurrency(quote.total)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🧮</span>
                    <p className="text-gray-500">Configura tu evento y calcula tu cotización</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============ PANEL ADMIN (RUTA /admin) ============
const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [preferences, setPreferences] = useState({ show_net_price: true, tax_rate: 0.16 });
  const [loading, setLoading] = useState(true);
  
  const [newEvent, setNewEvent] = useState({
    name: "", date: "", time: "", description: "",
    fotoshare_url: "", video360_url: "", thumbnail: "",
    location: "", has_photos: true, has_video360: false, color: ""
  });
  
  const [newSession, setNewSession] = useState({ code: "", event_name: "" });

  const colorOptions = [
    { value: "#EC4899", label: "Rosa" },
    { value: "#8B5CF6", label: "Violeta" },
    { value: "#3B82F6", label: "Azul" },
    { value: "#10B981", label: "Verde" },
    { value: "#F59E0B", label: "Naranja" },
    { value: "#EF4444", label: "Rojo" },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [eventsRes, sessionsRes, prefsRes] = await Promise.all([
        axios.get(`${API}/events`),
        axios.get(`${API}/live/sessions/all`),
        axios.get(`${API}/preferences`)
      ]);
      setEvents(eventsRes.data);
      setLiveSessions(sessionsRes.data);
      setPreferences(prefsRes.data);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!newEvent.name || !newEvent.date) {
      toast.error("Nombre y fecha son requeridos");
      return;
    }
    try {
      await axios.post(`${API}/events`, newEvent);
      toast.success("Evento creado con portada automática");
      setNewEvent({
        name: "", date: "", time: "", description: "",
        fotoshare_url: "", video360_url: "", thumbnail: "",
        location: "", has_photos: true, has_video360: false, color: ""
      });
      fetchAllData();
    } catch (e) {
      toast.error("Error al crear evento");
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("¿Eliminar este evento?")) return;
    try {
      await axios.delete(`${API}/events/${eventId}`);
      toast.success("Evento eliminado");
      fetchAllData();
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  const createLiveSession = async () => {
    if (!newSession.code || !newSession.event_name) {
      toast.error("Código y nombre son requeridos");
      return;
    }
    try {
      await axios.post(`${API}/live/sessions/create?code=${newSession.code}&event_name=${encodeURIComponent(newSession.event_name)}`);
      toast.success("Sesión creada");
      setNewSession({ code: "", event_name: "" });
      fetchAllData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al crear sesión");
    }
  };

  const toggleSession = async (sessionId) => {
    try {
      await axios.put(`${API}/live/sessions/${sessionId}/toggle`);
      toast.success("Estado actualizado");
      fetchAllData();
    } catch (e) {
      toast.error("Error al actualizar");
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/live/sessions/${sessionId}`);
      toast.success("Sesión eliminada");
      fetchAllData();
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  const updatePreferences = async (showNet) => {
    try {
      await axios.put(`${API}/preferences?show_net_price=${showNet}&tax_rate=${preferences.tax_rate}`);
      setPreferences(prev => ({ ...prev, show_net_price: showNet }));
      toast.success("Preferencias actualizadas");
    } catch (e) {
      toast.error("Error al actualizar preferencias");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900" data-testid="admin-panel">
      <header className="border-b border-white/10 bg-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
          </div>
          <Link to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              ← Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-slate-800 border border-white/10">
            <TabsTrigger value="events" className="data-[state=active]:bg-orange-500">
              📸 Eventos ({events.length})
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-orange-500">
              🔴 Live ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500">
              💰 Precio Neto
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Crear Nuevo Evento</CardTitle>
                <CardDescription className="text-gray-400">
                  No necesitas subir foto. Se genera portada automática con emoji y color.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    placeholder="NOMBRE DEL CLIENTE (mayúsculas)"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value.toUpperCase()})}
                    className="bg-slate-700 border-white/10 text-white"
                    data-testid="new-event-name"
                  />
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="URL Fotoshare (opcional)"
                    value={newEvent.fotoshare_url}
                    onChange={(e) => setNewEvent({...newEvent, fotoshare_url: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="URL Video 360 (opcional)"
                    value={newEvent.video360_url}
                    onChange={(e) => setNewEvent({...newEvent, video360_url: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="Ubicación"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  
                  {/* Color selector */}
                  <Select value={newEvent.color} onValueChange={(v) => setNewEvent({...newEvent, color: v})}>
                    <SelectTrigger className="bg-slate-700 border-white/10 text-white">
                      <SelectValue placeholder="Color de portada (auto)" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="inline-block w-4 h-4 rounded mr-2" style={{backgroundColor: c.value}}></span>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Service toggles */}
                  <div className="flex items-center gap-4 col-span-full">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_photos"
                        checked={newEvent.has_photos}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, has_photos: checked})}
                        className="border-pink-500 data-[state=checked]:bg-pink-500"
                      />
                      <Label htmlFor="has_photos" className="text-white">📸 Fotos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_video360"
                        checked={newEvent.has_video360}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, has_video360: checked})}
                        className="border-cyan-500 data-[state=checked]:bg-cyan-500"
                      />
                      <Label htmlFor="has_video360" className="text-white">🎥 Video 360°</Label>
                    </div>
                  </div>
                  
                  <Input
                    placeholder="Descripción"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white md:col-span-2"
                  />
                  <Button onClick={createEvent} className="bg-orange-500 hover:bg-orange-600" data-testid="create-event-btn">
                    ✓ Crear Evento
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className="bg-slate-800 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Mini preview de portada */}
                        <div 
                          className="w-16 h-16 rounded flex items-center justify-center text-2xl"
                          style={{ backgroundColor: event.color || "#EC4899" }}
                        >
                          {event.has_photos && event.has_video360 ? "📸🎥" : event.has_video360 ? "🎥" : "📸"}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{event.name}</h3>
                          <p className="text-gray-400 text-sm">{event.date} - {event.location}</p>
                          <div className="flex gap-2 mt-1">
                            {event.has_photos && <Badge className="bg-pink-500/20 text-pink-400 text-xs">📸 Fotos</Badge>}
                            {event.has_video360 && <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">🎥 360°</Badge>}
                          </div>
                          {event.fotoshare_url && (
                            <a href={event.fotoshare_url} target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline block mt-1">
                              {event.fotoshare_url}
                            </a>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Sessions Tab */}
          <TabsContent value="live" className="space-y-6">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Crear Sesión Live</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Código (ej: ABC123)"
                    value={newSession.code}
                    onChange={(e) => setNewSession({...newSession, code: e.target.value.toUpperCase()})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="Nombre del evento"
                    value={newSession.event_name}
                    onChange={(e) => setNewSession({...newSession, event_name: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Button onClick={createLiveSession} className="bg-cyan-500 hover:bg-cyan-600">
                    Crear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {liveSessions.map((session) => (
                <Card key={session.id} className="bg-slate-800 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-lg">{session.code}</span>
                          <Badge className={session.is_active ? "bg-green-500" : "bg-gray-500"}>
                            {session.is_active ? "🟢 Activo" : "⚫ Inactivo"}
                          </Badge>
                        </div>
                        <p className="text-gray-400">{session.event_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleSession(session.id)}
                          className="border-white/20 text-white"
                        >
                          {session.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteSession(session.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {liveSessions.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay sesiones live creadas</p>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">💰 Configuración de Precio Neto</CardTitle>
                <CardDescription className="text-gray-400">
                  Esta preferencia afecta cómo se muestran las cotizaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <Label className="text-white font-semibold text-lg">Mostrar PRECIO NETO</Label>
                    <p className="text-gray-400 text-sm">
                      El cotizador mostrará el precio antes de impuestos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.show_net_price}
                    onCheckedChange={updatePreferences}
                    data-testid="net-price-switch"
                  />
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400">
                    <strong>Estado:</strong> {preferences.show_net_price ? "✓ PRECIO NETO ACTIVADO" : "Precio con IVA"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Tasa de IVA: {(preferences.tax_rate * 100).toFixed(0)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// ============ PICPARTY LIVE (RUTA /live) ============
const PicPartyLive = () => {
  const [code, setCode] = useState("");
  const [session, setSession] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleScanCode = async () => {
    if (!code.trim()) {
      toast.error("Por favor ingresa un código");
      return;
    }
    
    setScanning(true);
    try {
      const response = await axios.get(`${API}/live/scan/${code}`);
      setSession(response.data);
      toast.success(`¡Conectado a ${response.data.event_name}!`);
    } catch (e) {
      toast.error("Código no válido o sesión inactiva");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900" data-testid="picparty-live">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔴</span>
            </div>
            <h1 className="text-2xl font-bold text-white">PicParty Live</h1>
          </Link>
          <Link to="/">
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20">
              ← Galería
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-6xl">📱</span>
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-sm font-bold">LIVE</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Escanea tu Código</h2>
          <p className="text-gray-400 mb-8">Ingresa el código de tu evento para acceder a las fotos en tiempo real</p>

          {!session ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-center text-3xl tracking-widest h-16 font-mono"
                    data-testid="live-code-input"
                  />
                  <Button 
                    onClick={handleScanCode}
                    disabled={scanning}
                    className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg"
                    data-testid="scan-code-btn"
                  >
                    {scanning ? "Verificando..." : "🔍 Acceder al Evento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">✅</span>
                  <h3 className="text-xl font-bold text-white mb-2">¡Conectado!</h3>
                  <p className="text-gray-400 mb-4">{session.event_name}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-1">
                    🟢 Sesión Activa
                  </Badge>
                  <Button 
                    variant="outline" 
                    className="mt-6 w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setSession(null)}
                  >
                    Desconectar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 PicParty Live - adoca.net</p>
        </div>
      </footer>
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
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/live" element={<PicPartyLive />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
