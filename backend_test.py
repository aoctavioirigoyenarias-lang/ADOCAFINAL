#!/usr/bin/env python3
"""
Backend API Testing for adoca.net
Tests all endpoints required for the photo gallery event app
"""

import requests
import sys
import json
from datetime import datetime

class AdocaAPITester:
    def __init__(self, base_url):
        # Use the public endpoint from frontend .env
        self.base_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, validate_fn=None):
        """Run a single API test with optional validation"""
        url = f"{self.base_url}/{endpoint}" if endpoint else f"{self.base_url}/"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            print(f"   URL: {url}")
            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                print(f"   Response: {response.text[:200]}...")

            # Custom validation if provided
            if success and validate_fn:
                validation_result = validate_fn(response_data)
                if not validation_result:
                    success = False
                    print(f"   ❌ Validation failed")

            if success:
                self.tests_passed += 1
                print(f"   ✅ Passed")
            else:
                print(f"   ❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })

            return success, response_data

        except Exception as e:
            print(f"   ❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "name": name,
                "error": str(e)
            })
            return False, {}

    def validate_events_response(self, data):
        """Validate the events response contains required fields and URLs"""
        if not isinstance(data, list):
            print("   Validation: Events should be a list")
            return False
        
        if len(data) != 3:
            print(f"   Validation: Expected 3 events, got {len(data)}")
            return False
            
        required_names = ["PAULA", "FERNANDA", "RESIDEO"]
        expected_urls = {
            "Paula": "https://fotoshare.co/e/-AUAT_kcGz8xs9NmSU1gz",
            "Fernanda": "https://fotoshare.co/e/LuUlUt1awwHl_k0fD7K2M", 
            "Resideo": "https://fotoshare.co/e/E8uvCS1AtuKMxXiOYUL1M"
        }
        
        found_names = [event.get('name') for event in data]
        for name in required_names:
            if name not in found_names:
                print(f"   Validation: Missing event '{name}'")
                return False
                
        # Validate fotoshare URLs
        for event in data:
            name = event.get('name')
            if name in expected_urls:
                actual_url = event.get('fotoshare_url')
                expected_url = expected_urls[name]
                if actual_url != expected_url:
                    print(f"   Validation: Wrong URL for {name}. Expected: {expected_url}, Got: {actual_url}")
                    return False
                    
        print("   Validation: All events have correct names and fotoshare URLs")
        return True

    def validate_preferences_response(self, data):
        """Validate preferences response has show_net_price enabled"""
        if not isinstance(data, dict):
            print("   Validation: Preferences should be a dict")
            return False
            
        show_net_price = data.get('show_net_price')
        if show_net_price != True:
            print(f"   Validation: show_net_price should be True, got {show_net_price}")
            return False
            
        print("   Validation: show_net_price is enabled correctly")
        return True

    def test_basic_endpoints(self):
        """Test basic API functionality"""
        print("=" * 50)
        print("TESTING BASIC API ENDPOINTS")
        print("=" * 50)
        
        # Test API root
        self.run_test("API Root", "GET", "", 200)
        
        # Test seed events first (to ensure data exists)
        self.run_test("Seed Events", "POST", "seed-events", 200)
        
        return True

    def test_events_api(self):
        """Test events-related endpoints"""
        print("=" * 50) 
        print("TESTING EVENTS API")
        print("=" * 50)
        
        # Test get all events with validation
        self.run_test(
            "Get All Events", 
            "GET", 
            "events", 
            200,
            validate_fn=self.validate_events_response
        )
        
        # Test individual event endpoints by getting events first
        success, events_data = self.run_test("Get Events for Individual Testing", "GET", "events", 200)
        
        if success and events_data:
            # Test getting individual events
            for event in events_data[:2]:  # Test first 2 events
                event_id = event.get('id')
                if event_id:
                    self.run_test(f"Get Event {event.get('name')}", "GET", f"events/{event_id}", 200)

    def test_preferences_api(self):
        """Test user preferences API"""
        print("=" * 50)
        print("TESTING PREFERENCES API")
        print("=" * 50)
        
        # Test get preferences
        self.run_test(
            "Get Preferences", 
            "GET", 
            "preferences", 
            200,
            validate_fn=self.validate_preferences_response
        )
        
        # Test update preferences
        self.run_test(
            "Update Preferences", 
            "PUT", 
            "preferences?show_net_price=true&tax_rate=0.16", 
            200
        )

    def test_quote_api(self):
        """Test quote calculation API"""
        print("=" * 50)
        print("TESTING QUOTE CALCULATION")
        print("=" * 50)
        
        quote_data = {
            "base_price": 1000.0,
            "hours": 2,
            "extras": ["backdrop", "props"]
        }
        
        success, response = self.run_test("Calculate Quote", "POST", "quote", 200, data=quote_data)
        
        if success and response:
            # Validate quote response structure
            required_fields = ["base_price", "subtotal", "tax", "total", "net_price", "show_net_price"]
            for field in required_fields:
                if field not in response:
                    print(f"   Validation: Missing field '{field}' in quote response")
                    return False
            print("   Validation: Quote response has all required fields")

    def test_live_session_api(self):
        """Test live session endpoints"""
        print("=" * 50)
        print("TESTING LIVE SESSION API")
        print("=" * 50)
        
        # Test get live sessions
        self.run_test("Get Live Sessions", "GET", "live/sessions", 200)
        
        # Test create live session
        success, session_data = self.run_test(
            "Create Live Session", 
            "POST", 
            "live/sessions?code=TEST123&event_name=Test Event", 
            200
        )
        
        if success and session_data:
            # Test scan the created session
            self.run_test("Scan Live Code", "GET", "live/scan/TEST123", 200)
        
        # Test scan invalid code
        self.run_test("Scan Invalid Code", "GET", "live/scan/INVALID", 404)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.failed_tests:
            print("\nFAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test.get('name')}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                else:
                    print(f"   Expected: {test.get('expected')}, Got: {test.get('actual')}")
        
        print("=" * 60)
        return self.tests_passed == self.tests_run


def main():
    # Get backend URL from environment
    backend_url = "https://net-price-quotes.preview.emergentagent.com"
    
    print("🚀 Starting adoca.net Backend API Tests")
    print(f"Backend URL: {backend_url}")
    print(f"Test started at: {datetime.now()}")
    
    tester = AdocaAPITester(backend_url)
    
    try:
        # Run all test suites
        tester.test_basic_endpoints()
        tester.test_events_api()
        tester.test_preferences_api()
        tester.test_quote_api()
        tester.test_live_session_api()
        
        # Print summary
        all_passed = tester.print_summary()
        return 0 if all_passed else 1
        
    except Exception as e:
        print(f"\n❌ Critical error during testing: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())