"""Methods to interact with the storage layer"""

from google.cloud import storage
from typing import List
from dotenv import load_dotenv
import os
import logging


logger = logging.getLogger(__name__)


# upload file to the storage bucket
def get_storage_bucket() -> storage.Bucket:
    """
    Returns google cloud storage bucket client
    
    returns:
        storage.Bucket: The google cloud storage bucket object
    """

    storage_client = storage.Client(project=os.environ["GOOGLE_CLOUD_PROJECT"])
    bucket = storage_client.bucket(os.environ["GOOGLE_CLOUD_BUCKET"])
    return bucket


def upload_file(bucket: storage.Bucket, file_path: str, destination_blob_name: str):
    """
    Uploads a file to the 'contracts_pdfs' folder in the Google Cloud Storage bucket.

    Args:
        file_path (str): The path to the file to upload.
    """
    
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file_path)
    logger.log(
        level=logging.DEBUG,
        msg=f"File {file_path} uploaded to {destination_blob_name}.",
    )
    

# implement a function to download a file from the storage bucket
def download_file(bucket: storage.Bucket, source_blob_name: str) -> bytes:
    """Downloads a file from the Google Cloud Storage bucket and stores it in destination_file_name.

    Args:
        source_blob_name (str): The name of the blob to download.
        destination_file_name (str): The path to the file to download to.

    returns:
        bytes: The content of the file as bytes.

    throws:
        google.api_core.exceptions.NotFound: If the specified bucket or object was not found.

    """

    blob = bucket.blob(source_blob_name)
    blob_bytes = blob.download_as_bytes()
    return blob_bytes


def list_files(bucket: storage.Bucket) -> List[str]:
    """Lists all files in the Google Cloud Storage bucket."""
    blobs = bucket.list_blobs()
    blob_names = list(map(lambda blob: blob.name, blobs))

    return blob_names
    


if __name__ == "__main__":
    load_dotenv()
    # Example usage
    # asyncio.run(upload_file("data/extracts/sc-5.md", "mds/sc-5.md"))
