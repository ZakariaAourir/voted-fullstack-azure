"""
Comprehensive test of all backend endpoints
"""
import httpx
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    print_section("TEST 1: Health Check")
    response = httpx.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("PASSED!")
    return True

def test_register():
    print_section("TEST 2: User Registration")
    data = {
        "name": "Test User",
        "email": "testuser123@example.com",
        "password": "testpass123"
    }
    response = httpx.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 201
    token = response.json()['access_token']
    print("PASSED!")
    return token

def test_login():
    print_section("TEST 3: User Login")
    data = {
        "email": "testuser123@example.com",
        "password": "testpass123"
    }
    response = httpx.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    token = response.json()['access_token']
    print("PASSED!")
    return token

def test_get_me(token):
    print_section("TEST 4: Get Current User")
    headers = {"Authorization": f"Bearer {token}"}
    response = httpx.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("PASSED!")
    return response.json()

def test_create_poll(token):
    print_section("TEST 5: Create Poll")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "What's your favorite programming language?",
        "description": "Choose your favorite language for web development",
        "options": ["Python", "JavaScript", "TypeScript", "Go", "Rust"]
    }
    response = httpx.post(f"{BASE_URL}/polls", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 201
    poll_id = response.json()['id']
    print("PASSED!")
    return poll_id

def test_list_polls():
    print_section("TEST 6: List All Polls")
    response = httpx.get(f"{BASE_URL}/polls")
    print(f"Status: {response.status_code}")
    polls = response.json()
    print(f"Found {len(polls)} polls")
    for poll in polls:
        print(f"  - Poll #{poll['id']}: {poll['title']}")
    assert response.status_code == 200
    print("PASSED!")
    return polls

def test_get_poll(poll_id):
    print_section(f"TEST 7: Get Poll Details (ID: {poll_id})")
    response = httpx.get(f"{BASE_URL}/polls/{poll_id}")
    print(f"Status: {response.status_code}")
    poll = response.json()
    print(f"Poll: {poll['title']}")
    print(f"Options ({len(poll['options'])}):")
    for opt in poll['options']:
        print(f"  - #{opt['id']}: {opt['text']} ({opt['votes_count']} votes)")
    assert response.status_code == 200
    print("PASSED!")
    return poll

def test_vote(poll_id, option_id, token):
    print_section(f"TEST 8: Vote on Poll")
    headers = {"Authorization": f"Bearer {token}"}
    data = {"option_id": option_id}
    response = httpx.post(f"{BASE_URL}/polls/{poll_id}/vote", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("PASSED!")
    return response.json()

def test_poll_results(poll_id):
    print_section(f"TEST 9: Get Poll Results")
    response = httpx.get(f"{BASE_URL}/polls/{poll_id}/results")
    print(f"Status: {response.status_code}")
    results = response.json()
    print(f"Poll: {results['title']}")
    print(f"Total Votes: {results['total_votes']}")
    print("Results:")
    for opt in results['options']:
        print(f"  - {opt['text']}: {opt['votes_count']} votes")
    assert response.status_code == 200
    print("PASSED!")
    return results

def main():
    print("\n" + "#"*60)
    print("#  POLLS VOTING API - COMPREHENSIVE ENDPOINT TESTING")
    print("#"*60)
    
    try:
        # Test 1: Health check
        test_health()
        
        # Test 2: Register
        token = test_register()
        
        # Test 3: Login
        token = test_login()
        
        # Test 4: Get current user
        user = test_get_me(token)
        
        # Test 5: Create poll
        poll_id = test_create_poll(token)
        
        # Test 6: List polls
        polls = test_list_polls()
        
        # Test 7: Get poll details
        poll = test_get_poll(poll_id)
        
        # Test 8: Vote on poll
        if poll['options']:
            option_id = poll['options'][0]['id']
            test_vote(poll_id, option_id, token)
        
        # Test 9: Get poll results
        test_poll_results(poll_id)
        
        print("\n" + "#"*60)
        print("#  ALL TESTS PASSED!")
        print("#"*60)
        print("\nSummary:")
        print("  - Authentication: WORKING")
        print("  - User Management: WORKING")
        print("  - Poll Creation: WORKING")
        print("  - Voting: WORKING")
        print("  - Results: WORKING")
        print("\n  Backend is fully functional!")
        
    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


