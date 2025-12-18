"""FastAPI routes for user authentication and management."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Response, Cookie
from pydantic import BaseModel, EmailStr
from api.utils import verify_google_id_token
from user import dal as user_dal, schemas as user_schemas
from sessions import dal as session_dal, schemas as session_schemas
from database import db
import logging
import os
import asyncio
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user")


class SigninRequest(BaseModel):
    """Request model for signin endpoint."""
    token: str


@router.post("/signin")
async def signin(
    request: SigninRequest,
    response: Response,
    session_id: Optional[str] = Cookie(None, alias="session_id"),
) -> user_schemas.User:
    """
    Authenticates a user with an OIDC token and manages sessions.

    Args:
        request (SigninRequest): The signin request containing the OIDC token.
        response (Response): FastAPI response object for setting cookies.
        session_id (Optional[str]): Session ID from cookie.

    Returns:
        SigninResponse: The authentication result.

    Raises:
        HTTPException: If authentication fails.
    """
    try:
        db_client = db.get_firestore_connection()

        # Check if there's an active session cookie
        if session_id:
            session = await asyncio.to_thread(
                session_dal.get_session, db_client, session_id
            )
            if session and session.expires_at > datetime.now(timezone.utc):
                
                user = await asyncio.to_thread(user_dal.get_user, db_client, session.user_id)
                
                if not user:
                    raise HTTPException(status_code=404, detail="User not found for the session")

                return user

        # No valid session, proceed with token verification
        token = request.token
        if not token:
            raise HTTPException(status_code=400, detail="Token is required")

        client_id = os.environ["GOOGLE_AUTH_CLIENT_ID"]
        profile = verify_google_id_token(token, client_id)  # type: ignore

        logger.debug("Validated Token")

        username = profile["name"]
        email = profile["email"]

        # Check if user is already registered
        existing_user = await asyncio.to_thread(user_dal.get_user, db_client, email)

        if existing_user:
            logger.debug("user exists")
            # User exists, create new session
            user_id = str(existing_user.email)  # Using email as user identifier
        else:
            logger.debug("new user")
            # New user, register them
            user = user_schemas.User(username=username, email=email)
            await asyncio.to_thread(user_dal.add_user, db_client, user)
            user_id = email

        # Create new session
        session_expiry = datetime.now(timezone.utc) + timedelta(
            hours=2
        )  # 2 hour session
        new_session = session_schemas.Session(
            user_id=user_id, expires_at=session_expiry
        )

        # Save session to database
        session_id = await asyncio.to_thread(
            session_dal.write_session, db_client, new_session
        )

        # Set session cookie
        response.set_cookie(
            key="session_id",
            value=str(new_session.session_id),
            expires=session_expiry,
            httponly=True,
            secure=True,  # Use HTTPS in production
            samesite="none",
        )

        return user_schemas.User(username=username, email=email)

    except Exception as e:
        logger.error(f"Signin failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/get_user")
async def get_user(
    response: Response, session_id: Optional[str] = Cookie(None, alias="session_id")
) -> user_schemas.User:
    """
    Authenticates a user with an OIDC token.

    Args:
        request (SigninRequest): The signin request containing the OIDC token.

    Returns:
        SigninResponse: The authentication result.

    Raises:
        HTTPException: If authentication fails.
    """
    try:

        if not session_id:
            raise HTTPException(status_code=401, detail="no session id: unauthorized user")

        db_client = db.get_firestore_connection()

        session = await asyncio.to_thread(
            session_dal.get_session, db_client, session_id
        )

        if not session:
            raise HTTPException(
                status_code=403, detail="no sessions exist on this user: unauthorized user"
            )

        if session.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="session is inactive")

        user = await asyncio.to_thread(user_dal.get_user, db_client, session.user_id)

        if not user:
            raise HTTPException(
                status_code=401, detail=f"no user is associated with this session: unauthorized user"
            )

        response.set_cookie(
            key="session_id",
            value=str(session.session_id),
            expires=session.expires_at,
            httponly=True,
            secure=True,  # Use HTTPS in production
            samesite="none",
        )
        return user
    except Exception as e:
        logger.error(f"Signin failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"{e}")


@router.post("/logout")
async def logout_user(session_id: str = Cookie(None, alias="session_id")):
    try:
        db_client = db.get_firestore_connection()
        is_deleted = await asyncio.to_thread(
            session_dal.delete_session, db_client, session_id
        )

        return is_deleted

    except Exception as e:
        logger.debug("logged out")
    
    return False
