"""
Test script for all backend endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_register():
    """Test user registration"""
    print("\n=== Testing User Registration ===")
    try:
        data = {
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "testpassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            return response.json().get('access_token')
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_login():
    """Test user login"""
    print("\n=== Testing User Login ===")
    try:
        data = {
            "email": "testuser@example.com",
            "password": "testpassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            return response.json().get('access_token')
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_get_me(token):
    """Test get current user"""
    print("\n=== Testing Get Current User ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_create_poll(token):
    """Test creating a poll"""
    print("\n=== Testing Create Poll ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "title": "What's your favorite programming language?",
            "description": "Choose your favorite language for web development",
            "options": ["Python", "JavaScript", "TypeScript", "Go", "Rust"]
        }
        response = requests.post(f"{BASE_URL}/polls", json=data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            return response.json().get('id')
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_list_polls():
    """Test listing all polls"""
    print("\n=== Testing List Polls ===")
    try:
        response = requests.get(f"{BASE_URL}/polls")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_poll(poll_id):
    """Test getting a specific poll"""
    print(f"\n=== Testing Get Poll (ID: {poll_id}) ===")
    try:
        response = requests.get(f"{BASE_URL}/polls/{poll_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            return response.json().get('options', [])
        return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def test_vote(poll_id, option_id, token):
    """Test voting on a poll"""
    print(f"\n=== Testing Vote on Poll (Poll ID: {poll_id}, Option ID: {option_id}) ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {"option_id": option_id}
        response = requests.post(f"{BASE_URL}/polls/{poll_id}/vote", json=data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_poll_results(poll_id):
    """Test getting poll results"""
    print(f"\n=== Testing Poll Results (ID: {poll_id}) ===")
    try:
        response = requests.get(f"{BASE_URL}/polls/{poll_id}/results")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("=" * 60)
    print("BACKEND API ENDPOINT TESTING")
    print("=" * 60)
    
    # Test health endpoint
    if not test_health():
        print("\n❌ Backend is not running! Please start the backend first.")
        return
    
    print("\n✅ Backend is running!")
    
    # Test registration
    token = test_register()
    if not token:
        # Try login if registration fails (user might already exist)
        token = test_login()
    
    if not token:
        print("\n❌ Authentication failed!")
        return
    
    print(f"\n✅ Authentication successful! Token: {token[:20]}...")
    
    # Test get current user
    test_get_me(token)
    
    # Test create poll
    poll_id = test_create_poll(token)
    
    if poll_id:
        print(f"\n✅ Poll created successfully! ID: {poll_id}")
        
        # Test list polls
        test_list_polls()
        
        # Test get specific poll
        options = test_get_poll(poll_id)
        
        # Test voting
        if options and len(options) > 0:
            option_id = options[0]['id']
            test_vote(poll_id, option_id, token)
        
        # Test poll results
        test_poll_results(poll_id)
    
    print("\n" + "=" * 60)
    print("TESTING COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main()


