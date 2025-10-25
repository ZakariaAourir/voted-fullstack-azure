import hashlib
import secrets


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hashed password.
    Format: salt$hash
    """
    try:
        salt, hash_value = hashed_password.split('$')
        password_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
        return password_hash == hash_value
    except:
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password with a random salt.
    Format: salt$hash
    """
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${password_hash}"
