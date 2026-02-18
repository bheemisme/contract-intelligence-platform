import os

from google.cloud import secretmanager

def load_params():
    os.environ["GOOGLE_CLOUD_PROJECT"]="contract-intelligence-platform"
    os.environ["GOOGLE_CLOUD_LOCATION"]="asia-south1"
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"]="True"
    os.environ["LANGSMITH_TRACING"]="true"

def get_secret(secret_id: str, version_id: str = "1") -> str:
    client = secretmanager.SecretManagerServiceClient()
    project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
    name = client.secret_version_path(
        project_id, secret_id, version_id
    )
    response = client.access_secret_version(name=name)
    secret_value = response.payload.data.decode("UTF-8")
    return secret_value


def load_secrets(env: str):
    if env == "dev":
        
        secrets = {
            "LANGSMITH_API_KEY": get_secret("LANGSMITH_API_KEY"),
            "LANGSMITH_PROJECT": get_secret("LANGSMITH_PROJECT_DEV"),
            "GOOGLE_AUTH_CLIENT_ID": get_secret("GOOGLE_AUTH_CLIENT_ID"),
            "GOOGLE_CLIENT_SECRET": get_secret("GOOGLE_CLIENT_SECRET"),
            "GOOGLE_CLOUD_BUCKET": get_secret("GOOGLE_CLOUD_BUCKET_DEV"),
            "GOOGLE_CLOUD_FIRESTORE_DATABASE": get_secret("GOOGLE_CLOUD_FIRESTORE_DATABASE_DEV"),
        }
    
    elif env == "prod":
        secrets = {
            "LANGSMITH_API_KEY": get_secret("LANGSMITH_API_KEY"),
            "LANGSMITH_PROJECT": get_secret("LANGSMITH_PROJECT_PROD"),
            "GOOGLE_AUTH_CLIENT_ID": get_secret("GOOGLE_AUTH_CLIENT_ID"),
            "GOOGLE_CLIENT_SECRET": get_secret("GOOGLE_CLIENT_SECRET"),
            "GOOGLE_CLOUD_BUCKET": get_secret("GOOGLE_CLOUD_BUCKET_PROD"),
            "GOOGLE_CLOUD_FIRESTORE_DATABASE": get_secret("GOOGLE_CLOUD_FIRESTORE_DATABASE_PROD"),
        }
        
    for key, value in secrets.items():
        os.environ.setdefault(key, value)


    return secrets

