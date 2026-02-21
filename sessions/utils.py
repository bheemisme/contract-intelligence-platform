import secrets
import base64

def generate_csrf_token():
    # 32 bytes = 256 bits of entropy
    raw_bytes = secrets.token_bytes(32)
    # Base64 for safe transmission in forms/headers
    return base64.urlsafe_b64encode(raw_bytes).decode('utf-8').rstrip('=')