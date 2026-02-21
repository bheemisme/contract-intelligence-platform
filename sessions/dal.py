"""Data Access Layer methods for sessions"""

from typing import Optional
from google.cloud.firestore import Client
from sessions.schemas import Session
from datetime import datetime, timezone


def write_session(db: Client, session: Session) -> str:
    """
    Write a session to the sessions collection in Firestore.

    Args:
        db: Firestore client instance
        session: Session object to write

    Returns:
        str: The document ID of the created session
    """
    doc_ref = db.collection("sessions").document(str(session.session_id))
    if doc_ref.get().exists:
        raise ValueError(f"Session with ID {session.session_id} already exists.")

    doc_ref.set(session.model_dump(mode="json"))
    return doc_ref.id


def get_session(db: Client, session_id: str) -> Optional[Session]:
    """
    Read a session from the sessions collection by session ID.

    Args:
        db: Firestore client instance
        session_id: The session ID to retrieve

    Returns:
        Optional[Session]: The session object if found, None otherwise
    """

    doc_ref = db.collection("sessions").document(session_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    return Session(**doc.to_dict())  # type: ignore


def get_active_sessions_by_user(db: Client, user_id: str) -> list[Session]:
    """
    Get all active sessions for a specific user.

    Args:
        db: Firestore client instance
        user_id: The user ID to get sessions for

    Returns:
        list[Session]: List of active sessions for the user
    """
    sessions_ref = db.collection("sessions")
    query = sessions_ref.where("user_id", "==", user_id).where(
        "expires_at", "<", datetime.now(timezone.utc)
    )
    docs = query.stream()

    return [Session(**doc.to_dict()) for doc in docs]  # type: ignore


def delete_session(db: Client, session_id: str):
    """
    Delete a session from the sessions collection by session ID.

    Args:
        db: Firestore client instance
        session_id: The session ID to delete

    """
    doc_ref = db.collection("sessions").document(session_id)
    doc_ref.delete()



if __name__ == "__main__":
    from connectors import firestore_connector
    from dotenv import load_dotenv
    from datetime import datetime, timedelta

    load_dotenv()

    # Example usage
    firestore_client = firestore_connector.get_firestore_connection()

    # Create a test session
    test_session = Session(
        user_id="user123",
        csrf_token="test_csrf_token",
        expires_at=datetime.now() + timedelta(hours=24),  # Expires in 24 hours
    )

    session_id = write_session(firestore_client, test_session)
    print(f"Created session with ID: {session_id}")

    # Get the session back
    retrieved_session = get_session(firestore_client, str(test_session.session_id))
    print(f"Retrieved session: {retrieved_session}")

    # Get active sessions for user
    active_sessions = get_active_sessions_by_user(firestore_client, "user123")
    print(f"Active sessions for user: {len(active_sessions)}")

    # Delete the session
    deleted = delete_session(firestore_client, str(test_session.session_id))
    print(f"Session deleted: {deleted}")
