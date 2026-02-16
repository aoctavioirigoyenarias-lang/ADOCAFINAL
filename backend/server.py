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

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    date: str
    time: Optional[str] = None
    description: Optional[str] = None
    fotoshare_url: str
    thumbnail: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    name: str
    date: str
    time: Optional[str] = None
    description: Optional[str] = None
    fotoshare_url: str
    thumbnail: Optional[str] = None
    location: Optional[str] = None

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

class QuoteResponse(BaseModel):
    base_price: float
    subtotal: float
    tax: float
    total: float
    net_price: float
    show_net_price: bool

class LiveSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    event_name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Routes

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
    return events

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate):
    event = Event(**event_data.model_dump())
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
    return event

# User preferences (for net price setting)
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

# Quote calculation (always shows net price based on preferences)
@api_router.post("/quote", response_model=QuoteResponse)
async def calculate_quote(request: QuoteRequest):
    prefs = await db.preferences.find_one({"user_id": "default"}, {"_id": 0})
    show_net = prefs.get("show_net_price", True) if prefs else True
    tax_rate = prefs.get("tax_rate", 0.16) if prefs else 0.16
    
    subtotal = request.base_price * request.hours
    extras_cost = len(request.extras) * 500 if request.extras else 0
    subtotal += extras_cost
    
    tax = subtotal * tax_rate
    total = subtotal + tax
    net_price = subtotal  # Net price = price before tax
    
    return QuoteResponse(
        base_price=request.base_price,
        subtotal=subtotal,
        tax=tax,
        total=total,
        net_price=net_price,
        show_net_price=show_net
    )

# Live session endpoints (for /live route)
@api_router.get("/live/sessions")
async def get_live_sessions():
    sessions = await db.live_sessions.find({"is_active": True}, {"_id": 0}).to_list(100)
    return sessions

@api_router.post("/live/sessions", response_model=LiveSession)
async def create_live_session(code: str, event_name: str):
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

# ============ ADMIN ENDPOINTS ============
@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, event_data: EventCreate):
    result = await db.events.update_one(
        {"id": event_id},
        {"$set": event_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated successfully", "id": event_id}

# Live session management for admin
@api_router.post("/live/sessions/create")
async def admin_create_live_session(code: str, event_name: str):
    # Check if code already exists
    existing = await db.live_sessions.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Code already exists")
    
    session = LiveSession(code=code, event_name=event_name)
    doc = session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.live_sessions.insert_one(doc)
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

@api_router.get("/live/sessions/all")
async def get_all_live_sessions():
    """Get all sessions (active and inactive) for admin"""
    sessions = await db.live_sessions.find({}, {"_id": 0}).to_list(100)
    return sessions

# Seed initial events
@api_router.post("/seed-events")
async def seed_events():
    initial_events = [
        {
            "id": str(uuid.uuid4()),
            "name": "Paula",
            "date": "2025-01-15",
            "time": "18:00",
            "description": "Evento especial de Paula",
            "fotoshare_url": "https://fotoshare.co/e/-AUAT_kcGz8xs9NmSU1gz",
            "thumbnail": "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
            "location": "Ciudad de México",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fernanda",
            "date": "2025-01-20",
            "time": "19:00",
            "description": "Celebración de Fernanda",
            "fotoshare_url": "https://fotoshare.co/e/LuUlUt1awwHl_k0fD7K2M",
            "thumbnail": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
            "location": "Monterrey",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Resideo",
            "date": "2025-01-25",
            "time": "17:00",
            "description": "Evento corporativo Resideo",
            "fotoshare_url": "https://fotoshare.co/e/E8uvCS1AtuKMxXiOYUL1M",
            "thumbnail": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
            "location": "Guadalajara",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Clear existing and insert new
    await db.events.delete_many({})
    await db.events.insert_many(initial_events)
    
    # Set default preferences with net price enabled
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
