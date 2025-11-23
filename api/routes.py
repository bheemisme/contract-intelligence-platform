"""FastAPI routes for the contract management application."""

from fastapi import FastAPI, UploadFile, File, HTTPException
from database import storage
import os
import uuid
import uvicorn

app = FastAPI(debug=True)

@app.post("/upload_contract")
async def upload_contract(file: UploadFile = File(...)):
    """
    Uploads a contract document to Google Cloud Storage.

    Args:
        file (UploadFile): The contract file to upload.

    Returns:
        dict: A dictionary containing the file name and its GCS URI.
    """
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        if not file.filename:
            raise HTTPException(status_code=400, detail="File has no name")
        
        # Generate a unique filename to avoid collisions
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        

        storage.upload_file(file.filename,f"pdfs/{file.file}")

        return {
            "filename": unique_filename,
            "message": "File uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during upload: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)