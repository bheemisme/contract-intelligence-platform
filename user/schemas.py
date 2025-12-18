"""Pydantic schemas for user management."""

from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
import uuid


class User(BaseModel):
    """User schema containing basic user information."""

    model_config = ConfigDict(extra="forbid")

    username: str = Field(..., description="The username of the user.")
    email: EmailStr = Field(..., description="The email address of the user. This is the unique identifier for the user.")