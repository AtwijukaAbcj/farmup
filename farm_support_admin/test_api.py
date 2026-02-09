"""
Farm Support API Test Script
This script tests the basic functionality of the Django REST API
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("🌾 Farm Support API Test")
    print("=" * 50)
    
    # Test 1: Home endpoint
    print("\n1. Testing Home Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Home endpoint working")
            print(f"   Response: {response.json()['message']}")
        else:
            print(f"❌ Home endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False
    
    # Test 2: Admin login
    print("\n2. Testing Admin Login...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        if response.status_code == 200:
            print("✅ Admin login successful")
            data = response.json()
            access_token = data['tokens']['access']
            print(f"   Access token received: {access_token[:50]}...")
            
            # Test 3: Get profile with token
            print("\n3. Testing Authenticated Profile Access...")
            headers = {"Authorization": f"Bearer {access_token}"}
            profile_response = requests.get(f"{BASE_URL}/api/auth/profile/", headers=headers)
            
            if profile_response.status_code == 200:
                print("✅ Profile access successful")
                profile_data = profile_response.json()
                print(f"   User: {profile_data['username']} ({profile_data['role']})")
            else:
                print(f"❌ Profile access failed: {profile_response.status_code}")
                
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"   Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Login test error: {e}")
    
    # Test 4: Farmers endpoint (requires authentication)
    print("\n4. Testing Farmers Endpoint...")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{BASE_URL}/api/farmers/", headers=headers)
        if response.status_code == 200:
            print("✅ Farmers endpoint accessible")
            data = response.json()
            print(f"   Total farmers: {data.get('count', 0)}")
        else:
            print(f"❌ Farmers endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Farmers test error: {e}")
    
    # Test 5: Loans endpoint
    print("\n5. Testing Loans Endpoint...")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{BASE_URL}/api/loans/", headers=headers)
        if response.status_code == 200:
            print("✅ Loans endpoint accessible")
            data = response.json()
            print(f"   Total loans: {data.get('count', 0)}")
        else:
            print(f"❌ Loans endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Loans test error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Test Complete!")
    print("\nNext steps:")
    print("- Visit http://127.0.0.1:8000/admin/ to access Django admin")
    print("- Use the API endpoints in your React application")
    print("- Add more farmers, loans, and test the full functionality")

if __name__ == "__main__":
    test_api()