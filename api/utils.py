from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import Cookie, Depends, HTTPException, Request
from functools import wraps
from datetime import datetime, timezone
from sessions import dal as session_dal
from google.cloud import firestore, storage
from sessions.schemas import Session

import chromadb
import asyncio
import logging

logger = logging.getLogger(__name__)


def get_firestore(request: Request) -> firestore.Client:
    return request.app.state.firestore

def get_bucket(request: Request) -> storage.Bucket:
    return request.app.state.bucket

def get_chromadb(request: Request) -> chromadb.ClientAPI: # type: ignore
    return request.app.state.chromadb


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


async def validate_session(db_client: firestore.Client = Depends(get_firestore), 
                           session_id: Optional[str] = Cookie(None, alias="session_id")) -> Session:
    """
    Validates the session ID and returns the user ID if the session is active.

    Args:
        session_id: The session ID from the cookie

    Returns:
        str: The user ID associated with the session

    Raises:
        HTTPException: If the session is invalid or expired with 401 (Unauthorized) status code
    """
    
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")

    # Check if there's an active session cookie
    session = await asyncio.to_thread(session_dal.get_session, db_client, session_id)

    logger.debug(f"Validating session: {session_id}")

    if not session:
        raise HTTPException(status_code=401, detail="No session found")

    if session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="inactive session")

    return session


def handle_exceptions(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return wrapper
