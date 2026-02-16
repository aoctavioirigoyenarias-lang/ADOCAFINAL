import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ============ GALERÍA DE EVENTOS (RUTA PRINCIPAL /) ============
const EventGallery = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      if (response.data.length === 0) {
        await axios.post(`${API}/seed-events`);
        const newResponse = await axios.get(`${API}/events`);
        setEvents(newResponse.data);
      } else {
        setEvents(response.data);
      }
    } catch (e) {
      console.error("Error fetching events:", e);
      try {
        await axios.post(`${API}/seed-events`);
        const response = await axios.get(`${API}/events`);
        setEvents(response.data);
      } catch (seedError) {
        console.error("Error seeding events:", seedError);
      }
    } finally {
      setLoading(false);
    }
  };

  const eventDates = events.map(e => new Date(e.date + 'T12:00:00'));

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
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">adoca.net</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/cotizador">
              <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20" data-testid="cotizador-btn">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cotizador
              </Button>
            </Link>
            <Link to="/live">
              <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/20" data-testid="go-live-btn">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                PicParty Live
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" data-testid="admin-btn">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendario
              </CardTitle>
              <CardDescription className="text-gray-400">Selecciona una fecha para ver eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-white/10 bg-white/5 text-white"
                modifiers={{ hasEvent: eventDates }}
                modifiersStyles={{
                  hasEvent: { 
                    backgroundColor: 'rgb(236 72 153 / 0.3)',
                    borderRadius: '50%'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Eventos Disponibles ({events.length})</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group"
                  data-testid={`event-card-${event.name.toLowerCase()}`}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={event.thumbnail} 
                      alt={event.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-pink-500/80 hover:bg-pink-500">
                      {event.date}
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h4 className="text-lg font-bold text-white mb-1">{event.name}</h4>
                    <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <a 
                      href={event.fotoshare_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block w-full"
                      data-testid={`view-photos-${event.name.toLowerCase()}`}
                    >
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Ver Fotos
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 adoca.net - PicParty Events</p>
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
  
  // Form state
  const [basePrice, setBasePrice] = useState(5000);
  const [hours, setHours] = useState(4);
  const [extras, setExtras] = useState([]);
  
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
        extras: extras
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
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Cotizador</h1>
          </Link>
          <Link to="/">
            <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20" data-testid="back-to-gallery">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Galería
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Cotizador de Servicios</h2>
            <p className="text-gray-400">Calcula el precio de tu evento fotográfico</p>
            {preferences.show_net_price && (
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Mostrando Precio Neto
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Configura tu Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base Price */}
                <div className="space-y-2">
                  <Label className="text-white">Precio Base por Hora</Label>
                  <Select value={basePrice.toString()} onValueChange={(v) => setBasePrice(parseInt(v))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="base-price-select">
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

                {/* Hours */}
                <div className="space-y-2">
                  <Label className="text-white">Horas de Cobertura</Label>
                  <Select value={hours.toString()} onValueChange={(v) => setHours(parseInt(v))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="hours-select">
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

                {/* Extras */}
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
                          data-testid={`extra-${extra.id}`}
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

            {/* Quote Result */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Tu Cotización</CardTitle>
              </CardHeader>
              <CardContent>
                {quote ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">Precio base x {hours}hrs</span>
                      <span className="text-white">{formatCurrency(quote.base_price * hours)}</span>
                    </div>
                    
                    {extras.length > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-gray-400">Extras ({extras.length})</span>
                        <span className="text-white">{formatCurrency(extras.length * 500)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatCurrency(quote.subtotal)}</span>
                    </div>

                    {quote.show_net_price ? (
                      <>
                        <div className="flex justify-between items-center py-3 bg-emerald-500/20 rounded-lg px-4" data-testid="net-price-display">
                          <span className="text-emerald-300 font-semibold">PRECIO NETO</span>
                          <span className="text-emerald-400 text-2xl font-bold">{formatCurrency(quote.net_price)}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          * Precio neto antes de impuestos según tus preferencias
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
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
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
  
  // New event form
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
    fotoshare_url: "",
    thumbnail: "",
    location: ""
  });
  
  // New live session form
  const [newSession, setNewSession] = useState({ code: "", event_name: "" });

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
    if (!newEvent.name || !newEvent.date || !newEvent.fotoshare_url) {
      toast.error("Nombre, fecha y URL son requeridos");
      return;
    }
    try {
      await axios.post(`${API}/events`, newEvent);
      toast.success("Evento creado");
      setNewEvent({ name: "", date: "", time: "", description: "", fotoshare_url: "", thumbnail: "", location: "" });
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
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
          </div>
          <Link to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="admin-back-btn">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-slate-800 border border-white/10">
            <TabsTrigger value="events" className="data-[state=active]:bg-orange-500" data-testid="tab-events">
              Eventos ({events.length})
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-orange-500" data-testid="tab-live">
              Sesiones Live ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500" data-testid="tab-settings">
              Preferencias
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Create Event Form */}
            <Card className="bg-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Crear Nuevo Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nombre del evento"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                    data-testid="new-event-name"
                  />
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                    data-testid="new-event-date"
                  />
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="URL de Fotoshare"
                    value={newEvent.fotoshare_url}
                    onChange={(e) => setNewEvent({...newEvent, fotoshare_url: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                    data-testid="new-event-url"
                  />
                  <Input
                    placeholder="URL de Thumbnail"
                    value={newEvent.thumbnail}
                    onChange={(e) => setNewEvent({...newEvent, thumbnail: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="Ubicación"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                  />
                  <Input
                    placeholder="Descripción"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white md:col-span-2"
                  />
                  <Button onClick={createEvent} className="bg-orange-500 hover:bg-orange-600" data-testid="create-event-btn">
                    Crear Evento
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
                        <img src={event.thumbnail} alt={event.name} className="w-16 h-16 rounded object-cover" />
                        <div>
                          <h3 className="text-white font-semibold">{event.name}</h3>
                          <p className="text-gray-400 text-sm">{event.date} - {event.location}</p>
                          <a href={event.fotoshare_url} target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline">
                            {event.fotoshare_url}
                          </a>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                        data-testid={`delete-event-${event.name.toLowerCase()}`}
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
            {/* Create Session Form */}
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
                    data-testid="new-session-code"
                  />
                  <Input
                    placeholder="Nombre del evento"
                    value={newSession.event_name}
                    onChange={(e) => setNewSession({...newSession, event_name: e.target.value})}
                    className="bg-slate-700 border-white/10 text-white"
                    data-testid="new-session-name"
                  />
                  <Button onClick={createLiveSession} className="bg-cyan-500 hover:bg-cyan-600" data-testid="create-session-btn">
                    Crear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <div className="grid gap-4">
              {liveSessions.map((session) => (
                <Card key={session.id} className="bg-slate-800 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-lg">{session.code}</span>
                          <Badge className={session.is_active ? "bg-green-500" : "bg-gray-500"}>
                            {session.is_active ? "Activo" : "Inactivo"}
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
                <CardTitle className="text-white">Preferencias de Cotización</CardTitle>
                <CardDescription className="text-gray-400">
                  Configura cómo se muestran los precios en el cotizador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <Label className="text-white font-semibold">Mostrar Precio Neto</Label>
                    <p className="text-gray-400 text-sm">
                      Cuando está activo, el cotizador muestra el precio antes de impuestos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.show_net_price}
                    onCheckedChange={updatePreferences}
                    data-testid="net-price-switch"
                  />
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 text-sm">
                    <strong>Estado actual:</strong> {preferences.show_net_price ? "Precio Neto activado" : "Precio Total con IVA"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Tasa de IVA configurada: {(preferences.tax_rate * 100).toFixed(0)}%
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
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">PicParty Live</h1>
          </Link>
          <Link to="/">
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20" data-testid="back-to-gallery-btn">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Galería
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-xs font-bold">LIVE</span>
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
                    placeholder="Ingresa el código del evento"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest h-14"
                    data-testid="live-code-input"
                  />
                  <Button 
                    onClick={handleScanCode}
                    disabled={scanning}
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg"
                    data-testid="scan-code-btn"
                  >
                    {scanning ? "Verificando..." : "Acceder al Evento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">¡Conectado!</h3>
                  <p className="text-gray-400 mb-4">{session.event_name}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Sesión Activa
                  </Badge>
                  <Button 
                    variant="outline" 
                    className="mt-6 w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setSession(null)}
                    data-testid="disconnect-btn"
                  >
                    Desconectar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 PicParty Live - adoca.net</p>
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
          {/* RUTA PRINCIPAL: Galería de Eventos */}
          <Route path="/" element={<EventGallery />} />
          
          {/* COTIZADOR */}
          <Route path="/cotizador" element={<Cotizador />} />
          
          {/* PANEL ADMIN */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* PICPARTY LIVE */}
          <Route path="/live" element={<PicPartyLive />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
