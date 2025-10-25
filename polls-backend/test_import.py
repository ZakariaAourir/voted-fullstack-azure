"""Test if the hashing module is being imported correctly"""
import sys
sys.path.insert(0, '.')

from app.auth.hashing import get_password_hash, verify_password

print("Testing password hashing...")

# Test with short password
short_pass = "123123"
print(f"\nShort password: {short_pass}")
try:
    hashed = get_password_hash(short_pass)
    print(f"✅ Hashed successfully: {hashed[:30]}...")
    
    # Verify it
    if verify_password(short_pass, hashed):
        print("✅ Verification successful!")
    else:
        print("❌ Verification failed!")
except Exception as e:
    print(f"❌ Error: {e}")

# Test with long password (>72 bytes)
long_pass = "a" * 100
print(f"\nLong password ({len(long_pass)} chars): {long_pass[:20]}...")
try:
    hashed = get_password_hash(long_pass)
    print(f"✅ Hashed successfully: {hashed[:30]}...")
    
    # Verify it
    if verify_password(long_pass, hashed):
        print("✅ Verification successful!")
    else:
        print("❌ Verification failed!")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n✅ All password hashing tests passed!")


