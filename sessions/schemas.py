"""Pydantic schemas for session management."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class Session(BaseModel):
    """Session schema for storing user session information."""

    model_config = ConfigDict(extra="forbid")

    session_id: uuid.UUID = Field(
        default_factory=uuid.uuid4, description="Unique identifier for the session."
    )
    user_id: str = Field(..., description="The user ID associated with this session.")
    csrf_token: str = Field(..., description="CSRF token for the session.")
    created_at: datetime = Field(
        default_factory=lambda _: datetime.now(timezone.utc),
        description="When the session was created.",
    )
    expires_at: datetime = Field(..., description="When the session expires.")
    