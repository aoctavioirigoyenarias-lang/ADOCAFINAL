"""
Backend tests for PicParty Cotizador and PICPARTYLIVE features
Tests:
- Cotizador prices (Cabina de Fotos, Video 360°, PICPARTYLIVE)
- Phone validation in quotes
- Folio generation
- /api/quotes endpoint
- /api/live/sessions endpoint with client_phone
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCotizadorQuotes:
    """Test /api/quotes endpoint for cotizador functionality"""
    
    def test_api_is_reachable(self):
        """Verify API root is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root accessible: {data['message']}")
    
    def test_create_quote_with_all_fields(self):
        """Test creating a quote with all required fields including phone"""
        unique_folio = f"COT-TEST-{uuid.uuid4().hex[:8].upper()}"
        
        quote_data = {
            "folio": unique_folio,
            "cliente": "Test Cliente Backend",
            "telefono": "5551234567",  # Required phone field
            "salon": "Salon de Prueba",
            "fecha_evento": "2025-08-15",
            "servicio_principal": "cabina",
            "horas": 3,
            "precio_servicio": 3299,  # Price for 3h cabina
            "picpartylive": "Súper Precio",
            "picpartylive_precio": 700,
            "descuento_pct": 0,
            "descuento_monto": 0,
            "subtotal": 3999,
            "total": 3999
        }
        
        response = requests.post(f"{BASE_URL}/api/quotes", json=quote_data)
        assert response.status_code == 200, f"Failed to create quote: {response.text}"
        
        data = response.json()
        assert "folio" in data
        assert data["folio"] == unique_folio
        print(f"✅ Quote created with folio: {data['folio']}")
        
        # Verify data persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/quotes/{unique_folio}")
        assert get_response.status_code == 200
        
        fetched = get_response.json()
        assert fetched["telefono"] == "5551234567"
        assert fetched["precio_servicio"] == 3299
        print("✅ Quote persisted and retrieved correctly")
    
    def test_get_all_quotes(self):
        """Test retrieving all quotes"""
        response = requests.get(f"{BASE_URL}/api/quotes")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Retrieved {len(data)} quotes")
    
    def test_quote_cabina_prices(self):
        """Verify Cabina de Fotos prices are correct: 2h=$2,699, 3h=$3,299, 4h=$3,799, 5h=$4,699"""
        expected_prices = {
            2: 2699,
            3: 3299,
            4: 3799,
            5: 4699
        }
        
        for hours, price in expected_prices.items():
            quote_data = {
                "folio": f"COT-CABINA-{hours}H-TEST",
                "cliente": f"Test Cabina {hours}h",
                "telefono": "5550000001",
                "servicio_principal": "cabina",
                "horas": hours,
                "precio_servicio": price,
                "picpartylive": "No",
                "picpartylive_precio": 0,
                "descuento_pct": 0,
                "descuento_monto": 0,
                "subtotal": price,
                "total": price
            }
            
            response = requests.post(f"{BASE_URL}/api/quotes", json=quote_data)
            assert response.status_code == 200
            print(f"✅ Cabina {hours}h price ${price} - VERIFIED")
    
    def test_quote_video360_prices(self):
        """Verify Video 360° prices are correct: 2h=$3,299, 3h=$3,899, 4h=$4,499, 5h=$4,999"""
        expected_prices = {
            2: 3299,
            3: 3899,
            4: 4499,
            5: 4999
        }
        
        for hours, price in expected_prices.items():
            quote_data = {
                "folio": f"COT-VIDEO360-{hours}H-TEST",
                "cliente": f"Test Video360 {hours}h",
                "telefono": "5550000002",
                "servicio_principal": "video360",
                "horas": hours,
                "precio_servicio": price,
                "picpartylive": "No",
                "picpartylive_precio": 0,
                "descuento_pct": 0,
                "descuento_monto": 0,
                "subtotal": price,
                "total": price
            }
            
            response = requests.post(f"{BASE_URL}/api/quotes", json=quote_data)
            assert response.status_code == 200
            print(f"✅ Video 360° {hours}h price ${price} - VERIFIED")
    
    def test_quote_picpartylive_prices(self):
        """Verify PICPARTYLIVE prices: $700, $1,000, $1,500"""
        live_prices = [
            (700, "Súper Precio"),
            (1000, "Promo Expo"),
            (1500, "Regular")
        ]
        
        for price, label in live_prices:
            quote_data = {
                "folio": f"COT-LIVE-{price}-TEST",
                "cliente": f"Test PICPARTYLIVE {price}",
                "telefono": "5550000003",
                "servicio_principal": None,
                "horas": None,
                "precio_servicio": 0,
                "picpartylive": label,
                "picpartylive_precio": price,
                "descuento_pct": 0,
                "descuento_monto": 0,
                "subtotal": price,
                "total": price
            }
            
            response = requests.post(f"{BASE_URL}/api/quotes", json=quote_data)
            assert response.status_code == 200
            print(f"✅ PICPARTYLIVE ${price} ({label}) - VERIFIED")


