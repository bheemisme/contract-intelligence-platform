"""FastAPI routes for user authentication and management."""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from pydantic import BaseModel
from api.utils import (
    get_firestore,
    handle_exceptions,
    validate_session,
    verify_google_id_token,
)
from user import dal as user_dal, schemas as user_schemas
from sessions import dal as session_dal, schemas as session_schemas
from datetime import datetime, timedelta, timezone
from google.cloud import firestore

import logging
import os
import asyncio


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user")


class SigninInput(BaseModel):
    """Request model for signin endpoint."""

    token: str


@router.post("/signin")
@handle_exceptions
async def signin(
    input: SigninInput,
    response: Response,
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
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
    logger.debug(f"Starting signin process")
    logger.debug(f"Session ID from cookie: {session_id}")
    # Check if there's an active session cookie
    if session_id:
        session = await asyncio.to_thread(
            session_dal.get_session, db_client, session_id
        )
        if session and datetime.now(timezone.utc) < session.expires_at:

            user = await asyncio.to_thread(
                user_dal.get_user, db_client, session.user_id
            )

            if not user:
                raise HTTPException(
                    status_code=404, detail="User not found for the session"
                )
            return user

    logger.debug("No valid session found, verifying token")

    token = input.token
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

    logger.debug(f"Creating session for user_id: {user_id}")
    session_expiry = datetime.now(timezone.utc) + timedelta(hours=5)  # 5 hour session
    new_session = session_schemas.Session(user_id=user_id, expires_at=session_expiry)

    logger.debug("Saving session to database")
    session_id = await asyncio.to_thread(
        session_dal.write_session, db_client, new_session
    )

    logger.debug("Setting session cookie in response")
    response.set_cookie(
        key="session_id",
        value=str(new_session.session_id),
        expires=session_expiry,
        httponly=True,
        secure=True,  # Use HTTPS in production
        samesite="none",
    )
    return user_schemas.User(username=username, email=email)


@router.get("/get_user")
@handle_exceptions
async def get_user(
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    
) -> dict:
    """
    Authenticates a user with an OIDC token.

    Args:
        request (SigninRequest): The signin request containing the OIDC token.

    Returns:
        SigninResponse: The authentication result.

    Raises:
        HTTPException: If authentication fails.
    """

    logger.debug(f"user session validated for fetching user info")
    # session = request.state.session

    user = await asyncio.to_thread(user_dal.get_user, db_client, session.user_id)  # type: ignore
    if not user:
        raise HTTPException(
            status_code=401,
            detail="no user is associated with this session: unauthorized user",
        )

    logger.debug(f"user fetched: {user.email}")

    return {"username": user.username, "email": user.email}


@router.post("/logout")
@handle_exceptions
async def logout_user(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
):

    logger.debug(f"user session validated for logout")

    is_deleted = await asyncio.to_thread(
        session_dal.delete_session, db_client, str(session.session_id)
    )

    return is_deleted


if __name__ == "__main__":

    print(get_user.__annotations__)
    print(signin.__annotations__)
