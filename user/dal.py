"""Data Access Layer methods for users"""

from typing import Optional
from google.cloud.firestore import Client
from user.schemas import User


def add_user(db: Client, user: User) -> str:
    """
    Add a user to the users collection in Firestore.

    Args:
        db: Firestore client instance
        user: User object to add

    Returns:
        str: The document ID of the created user
    """
    doc_ref = db.collection("users").document(str(user.email))
    doc_ref.set(user.model_dump(mode="json"))
    return doc_ref.id


def get_user(db: Client, email: str) -> Optional[User]:
    """
    Get a user from the users collection by user ID.

    Args:
        db: Firestore client instance
        email: The email ID to retrieve

    Returns:
        Optional[User]: The user object if found, None otherwise
    """
    doc_ref = db.collection("users").document(email)
    doc = doc_ref.get()

    if not doc.exists:
        return None

    return User(**doc.to_dict()) # type: ignore


def delete_user(db: Client, user_id: str) -> bool:
    """
    Delete a user from the users collection by user ID.

    Args:
        db: Firestore client instance
        user_id: The user ID to delete

    Returns:
        bool: True if the user was deleted, False if the user was not found
    """
    doc_ref = db.collection("users").document(user_id)
    doc = doc_ref.get()

    if not doc.exists:
        return False

    doc_ref.delete()
    return True


if __name__ == "__main__":
    from database import db
    from dotenv import load_dotenv

    load_dotenv()

    # Example usage
    firestore_client = db.get_firestore_connection()

    # Create a test user
    test_user = User(username="testuser", email="test@example.com")
    user_id = add_user(firestore_client, test_user)
    print(f"Created user with ID: {user_id}")

    # Get the user back
    retrieved_user = get_user(firestore_client, str(test_user.email))
    print(f"Retrieved user: {retrieved_user}")

    # Clean up - delete the test user
    deleted = delete_user(firestore_client, str(test_user.email))
    print(f"User deleted: {deleted}")