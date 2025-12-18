from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import wraps

import os


def verify_google_id_token(token: str, client_id: str):
    request = requests.Request()

    claims = id_token.verify_oauth2_token(token, request, audience=client_id)

    # issuer check (extra safety)
    if claims["iss"] not in (
        "accounts.google.com",
        "https://accounts.google.com",
    ):
        raise ValueError("Wrong issuer")

    profile = {
        "google_sub": claims["sub"],  # stable user ID
        "email": claims.get("email"),
        "email_verified": claims.get("email_verified"),
        "name": claims.get("name"),
        "given_name": claims.get("given_name"),
        "family_name": claims.get("family_name"),
        "picture": claims.get("picture"),
        "locale": claims.get("locale"),
    }
    return profile


# Authentication middleware
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    FastAPI dependency that extracts and verifies the Google ID token from Authorization header.

    Args:
        credentials: The HTTP Authorization credentials containing the Bearer token

    Returns:
        dict: The verified user profile from Google

    Raises:
        HTTPException: If token is invalid or missing
    """
    try:
        token = credentials.credentials

        if not token:
            raise HTTPException(status_code=401, detail="Token missing")

        # Get Google client ID from environment
        client_id = os.getenv("VITE_GOOGLE_AUTH_CLIENT_ID")
        if not client_id:
            raise HTTPException(status_code=500, detail="Google client ID not configured")

        # Verify the token
        user_profile = verify_google_id_token(token, client_id)

        return user_profile

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def route_middleware():
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract Request safely
            request: Request | None = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if request is None:
                raise RuntimeError("Request object not found")

            # ---- middleware logic ----
            token = request.headers.get("x-token")
            if token != "secret":
                raise HTTPException(status_code=401, detail="Unauthorized")

            # Call actual route handler
            return await func(*args, **kwargs)

        return wrapper
    return decorator
