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
from datetime import datetime, timezone, timedelta
import asyncio
import cloudinary
import cloudinary.api

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary configuration
cloudinary.config(
    cloud_name = "dpvliv2wl",
    api_key = os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret = os.environ.get('CLOUDINARY_API_SECRET', ''),
    secure = True
)

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
    event_type: str = "gallery"
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
    event_type: str = "boda"
    event_type_custom: Optional[str] = None
    event_date: str
    client_phone: Optional[str] = None
    is_active: bool = True
    is_vip: bool = False
    vip_pass: Optional[str] = None
    cloudinary_folder: Optional[str] = None
    is_demo: bool = False
    demo_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Contract(BaseModel):
    """Modelo de Contrato Empresarial"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    event_name: Optional[str] = None
    salon: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    service_time: Optional[str] = None
    contract_type: str = "public"
    include_cabina: bool = False
    cabina_hours: int = 0
    price_cabina: float = 0
    include_video360: bool = False
    video360_hours: int = 0
    price_video360: float = 0
    include_key_moments: bool = False
    key_moments_pieces: int = 0
    price_key_moments: float = 0
    include_live: bool = False
    price_live: float = 0
    extras: List[str] = []
    subtotal: float
    discount_amount: float = 0
    special_price: Optional[float] = None
    net_price: float
    cortesia: Optional[str] = None
    manual_total: Optional[float] = None
    anticipo_status: str = "pendiente"
    anticipo_amount: Optional[float] = None
    fecha_pago: Optional[str] = None
    costo_proveedor: Optional[float] = None
    utilidad_neta: Optional[float] = None
    status: str = "draft"
    notes: Optional[str] = None
    link_fotos: Optional[str] = None
    link_videos: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContractCreate(BaseModel):
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    event_name: Optional[str] = None
    salon: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    service_time: Optional[str] = None
    contract_type: str = "public"
    include_cabina: bool = False
    cabina_hours: int = 0
    price_cabina: float = 0
    include_video360: bool = False
    video360_hours: int = 0
    price_video360: float = 0
    include_key_moments: bool = False
    key_moments_pieces: int = 0
    price_key_moments: float = 0
    include_live: bool = False
    price_live: float = 0
    extras: List[str] = []
    discount_amount: float = 0
    special_price: Optional[float] = None
    notes: Optional[str] = None
    cortesia: Optional[str] = None
    anticipo_status: str = "pendiente"
    anticipo_amount: Optional[float] = None
    fecha_pago: Optional[str] = None
    costo_proveedor: Optional[float] = None
    manual_total: Optional[float] = None
    link_fotos: Optional[str] = None
    link_videos: Optional[str] = None

# ============ COLORES AUTOMÁTICOS ============
AUTO_COLORS = [
    "#EC4899", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
    "#EF4444", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
]

def get_auto_color(name: str) -> str:
    hash_val = sum(ord(c) for c in name)
    return AUTO_COLORS[hash_val % len(AUTO_COLORS)]

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "PicParty API - adoca.net"}

# ============ EVENTS ============

@api_router.get("/events", response_model=List[Event])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if not event.get('color'):
            event['color'] = get_auto_color(event.get('name', 'Default'))
    return events

@api_router.get("/events/by-date/{date}")
async def get_events_by_date(date: str):
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

# ============ PREFERENCES ============

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

# ============ QUOTES ============

@api_router.post("/quote", response_model=QuoteResponse)
async def calculate_quote(request: QuoteRequest):
    prefs = await db.preferences.find_one({"user_id": "default"}, {"_id": 0})
    show_net = prefs.get("show_net_price", True) if prefs else True
    tax_rate = prefs.get("tax_rate", 0.16) if prefs else 0.16
    subtotal = request.base_price * request.hours
    extras_cost = len(request.extras) * 500 if request.extras else 0
    subtotal += extras_cost
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

# ============ COTIZACIONES ============

class QuoteData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    folio: str
    cliente: str
    telefono: str
    salon: Optional[str] = None
    fecha_evento: Optional[str] = None
    servicio_principal: Optional[str] = None
    horas: Optional[int] = None
    precio_servicio: float = 0
    picpartylive: Optional[str] = None
    picpartylive_precio: float = 0
    descuento_pct: float = 0
    descuento_monto: float = 0
    subtotal: float
    total: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    folio: str
    cliente: str
    telefono: str
    salon: Optional[str] = None
    fecha_evento: Optional[str] = None
    servicio_principal: Optional[str] = None
    horas: Optional[int] = None
    precio_servicio: float = 0
    picpartylive: Optional[str] = None
    picpartylive_precio: float = 0
    descuento_pct: float = 0
    descuento_monto: float = 0
    subtotal: float
    total: float

@api_router.post("/quotes")
async def create_quote(quote_data: QuoteCreate):
    quote = QuoteData(**quote_data.model_dump())
    doc = quote.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.quotes.insert_one(doc)
    return {"id": quote.id, "folio": quote.folio, "message": "Cotización guardada"}

@api_router.get("/quotes")
async def get_quotes():
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return quotes

@api_router.get("/quotes/{folio}")
async def get_quote_by_folio(folio: str):
    quote = await db.quotes.find_one({"folio": folio}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return quote

# ============ CONTRATOS ============

@api_router.get("/contracts")
async def get_contracts():
    contracts = await db.contracts.find({}, {"_id": 0}).to_list(100)
    return contracts

@api_router.get("/contracts/{contract_id}")
async def get_contract(contract_id: str):
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

@api_router.post("/contracts")
async def create_contract(contract_data: ContractCreate):
    subtotal = 0
    price_cabina = contract_data.price_cabina if contract_data.include_cabina else 0
    subtotal += price_cabina
    price_video360 = contract_data.price_video360 if contract_data.include_video360 else 0
    subtotal += price_video360
    price_key_moments = contract_data.price_key_moments if contract_data.include_key_moments else 0
    subtotal += price_key_moments
    price_live = contract_data.price_live if contract_data.include_live else 0
    subtotal += price_live
    discount_amount = contract_data.discount_amount

    if contract_data.manual_total and contract_data.manual_total > 0:
        net_price = contract_data.manual_total
    elif contract_data.contract_type == "special" and contract_data.special_price is not None:
        net_price = contract_data.special_price
    else:
        net_price = subtotal - discount_amount

    utilidad_neta = None
    if contract_data.costo_proveedor is not None:
        utilidad_neta = net_price - contract_data.costo_proveedor

    contract = Contract(
        **{k: v for k, v in contract_data.model_dump().items() if k not in ['price_cabina', 'price_video360', 'price_key_moments', 'price_live', 'discount_amount']},
        price_cabina=price_cabina,
        price_video360=price_video360,
        price_key_moments=price_key_moments,
        price_live=price_live,
        subtotal=subtotal,
        discount_amount=discount_amount,
        net_price=net_price,
        utilidad_neta=utilidad_neta
    )

    doc = contract.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contracts.insert_one(doc)
    return contract

@api_router.put("/contracts/{contract_id}")
async def update_contract(contract_id: str, contract_data: ContractCreate):
    subtotal = 0
    price_cabina = contract_data.price_cabina if contract_data.include_cabina else 0
    subtotal += price_cabina
    price_video360 = contract_data.price_video360 if contract_data.include_video360 else 0
    subtotal += price_video360
    price_key_moments = contract_data.price_key_moments if contract_data.include_key_moments else 0
    subtotal += price_key_moments
    price_live = contract_data.price_live if contract_data.include_live else 0
    subtotal += price_live
    discount_amount = contract_data.discount_amount

    if contract_data.manual_total and contract_data.manual_total > 0:
        net_price = contract_data.manual_total
    elif contract_data.contract_type == "special" and contract_data.special_price is not None:
        net_price = contract_data.special_price
    else:
        net_price = subtotal - discount_amount

    utilidad_neta = None
    if contract_data.costo_proveedor is not None:
        utilidad_neta = net_price - contract_data.costo_proveedor

    update_data = contract_data.model_dump()
    update_data['subtotal'] = subtotal
    update_data['price_cabina'] = price_cabina
    update_data['price_video360'] = price_video360
    update_data['price_key_moments'] = price_key_moments
    update_data['price_live'] = price_live
    update_data['discount_amount'] = discount_amount
    update_data['net_price'] = net_price
    update_data['utilidad_neta'] = utilidad_neta

    result = await db.contracts.update_one(
        {"id": contract_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return {"message": "Contrato actualizado", "id": contract_id}

@api_router.put("/contracts/{contract_id}/status")
async def update_contract_status(contract_id: str, status: str):
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

@api_router.put("/contracts/{contract_id}/links")
async def update_contract_links(contract_id: str, link_fotos: str = None, link_videos: str = None):
    update_data = {}
    if link_fotos is not None:
        update_data["link_fotos"] = link_fotos
    if link_videos is not None:
        update_data["link_videos"] = link_videos
    if not update_data:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un link")
    result = await db.contracts.update_one(
        {"id": contract_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return {"message": "Links actualizados", "id": contract_id}

@api_router.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str):
    result = await db.contracts.delete_one({"id": contract_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return {"message": "Contrato eliminado"}

# ============ LIVE SESSIONS ============
# ⚠️  FIX CRÍTICO: Las rutas específicas DEBEN ir ANTES de las rutas con {parámetro}
# FastAPI resuelve rutas de arriba a abajo. Si /{session_id} va primero,
# "/all" se interpreta como session_id="all" y falla.

@api_router.get("/live/sessions")
async def get_live_sessions():
    sessions = await db.live_sessions.find({"is_active": True}, {"_id": 0}).to_list(100)
    return sessions

# ✅ FIX 1: /all va ANTES de /{session_id}
@api_router.get("/live/sessions/all")
async def get_all_live_sessions_sorted():
    """Obtener todas las sesiones ordenadas por fecha de creación (más recientes primero)"""
    sessions = await db.live_sessions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return sessions

@api_router.post("/live/sessions/create-simple")
async def admin_create_live_session(code: str, event_name: str):
    existing = await db.live_sessions.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Code already exists")
    session = LiveSession(code=code, event_name=event_name)
    doc = session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.live_sessions.insert_one(doc)
    return session

# ✅ FIX 2: Crear sesión con mejor manejo de errores y logs
@api_router.post("/live/sessions/create")
async def create_live_session_with_cloudinary(
    code: str,
    event_name: str,
    event_type: str = "boda",
    event_type_custom: str = None,
    event_date: str = None,
    client_phone: str = None,
    is_vip: bool = False,
    vip_pass: str = None,
    is_demo: str = None
):
    """Crear sesión Live con carpeta Cloudinary automática"""
    logger.info(f"Creando sesión: code={code}, event={event_name}, date={event_date}, phone={client_phone}")

    # Verificar si el código ya existe
    existing = await db.live_sessions.find_one({"code": code})
    if existing:
        logger.warning(f"Código {code} ya existe en la base de datos")
        raise HTTPException(status_code=400, detail=f"El código {code} ya existe. El sistema intentará con otro código automáticamente.")

    date_for_folder = event_date if event_date else datetime.now().strftime("%Y-%m-%d")

    # Generar carpeta Cloudinary con estructura ADOCA/MES/FECHA/TIPO_NOMBRE
    try:
        meses = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
                 'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
        fecha_obj = datetime.strptime(date_for_folder, "%Y-%m-%d")
        mes = meses[fecha_obj.month - 1]
        dia = str(fecha_obj.day).zfill(2)
        mes_num = str(fecha_obj.month).zfill(2)
        anio = str(fecha_obj.year)[-2:]
        fecha_formato = f"{dia}-{mes_num}-{anio}"
        tipo = event_type.upper().replace('QUINCEANIOS', 'XV')
        nombre_limpio = event_name.upper().replace(' ', '_')
        cloudinary_folder = f"ADOCA/{mes}/{fecha_formato}/{tipo}_{nombre_limpio}"
    except Exception as e:
        logger.warning(f"Error generando carpeta Cloudinary: {e}. Usando formato simple.")
        cloudinary_folder = f"{event_name.replace(' ', '_')}_{date_for_folder}"

    # Determinar si es demo
    is_demo_session = is_demo == "true" or code.startswith("DEMO-")
    demo_expires = None
    if is_demo_session:
        demo_expires = datetime.now(timezone.utc) + timedelta(hours=24)

    session = LiveSession(
        code=code,
        event_name=event_name,
        event_type=event_type,
        event_type_custom=event_type_custom if event_type == "otro" else None,
        event_date=event_date or datetime.now().strftime("%Y-%m-%d"),
        client_phone=client_phone,
        is_vip=is_vip,
        vip_pass=vip_pass if is_vip else None,
        cloudinary_folder=cloudinary_folder,
        is_demo=is_demo_session,
        demo_expires_at=demo_expires
    )

    doc = session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc['demo_expires_at']:
        doc['demo_expires_at'] = doc['demo_expires_at'].isoformat()

    await db.live_sessions.insert_one(doc)
    logger.info(f"Sesión creada exitosamente: {code} → carpeta: {cloudinary_folder}")
    return session

# Rutas con {session_id} VAN DESPUÉS de las rutas específicas
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

@api_router.put("/live/sessions/{session_id}")
async def update_live_session(
    session_id: str,
    event_name: str = None,
    event_type: str = None,
    event_type_custom: str = None,
    event_date: str = None,
    client_phone: str = None,
    code: str = None
):
    """Actualizar datos de una sesión Live existente"""
    session = await db.live_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    update_data = {}
    if event_name is not None:
        update_data["event_name"] = event_name
    if event_type is not None:
        update_data["event_type"] = event_type
    if event_type_custom is not None:
        update_data["event_type_custom"] = event_type_custom if event_type == "otro" else None
    if event_date is not None:
        update_data["event_date"] = event_date
    if client_phone is not None:
        update_data["client_phone"] = client_phone
    if code is not None:
        existing = await db.live_sessions.find_one({"code": code, "id": {"$ne": session_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Ese código ya está en uso")
        update_data["code"] = code

    if event_name or event_date:
        new_name = event_name or session.get("event_name", "Evento")
        new_date = event_date or session.get("event_date", datetime.now().strftime("%Y-%m-%d"))
        try:
            meses = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
                     'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
            fecha_obj = datetime.strptime(new_date, "%Y-%m-%d")
            mes = meses[fecha_obj.month - 1]
            dia = str(fecha_obj.day).zfill(2)
            mes_num = str(fecha_obj.month).zfill(2)
            anio = str(fecha_obj.year)[-2:]
            fecha_formato = f"{dia}-{mes_num}-{anio}"
            tipo = (event_type or session.get("event_type", "EVENTO")).upper().replace('QUINCEANIOS', 'XV')
            nombre_limpio = new_name.upper().replace(' ', '_')
            update_data["cloudinary_folder"] = f"ADOCA/{mes}/{fecha_formato}/{tipo}_{nombre_limpio}"
        except Exception:
            update_data["cloudinary_folder"] = f"{new_name.replace(' ', '_')}_{new_date}"

    if update_data:
        await db.live_sessions.update_one({"id": session_id}, {"$set": update_data})

    updated = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    return updated

@api_router.delete("/live/sessions/{session_id}")
async def delete_live_session(session_id: str):
    result = await db.live_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

# ============ SCAN (acceso por código) ============

@api_router.get("/live/scan/{code}")
async def scan_code(code: str):
    """Acceso por código - SIN VALIDACIÓN DE FECHA NI ESTADO ACTIVO"""
    session = await db.live_sessions.find_one({"code": code}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Código no encontrado")
    return session

# ============ FOTOS DEL MURO COLABORATIVO ============

class PhotoReaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    emoji: str
    count: int = 0

class EventPhoto(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_code: str
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    uploader_id: Optional[str] = None
    cloudinary_folder: Optional[str] = None
    reactions: dict = Field(default_factory=lambda: {"👸": 0, "✨": 0, "👑": 0, "💃": 0, "📸": 0})
    likes: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PhotoCreate(BaseModel):
    event_code: str
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    uploader_id: Optional[str] = None
    cloudinary_folder: Optional[str] = None

class ReactionUpdate(BaseModel):
    emoji: str

ALLOWED_EMOJIS = ["👸", "✨", "👑", "💃", "📸", "❤️"]

# ✅ FIX 3: /live/photos/count/{event_code} va ANTES de /live/photos/{event_code}
@api_router.get("/live/photos/count/{event_code}")
async def get_photo_count(event_code: str):
    """Obtener cantidad de fotos de un evento"""
    count = await db.event_photos.count_documents({"event_code": event_code})
    return {"event_code": event_code, "count": count}

@api_router.post("/live/photos")
async def add_photo_to_event(photo_data: PhotoCreate):
    """Agregar foto al muro colaborativo del evento"""
    # ✅ FIX 4: Eliminada validación is_active=True - cualquier sesión existente puede recibir fotos
    session = await db.live_sessions.find_one({"code": photo_data.event_code})
    if not session:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    photo = EventPhoto(
        event_code=photo_data.event_code,
        cloudinary_url=photo_data.cloudinary_url,
        thumbnail_url=photo_data.thumbnail_url,
        uploader_id=photo_data.uploader_id,
        cloudinary_folder=photo_data.cloudinary_folder
    )

    doc = photo.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.event_photos.insert_one(doc)

    return {"id": photo.id, "message": "Foto agregada al muro", "folder": photo_data.cloudinary_folder}

@api_router.get("/live/photos/{event_code}")
async def get_event_photos(event_code: str):
    """Obtener todas las fotos del muro colaborativo del evento"""
    session = await db.live_sessions.find_one({"code": event_code})
    if not session:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    photos = await db.event_photos.find(
        {"event_code": event_code},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)

    # Añadir campo 'likes' calculado desde reactions si no existe
    for photo in photos:
        if 'likes' not in photo:
            reactions = photo.get('reactions', {})
            photo['likes'] = reactions.get('❤️', 0)

    return {"event_code": event_code, "photos": photos, "total": len(photos)}

@api_router.post("/live/photos/{photo_id}/react")
async def add_reaction_to_photo(photo_id: str, reaction: ReactionUpdate):
    """Agregar reacción a una foto"""
    photo = await db.event_photos.find_one({"id": photo_id})
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")

    # Incrementar likes si es corazón
    update_ops = {f"reactions.{reaction.emoji}": 1}
    if reaction.emoji == "❤️":
        update_ops["likes"] = 1

    await db.event_photos.update_one(
        {"id": photo_id},
        {"$inc": update_ops}
    )

    updated_photo = await db.event_photos.find_one({"id": photo_id}, {"_id": 0})
    return {"message": "Reacción agregada", "reactions": updated_photo.get("reactions", {}), "likes": updated_photo.get("likes", 0)}

@api_router.get("/live/photos/{photo_id}/reactions")
async def get_photo_reactions(photo_id: str):
    photo = await db.event_photos.find_one({"id": photo_id}, {"_id": 0, "reactions": 1})
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return {"photo_id": photo_id, "reactions": photo.get("reactions", {})}

@api_router.delete("/live/photos/{photo_id}")
async def delete_photo(photo_id: str):
    result = await db.event_photos.delete_one({"id": photo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return {"message": "Foto eliminada"}

# ============ CLOUDINARY SYNC ============

@api_router.post("/live/sync-cloudinary/{event_code}")
async def sync_cloudinary_photos(event_code: str, folder_path: str = None):
    """Sincronizar fotos de una carpeta de Cloudinary con la base de datos"""
    try:
        session = await db.live_sessions.find_one({"code": event_code})
        if not session:
            raise HTTPException(status_code=404, detail="Sesión no encontrada")

        target_folder = folder_path or session.get("cloudinary_folder")
        if not target_folder:
            raise HTTPException(status_code=400, detail="No se especificó carpeta de Cloudinary")

        try:
            result = cloudinary.api.resources(
                type="upload",
                prefix=target_folder,
                max_results=500,
                resource_type="image"
            )
        except Exception as e:
            logger.error(f"Error consultando Cloudinary: {e}")
            raise HTTPException(status_code=500, detail=f"Error consultando Cloudinary: {str(e)}")

        imported_count = 0
        skipped_count = 0

        for resource in result.get("resources", []):
            existing = await db.event_photos.find_one({"cloudinary_url": resource["secure_url"]})
            if existing:
                skipped_count += 1
                continue

            photo_doc = {
                "id": str(uuid.uuid4()),
                "event_code": event_code,
                "cloudinary_url": resource["secure_url"],
                "thumbnail_url": resource["secure_url"].replace("/upload/", "/upload/w_300,h_300,c_fill/"),
                "cloudinary_folder": target_folder,
                "public_id": resource.get("public_id"),
                "reactions": {"👸": 0, "✨": 0, "👑": 0, "💃": 0, "📸": 0, "❤️": 0},
                "likes": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

            await db.event_photos.insert_one(photo_doc)
            imported_count += 1

        if folder_path and folder_path != session.get("cloudinary_folder"):
            await db.live_sessions.update_one(
                {"code": event_code},
                {"$set": {"cloudinary_folder": folder_path}}
            )

        return {
            "message": "Sincronización completada",
            "imported": imported_count,
            "skipped": skipped_count,
            "folder": target_folder
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en sincronización: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/live/cloudinary-folders")
async def list_cloudinary_folders(prefix: str = "ADOCA"):
    try:
        result = cloudinary.api.subfolders(prefix)
        folders = [f["path"] for f in result.get("folders", [])]
        return {"folders": folders, "prefix": prefix}
    except Exception as e:
        logger.error(f"Error listando carpetas: {e}")
        return {"folders": [], "error": str(e)}

# ============ SEED EVENTS ============

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
            "thumbnail": None,
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
            "thumbnail": None,
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
            "thumbnail": None,
            "location": "Guadalajara",
            "has_photos": True,
            "has_video360": True,
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

# ============ CALENDAR ============

@api_router.get("/calendar/dates-with-events")
async def get_dates_with_events():
    events = await db.events.find({}, {"date": 1, "_id": 0}).to_list(1000)
    dates = list(set(e["date"] for e in events))
    return {"dates": dates}

# ============ LIMPIEZA DE DEMOS ============

@api_router.delete("/live/cleanup-demos")
async def cleanup_expired_demos():
    now = datetime.now(timezone.utc).isoformat()
    expired_demos = await db.live_sessions.find({
        "is_demo": True,
        "demo_expires_at": {"$lt": now}
    }).to_list(100)

    deleted_sessions = 0
    deleted_photos = 0

    for demo in expired_demos:
        photo_result = await db.event_photos.delete_many({"event_code": demo["code"]})
        deleted_photos += photo_result.deleted_count
        await db.live_sessions.delete_one({"code": demo["code"]})
        deleted_sessions += 1
        logger.info(f"Demo expirada eliminada: {demo['code']}")

    return {
        "message": "Limpieza completada",
        "deleted_sessions": deleted_sessions,
        "deleted_photos": deleted_photos
    }

async def cleanup_task():
    while True:
        try:
            await asyncio.sleep(3600)
            now = datetime.now(timezone.utc).isoformat()
            expired_demos = await db.live_sessions.find({
                "is_demo": True,
                "demo_expires_at": {"$lt": now}
            }).to_list(100)
            for demo in expired_demos:
                await db.event_photos.delete_many({"event_code": demo["code"]})
                await db.live_sessions.delete_one({"code": demo["code"]})
                logger.info(f"[AUTO-CLEANUP] Demo expirada eliminada: {demo['code']}")
        except Exception as e:
            logger.error(f"Error en limpieza automática: {e}")

@app.on_event("startup")
async def start_cleanup_task():
    asyncio.create_task(cleanup_task())

# ============ APP SETUP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
