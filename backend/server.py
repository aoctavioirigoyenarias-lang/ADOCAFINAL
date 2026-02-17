from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Event(BaseModel):
    """Eventos para GALERÍA PRO - Solo visualización IFRAME, NO Cloudinary"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    date: str
    time: Optional[str] = None
    description: Optional[str] = None
    fotoshare_url: Optional[str] = None
    video360_url: Optional[str] = None
    thumbnail: Optional[str] = None
    location: Optional[str] = None
    has_photos: bool = True
    has_video360: bool = False
    color: Optional[str] = None
    event_type: str = "gallery"  # "gallery" = solo visualización
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    name: str
    date: str
    time: Optional[str] = None
    description: Optional[str] = None
    fotoshare_url: Optional[str] = None
    video360_url: Optional[str] = None
    thumbnail: Optional[str] = None
    location: Optional[str] = None
    has_photos: bool = True
    has_video360: bool = False
    color: Optional[str] = None

class UserPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default"
    show_net_price: bool = True
    tax_rate: float = 0.16
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteRequest(BaseModel):
    base_price: float
    hours: Optional[int] = 1
    extras: Optional[List[str]] = []
    include_video360: bool = False

class QuoteResponse(BaseModel):
    base_price: float
    subtotal: float
    tax: float
    total: float
    net_price: float
    show_net_price: bool

class LiveSession(BaseModel):
    """Sesiones PICPARTY LIVE - Genera carpetas Cloudinary y QR"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    event_name: str
    event_type: str = "boda"  # Tipo de evento
    event_type_custom: Optional[str] = None  # Si es "otro"
    event_date: str  # Fecha del evento
    is_active: bool = True
    is_vip: bool = False
    vip_pass: Optional[str] = None
    cloudinary_folder: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Contract(BaseModel):
    """Modelo de Contrato Empresarial"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Datos del cliente
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    # Datos del evento
    event_name: str
    salon: str
    event_date: str
    event_time: str  # Horario del evento
    service_time: str  # Horario del servicio
    duration_hours: int
    # Tipo de contrato
    contract_type: str = "public"  # "public" = Precio Neto, "special" = Precio Especial
    # Servicios
    base_package: str = "standard"
    base_price: float
    include_video360: bool = False
    include_live: bool = False
    extras: List[str] = []
    # Precios
    subtotal: float
    discount_percent: float = 0
    discount_amount: float = 0
    special_price: Optional[float] = None  # Solo para contratos especiales
    net_price: float
    # Estado
    status: str = "draft"  # draft, confirmed, completed, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContractCreate(BaseModel):
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    event_name: str
    salon: str
    event_date: str
    event_time: str
    service_time: str
    duration_hours: int
    contract_type: str = "public"
    base_package: str = "standard"
    base_price: float
    include_video360: bool = False
    include_live: bool = False
    extras: List[str] = []
    discount_percent: float = 0
    special_price: Optional[float] = None
    notes: Optional[str] = None

# ============ COLORES AUTOMÁTICOS PARA PORTADAS ============
AUTO_COLORS = [
    "#EC4899", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
    "#EF4444", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
]

def get_auto_color(name: str) -> str:
    """Genera un color consistente basado en el nombre"""
    hash_val = sum(ord(c) for c in name)
    return AUTO_COLORS[hash_val % len(AUTO_COLORS)]

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "PicParty API - adoca.net"}

# Events endpoints
@api_router.get("/events", response_model=List[Event])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).to_list(100)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        # Asignar color automático si no tiene
        if not event.get('color'):
            event['color'] = get_auto_color(event.get('name', 'Default'))
    return events

@api_router.get("/events/by-date/{date}")
async def get_events_by_date(date: str):
    """Filtrar eventos por fecha específica (YYYY-MM-DD)"""
    events = await db.events.find({"date": date}, {"_id": 0}).to_list(100)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if not event.get('color'):
            event['color'] = get_auto_color(event.get('name', 'Default'))
    return events

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate):
    event_dict = event_data.model_dump()
    # Asignar color automático si no se proporciona
    if not event_dict.get('color'):
        event_dict['color'] = get_auto_color(event_dict['name'])
    
    event = Event(**event_dict)
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.insert_one(doc)
    return event

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if isinstance(event.get('created_at'), str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    if not event.get('color'):
        event['color'] = get_auto_color(event.get('name', 'Default'))
    return event

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, event_data: EventCreate):
    update_dict = event_data.model_dump()
    if not update_dict.get('color'):
        update_dict['color'] = get_auto_color(update_dict['name'])
    
    result = await db.events.update_one(
        {"id": event_id},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated successfully", "id": event_id}

# User preferences
@api_router.get("/preferences")
async def get_preferences():
    prefs = await db.preferences.find_one({"user_id": "default"}, {"_id": 0})
    if not prefs:
        default_prefs = UserPreferences()
        doc = default_prefs.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.preferences.insert_one(doc)
        return default_prefs
    if isinstance(prefs.get('updated_at'), str):
        prefs['updated_at'] = datetime.fromisoformat(prefs['updated_at'])
    return prefs

@api_router.put("/preferences")
async def update_preferences(show_net_price: bool = True, tax_rate: float = 0.16):
    await db.preferences.update_one(
        {"user_id": "default"},
        {"$set": {
            "show_net_price": show_net_price,
            "tax_rate": tax_rate,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"message": "Preferences updated", "show_net_price": show_net_price}

# Quote calculation - PRECIO NETO
@api_router.post("/quote", response_model=QuoteResponse)
async def calculate_quote(request: QuoteRequest):
    prefs = await db.preferences.find_one({"user_id": "default"}, {"_id": 0})
    show_net = prefs.get("show_net_price", True) if prefs else True
    tax_rate = prefs.get("tax_rate", 0.16) if prefs else 0.16
    
    subtotal = request.base_price * request.hours
    extras_cost = len(request.extras) * 500 if request.extras else 0
    subtotal += extras_cost
    
    # Video 360 extra
    if request.include_video360:
        subtotal += 3000
    
    tax = subtotal * tax_rate
    total = subtotal + tax
    net_price = subtotal
    
    return QuoteResponse(
        base_price=request.base_price,
        subtotal=subtotal,
        tax=tax,
        total=total,
        net_price=net_price,
        show_net_price=show_net
    )

# Live session endpoints
@api_router.get("/live/sessions")
async def get_live_sessions():
    sessions = await db.live_sessions.find({"is_active": True}, {"_id": 0}).to_list(100)
    return sessions

@api_router.get("/live/sessions/all")
async def get_all_live_sessions():
    sessions = await db.live_sessions.find({}, {"_id": 0}).to_list(100)
    return sessions

@api_router.post("/live/sessions/create")
async def admin_create_live_session(code: str, event_name: str):
    existing = await db.live_sessions.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Code already exists")
    
    session = LiveSession(code=code, event_name=event_name)
    doc = session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.live_sessions.insert_one(doc)
    return session

@api_router.get("/live/scan/{code}")
async def scan_code(code: str):
    session = await db.live_sessions.find_one({"code": code, "is_active": True}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or inactive")
    return session

@api_router.delete("/live/sessions/{session_id}")
async def delete_live_session(session_id: str):
    result = await db.live_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

@api_router.put("/live/sessions/{session_id}/toggle")
async def toggle_live_session(session_id: str):
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    new_status = not session.get("is_active", True)
    await db.live_sessions.update_one(
        {"id": session_id},
        {"$set": {"is_active": new_status}}
    )
    return {"message": "Session toggled", "is_active": new_status}

# Seed events with MULTISERVICIO support
@api_router.post("/seed-events")
async def seed_events():
    initial_events = [
        {
            "id": str(uuid.uuid4()),
            "name": "PAULA",
            "date": "2025-01-15",
            "time": "18:00",
            "description": "Evento especial de Paula",
            "fotoshare_url": "https://fotoshare.co/e/-AUAT_kcGz8xs9NmSU1gz",
            "video360_url": None,
            "thumbnail": None,  # SIN FOTO - usará portada automática
            "location": "Ciudad de México",
            "has_photos": True,
            "has_video360": False,
            "color": "#EC4899",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "FERNANDA",
            "date": "2025-01-20",
            "time": "19:00",
            "description": "Celebración de Fernanda",
            "fotoshare_url": "https://fotoshare.co/e/LuUlUt1awwHl_k0fD7K2M",
            "video360_url": None,
            "thumbnail": None,  # SIN FOTO - usará portada automática
            "location": "Monterrey",
            "has_photos": True,
            "has_video360": False,
            "color": "#8B5CF6",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RESIDEO",
            "date": "2025-01-25",
            "time": "17:00",
            "description": "Evento corporativo Resideo",
            "fotoshare_url": "https://fotoshare.co/e/E8uvCS1AtuKMxXiOYUL1M",
            "video360_url": "https://example.com/resideo-360",
            "thumbnail": None,  # SIN FOTO - usará portada automática
            "location": "Guadalajara",
            "has_photos": True,
            "has_video360": True,  # MIXTO: Fotos + Video 360
            "color": "#3B82F6",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.events.delete_many({})
    await db.events.insert_many(initial_events)
    
    await db.preferences.update_one(
        {"user_id": "default"},
        {"$set": {
            "show_net_price": True,
            "tax_rate": 0.16,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Events seeded successfully", "count": len(initial_events)}

# Calendar data endpoint
@api_router.get("/calendar/dates-with-events")
async def get_dates_with_events():
    """Devuelve todas las fechas que tienen eventos"""
    events = await db.events.find({}, {"date": 1, "_id": 0}).to_list(1000)
    dates = list(set(e["date"] for e in events))
    return {"dates": dates}

# ============ CONTRATOS ENDPOINTS ============

@api_router.get("/contracts")
async def get_contracts():
    """Obtener todos los contratos"""
    contracts = await db.contracts.find({}, {"_id": 0}).to_list(100)
    return contracts

@api_router.get("/contracts/{contract_id}")
async def get_contract(contract_id: str):
    """Obtener un contrato específico"""
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

@api_router.post("/contracts")
async def create_contract(contract_data: ContractCreate):
    """Crear nuevo contrato - Público o Especial"""
    # Calcular precios
    subtotal = contract_data.base_price * contract_data.duration_hours
    
    # Extras
    extras_cost = len(contract_data.extras) * 500
    subtotal += extras_cost
    
    # Video 360
    if contract_data.include_video360:
        subtotal += 3000
    
    # PicParty Live
    if contract_data.include_live:
        subtotal += 2000
    
    # Descuento
    discount_amount = subtotal * (contract_data.discount_percent / 100)
    
    # Precio final
    if contract_data.contract_type == "special" and contract_data.special_price is not None:
        net_price = contract_data.special_price
    else:
        net_price = subtotal - discount_amount
    
    contract = Contract(
        **contract_data.model_dump(),
        subtotal=subtotal,
        discount_amount=discount_amount,
        net_price=net_price
    )
    
    doc = contract.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contracts.insert_one(doc)
    
    return contract

@api_router.put("/contracts/{contract_id}")
async def update_contract(contract_id: str, contract_data: ContractCreate):
    """Actualizar contrato existente"""
    # Recalcular precios
    subtotal = contract_data.base_price * contract_data.duration_hours
    extras_cost = len(contract_data.extras) * 500
    subtotal += extras_cost
    if contract_data.include_video360:
        subtotal += 3000
    if contract_data.include_live:
        subtotal += 2000
    
    discount_amount = subtotal * (contract_data.discount_percent / 100)
    
    if contract_data.contract_type == "special" and contract_data.special_price is not None:
        net_price = contract_data.special_price
    else:
        net_price = subtotal - discount_amount
    
    update_data = contract_data.model_dump()
    update_data['subtotal'] = subtotal
    update_data['discount_amount'] = discount_amount
    update_data['net_price'] = net_price
    
    result = await db.contracts.update_one(
        {"id": contract_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    return {"message": "Contrato actualizado", "id": contract_id}

@api_router.put("/contracts/{contract_id}/status")
async def update_contract_status(contract_id: str, status: str):
    """Cambiar estado del contrato"""
    valid_statuses = ["draft", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Use: {valid_statuses}")
    
    result = await db.contracts.update_one(
        {"id": contract_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    return {"message": f"Estado actualizado a {status}"}

@api_router.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str):
    """Eliminar contrato"""
    result = await db.contracts.delete_one({"id": contract_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return {"message": "Contrato eliminado"}

# ============ LIVE SESSIONS CON CLOUDINARY ============

@api_router.post("/live/sessions/create")
async def create_live_session_with_cloudinary(
    code: str, 
    event_name: str, 
    event_type: str = "boda",
    event_type_custom: str = None,
    event_date: str = None,
    is_vip: bool = False, 
    vip_pass: str = None
):
    """Crear sesión Live con carpeta Cloudinary automática"""
    existing = await db.live_sessions.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Código ya existe")
    
    # Usar la fecha del evento o la de hoy
    date_for_folder = event_date if event_date else datetime.now().strftime("%Y-%m-%d")
    cloudinary_folder = f"{event_name.replace(' ', '_')}_{date_for_folder}"
    
    session = LiveSession(
        code=code,
        event_name=event_name,
        event_type=event_type,
        event_type_custom=event_type_custom if event_type == "otro" else None,
        event_date=event_date or datetime.now().strftime("%Y-%m-%d"),
        is_vip=is_vip,
        vip_pass=vip_pass if is_vip else None,
        cloudinary_folder=cloudinary_folder
    )
    
    doc = session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.live_sessions.insert_one(doc)
    
    return session

# Obtener sesiones ordenadas por fecha descendente
@api_router.get("/live/sessions/all")
async def get_all_live_sessions_sorted():
    """Obtener todas las sesiones ordenadas por fecha (más recientes primero)"""
    sessions = await db.live_sessions.find({}, {"_id": 0}).sort("event_date", -1).to_list(100)
    return sessions

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
