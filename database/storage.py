"""Methods to interact with the storage layer"""

from google.cloud import storage
from google.api_core import exceptions
from dotenv import load_dotenv
import os

# upload file to the storage bucket
def get_storage_client():
    storage_client = storage.Client(project=os.environ['GOOGLE_CLOUD_PROJECT'])
    bucket = storage_client.bucket(os.environ['GOOGLE_CLOUD_BUCKET'])
    return bucket

def upload_file(file_path: str, destination_blob_name: str):
    """
    Uploads a file to the 'contracts_pdfs' folder in the Google Cloud Storage bucket.

    Args:
        file_path (str): The path to the file to upload.
    """
    bucket = get_storage_client()
    
    blob = bucket.blob(destination_blob_name)

    try:
        blob.upload_from_filename(file_path)
        print(f"File {file_path} uploaded to {destination_blob_name}.")
    except exceptions.NotFound:
        print(f"Error: The specified bucket or object was not found. Please check GOOGLE_CLOUD_BUCKET_URI and ensure the bucket exists.")
    except Exception as e:
        print(f"An error occurred during upload: {e}")

if __name__ == "__main__":
    load_dotenv()
    # Example usage
    upload_file("data/extracts/sc-5.md", "mds/sc-5.md")