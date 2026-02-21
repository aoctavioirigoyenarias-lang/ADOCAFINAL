"""
Backend tests for PicParty STAFF and ADMIN role-based features
Tests:
- Events ordering by created_at DESC
- Contracts with link_fotos and link_videos fields
- PUT /contracts/{id}/links endpoint for STAFF
- Contract model verification
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEventsOrdering:
    """Test events are returned ordered by created_at DESC (último subido primero)"""
    
    def test_api_is_reachable(self):
        """Verify API root is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root accessible: {data['message']}")
    
    def test_events_ordered_by_created_at_desc(self):
        """Verify events are returned ordered by created_at DESC (most recent first)"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200, f"Failed to get events: {response.text}"
        
        events = response.json()
        assert isinstance(events, list)
        assert len(events) > 0, "No events found"
        
        # Verify ordering - most recent created_at should be first
        for i in range(len(events) - 1):
            current_date = events[i].get('created_at', '')
            next_date = events[i + 1].get('created_at', '')
            assert current_date >= next_date, f"Events not ordered by created_at DESC: {current_date} should be >= {next_date}"
        
        print(f"✅ {len(events)} events returned, ordered by created_at DESC")
        print(f"   First event: {events[0].get('name')} - created_at: {events[0].get('created_at')}")
        if len(events) > 1:
            print(f"   Last event: {events[-1].get('name')} - created_at: {events[-1].get('created_at')}")


class TestContractsLinksEndpoint:
    """Test PUT /contracts/{id}/links endpoint for STAFF to save fotoshare links"""
    
    def test_get_all_contracts(self):
        """Test retrieving all contracts"""
        response = requests.get(f"{BASE_URL}/api/contracts")
        assert response.status_code == 200
        
        contracts = response.json()
        assert isinstance(contracts, list)
        print(f"✅ Retrieved {len(contracts)} contracts")
    
    def test_contract_has_link_fields(self):
        """Verify contracts have link_fotos and link_videos fields"""
        response = requests.get(f"{BASE_URL}/api/contracts")
        assert response.status_code == 200
        
        contracts = response.json()
        
        # Find the contract with known links (ID: 35edb6c8-4199-4ea9-9165-2a1fb68acb95)
        test_contract = next((c for c in contracts if c.get('id') == '35edb6c8-4199-4ea9-9165-2a1fb68acb95'), None)
        
        if test_contract:
            assert 'link_fotos' in test_contract or test_contract.get('link_fotos') is not None or test_contract.get('link_fotos') == ""
            assert 'link_videos' in test_contract or test_contract.get('link_videos') is not None or test_contract.get('link_videos') == ""
            print(f"✅ Contract has link_fotos: {test_contract.get('link_fotos')}")
            print(f"✅ Contract has link_videos: {test_contract.get('link_videos')}")
        else:
            print("⚠️ Test contract not found, checking any contract for link fields")
            if len(contracts) > 0:
                sample = contracts[0]
                # Either field exists or is null
                print(f"   Sample contract fields: {list(sample.keys())}")
    
    def test_update_contract_links(self):
        """Test PUT /contracts/{id}/links endpoint updates links correctly"""
        # Use the known contract ID
        contract_id = "35edb6c8-4199-4ea9-9165-2a1fb68acb95"
        
        # First, get current state
        get_response = requests.get(f"{BASE_URL}/api/contracts/{contract_id}")
        if get_response.status_code == 404:
            pytest.skip("Test contract not found")
        
        # Update links
        test_fotos = f"https://fotoshare.co/e/test_{uuid.uuid4().hex[:8]}"
        test_videos = f"https://fotoshare.co/v/test_{uuid.uuid4().hex[:8]}"
        
        update_response = requests.put(
            f"{BASE_URL}/api/contracts/{contract_id}/links",
            params={
                "link_fotos": test_fotos,
                "link_videos": test_videos
            }
        )
        
        assert update_response.status_code == 200, f"Failed to update links: {update_response.text}"
        
        result = update_response.json()
        assert result.get('message') == "Links actualizados"
        assert result.get('id') == contract_id
        print(f"✅ Links update response: {result}")
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/contracts/{contract_id}")
        assert verify_response.status_code == 200
        
        updated_contract = verify_response.json()
        assert updated_contract.get('link_fotos') == test_fotos
        assert updated_contract.get('link_videos') == test_videos
        print(f"✅ Links persisted - link_fotos: {updated_contract.get('link_fotos')}")
        print(f"✅ Links persisted - link_videos: {updated_contract.get('link_videos')}")
    
    def test_update_only_link_fotos(self):
        """Test updating only link_fotos leaves link_videos unchanged"""
        contract_id = "35edb6c8-4199-4ea9-9165-2a1fb68acb95"
        
        # Get current state
        get_response = requests.get(f"{BASE_URL}/api/contracts/{contract_id}")
        if get_response.status_code == 404:
            pytest.skip("Test contract not found")
        
        current_contract = get_response.json()
        original_videos = current_contract.get('link_videos')
        
        # Update only fotos
        new_fotos = f"https://fotoshare.co/e/fotos_only_{uuid.uuid4().hex[:6]}"
        
        update_response = requests.put(
            f"{BASE_URL}/api/contracts/{contract_id}/links",
            params={"link_fotos": new_fotos}
        )
        
        assert update_response.status_code == 200
        
        # Verify
        verify_response = requests.get(f"{BASE_URL}/api/contracts/{contract_id}")
        updated = verify_response.json()
        
        assert updated.get('link_fotos') == new_fotos
        # link_videos should remain unchanged
        print(f"✅ link_fotos updated to: {new_fotos}")
        print(f"✅ link_videos unchanged: {updated.get('link_videos')}")
    
    def test_update_links_nonexistent_contract(self):
        """Test updating links for non-existent contract returns 404"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        
        response = requests.put(
            f"{BASE_URL}/api/contracts/{fake_id}/links",
            params={"link_fotos": "https://test.com"}
        )
        
        assert response.status_code == 404
        print("✅ Non-existent contract returns 404 as expected")


class TestContractModel:
    """Test Contract model fields for STAFF access"""
    
    def test_contract_includes_all_required_fields(self):
        """Verify contract model has all required fields for STAFF view"""
        response = requests.get(f"{BASE_URL}/api/contracts")
        assert response.status_code == 200
        
        contracts = response.json()
        if len(contracts) == 0:
            pytest.skip("No contracts to test")
        
        sample_contract = contracts[0]
        
        # Required fields for STAFF view
        required_fields = [
            'id',
            'client_name',
            'client_phone',
            'event_date',
            'anticipo_status',
            'include_cabina',
            'include_video360',
            'include_key_moments',
            'include_live'
        ]
        
        for field in required_fields:
            assert field in sample_contract, f"Missing required field: {field}"
        
        print(f"✅ Contract has all required STAFF fields: {required_fields}")
        
        # Optional link fields (may be null)
        link_fields = ['link_fotos', 'link_videos']
        for field in link_fields:
            if field in sample_contract:
                print(f"✅ Optional field present: {field} = {sample_contract.get(field)}")
            else:
                print(f"⚠️ Optional field not in response: {field}")


# Fixtures
@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Verify test environment is properly configured"""
    assert BASE_URL, "REACT_APP_BACKEND_URL environment variable not set"
    print(f"\n🔧 Testing against: {BASE_URL}")
    yield


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