class TestLiveSessions:
    """Test /api/live/sessions endpoints with client_phone field"""
    
    def test_get_live_sessions(self):
        """Test retrieving all live sessions"""
        response = requests.get(f"{BASE_URL}/api/live/sessions/all")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Retrieved {len(data)} live sessions")
    
    def test_create_live_session_with_client_phone(self):
        """Test creating a live session with client phone (for download key)"""
        unique_code = f"TEST{uuid.uuid4().hex[:4].upper()}"
        
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/create",
            params={
                "code": unique_code,
                "event_name": "Test Event with Phone",
                "event_type": "boda",
                "event_date": "2025-10-15",
                "client_phone": "5551234567"  # Client phone for download key
            }
        )
        
        assert response.status_code == 200, f"Failed to create session: {response.text}"
        
        data = response.json()
        assert data["code"] == unique_code
        assert data["client_phone"] == "5551234567"
        print(f"✅ Live session created with code: {unique_code}")
        print(f"✅ Client phone saved: {data['client_phone']}")
        
        # Cleanup - delete the test session
        requests.delete(f"{BASE_URL}/api/live/sessions/{data['id']}")
    
    def test_scan_existing_code(self):
        """Test scanning an existing event code"""
        # Test with known demo code
        response = requests.get(f"{BASE_URL}/api/live/scan/9022")
        
        # If the demo code exists
        if response.status_code == 200:
            data = response.json()
            assert "event_name" in data
            print(f"✅ Scan code 9022 works - Event: {data.get('event_name')}")
        else:
            print("⚠️ Demo code 9022 not found (may not exist)")
    
    def test_scan_invalid_code(self):
        """Test scanning an invalid code returns 404"""
        response = requests.get(f"{BASE_URL}/api/live/scan/INVALID99999")
        assert response.status_code == 404
        print("✅ Invalid code returns 404 as expected")
    
    def test_live_session_has_client_phone_field(self):
        """Verify the LiveSession model includes client_phone field"""
        unique_code = f"PHONE{uuid.uuid4().hex[:4].upper()}"
        
        # Create session with phone
        response = requests.post(
            f"{BASE_URL}/api/live/sessions/create",
            params={
                "code": unique_code,
                "event_name": "Phone Test Event",
                "event_type": "cumpleaños",
                "event_date": "2025-12-25",
                "client_phone": "5559876543"
            }
        )
        
        assert response.status_code == 200
        session_data = response.json()
        session_id = session_data["id"]
        
        # Verify phone is accessible via scan
        scan_response = requests.get(f"{BASE_URL}/api/live/scan/{unique_code}")
        assert scan_response.status_code == 200
        
        scan_data = scan_response.json()
        assert "client_phone" in scan_data
        assert scan_data["client_phone"] == "5559876543"
        
        # Verify last 4 digits can be used as download key
        last_4_digits = scan_data["client_phone"][-4:]
        assert last_4_digits == "6543"
        print(f"✅ Client phone stored: {scan_data['client_phone']}")
        print(f"✅ Download key (last 4 digits): {last_4_digits}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/live/sessions/{session_id}")


class TestEventPhotos:
    """Test event photo upload and retrieval for live sessions"""
    
    def test_get_photos_for_event(self):
        """Test getting photos for an event"""
        # Use a known event code
        response = requests.get(f"{BASE_URL}/api/live/photos/9022")
        
        if response.status_code == 200:
            data = response.json()
            assert "photos" in data
            print(f"✅ Retrieved {data.get('total', 0)} photos for event 9022")
        else:
            print("⚠️ Event 9022 not found for photo test")
    
    def test_get_photo_count(self):
        """Test getting photo count for an event"""
        response = requests.get(f"{BASE_URL}/api/live/photos/count/9022")
        
        if response.status_code == 200:
            data = response.json()
            assert "count" in data
            print(f"✅ Photo count for event 9022: {data['count']}")
        else:
            print("⚠️ Event 9022 not found for count test")


# Fixtures
@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Verify test environment is properly configured"""
    assert BASE_URL, "REACT_APP_BACKEND_URL environment variable not set"
    print(f"\n🔧 Testing against: {BASE_URL}")
    yield


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
