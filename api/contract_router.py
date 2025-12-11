"""FastAPI routes for the contract management application."""

from typing import List
from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.routing import APIRouter
from database import storage, vector, db
from contracts import dal, schemas
from model import extract, fill, validate

import os
import uuid
import tempfile
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contract")


@router.post("/upload")
async def upload_contract(contract_name: str = Form(...), contract_type: str = Form(...), file: UploadFile = File(...)):
    """
    Uploads a contract document to Google Cloud Storage.

    Args:
        contract_name (str): The name of the contract
        contract_type (str): The type of contract being uploaded as a string.
        file (UploadFile): The contract file to upload.

    Returns:
        dict: A dictionary containing the file name and its GCS URI.
    """
    try:
        # Convert string to ContractType enum
        try:
            contract_type = schemas.ContractType(contract_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid contract type")

        # check the contract type
        if contract_type == schemas.ContractType.NDA_CONTRACT:
            contract_cls = schemas.NDAContract
        elif contract_type == schemas.ContractType.SUPPLIER_CONTRACT:
            contract_cls = schemas.SupplierContract
        elif contract_type == schemas.ContractType.EMPLOYMENT_CONTRACT:
            contract_cls = schemas.EmploymentContract
        else:
            raise HTTPException(status_code=400, detail="Unsupported contract type")

        # check if the file is provided
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        if not file.filename:
            raise HTTPException(status_code=400, detail="File has no name")

        # set temp directory to the api folder
        api_temp = tempfile.gettempdir()
        temp_pdf_path = os.path.join(api_temp, file.filename)
        temp_md_path = os.path.join(api_temp, file.filename.replace(".pdf", ".md"))

        # write the file to a temp pdf file and store in the api folder
        with open(temp_pdf_path, "wb") as f:
            f.write(await file.read())

        # extract the text from the pdf file and store it in a temp md file
        extract.extract(temp_pdf_path, temp_md_path)

        # fill the schema with the extracted text
        contract = fill.fill_schema(temp_md_path, contract_cls)

        # Generate a unique filename to avoid collisions
        unique_filename = f"{uuid.uuid4()}"
        pdf_file_uri = f"pdfs/{unique_filename}.pdf"
        md_file_uri = f"mds/{unique_filename}.md"

        # Upload the file to Google Cloud Storage
        storage.upload_file(temp_pdf_path, pdf_file_uri)
        storage.upload_file(temp_md_path, md_file_uri)

        # chunk the document and store it in chroma
        chunks = vector.chunk_document(temp_md_path)
        await asyncio.to_thread(vector.write_to_chroma, chunks, "contracts")

        # store the contract in firestore
        contract.pdf_uri = pdf_file_uri
        contract.md_uri = md_file_uri
        db_client = db.get_firestore_connection()
        contract_id = await asyncio.to_thread(dal.add_contract, db_client, contract)

        contract.contract_name = contract_name
        # Clean up the temporary file
        os.remove(temp_pdf_path)
        os.remove(temp_md_path)

        return {
            "contract_name": contract_name,
            "filename": unique_filename,
            "contract_id": contract_id,
            "message": "File uploaded successfully",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred during upload: {str(e)}"
        )


@router.get("/get/{contract_id}")
async def get_contract(contract_id: str):
    """
    Fetches a contract from Firestore by its ID.

    Args:
        contract_id (str): The unique identifier of the contract.

    Returns:
        dict: The contract data if found.

    Raises:
        HTTPException: If the contract is not found or an error occurs.
    """
    try:
        db_client = db.get_firestore_connection()
        contract = await asyncio.to_thread(dal.get_contract, db_client, contract_id)

        if contract is None:
            raise HTTPException(status_code=404, detail="Contract not found")

        return contract.model_dump_json()

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching contract: {str(e)}",
        )


@router.get("/get_all")
async def get_all_contracts() -> List[schemas.Contract]:
    db_client = db.get_firestore_connection()
    contracts = await asyncio.to_thread(dal.get_all_contracts, db_client)
    logger.log(level=logging.DEBUG, msg="fetched all contracts")

    return contracts


@router.get("/get_pdf/{contract_id}")
async def get_contract_files(contract_id: str) -> FileResponse:
    db_client = db.get_firestore_connection()
    contract = await asyncio.to_thread(dal.get_contract, db_client, contract_id)
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    pdf_uri = contract.pdf_uri

    temp_dir = tempfile.gettempdir()
    temp_pdf_path = os.path.join(temp_dir, f"{contract_id}.pdf")

    if pdf_uri is not None:
        pdf_file = await asyncio.to_thread(storage.download_file, pdf_uri)

    with open(temp_pdf_path, "wb") as f:
        f.write(pdf_file)

    return FileResponse(path=temp_pdf_path, media_type="application/pdf")


@router.get("/get_md/{contract_id}")
async def get_contract_md(contract_id: str) -> FileResponse:
    db_client = db.get_firestore_connection()
    contract = await asyncio.to_thread(dal.get_contract, db_client, contract_id)
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    md_uri = contract.md_uri

    temp_dir = tempfile.gettempdir()
    temp_md_path = os.path.join(temp_dir, f"{contract_id}.md")

    if md_uri is not None:
        md_file = await asyncio.to_thread(storage.download_file, md_uri)

    with open(temp_md_path, "wb") as f:
        f.write(md_file)

    return FileResponse(path=temp_md_path, media_type="text/markdown")


@router.get("/validate/{contract_id}")
async def validate_contract(contract_id: str) -> schemas.ValidationReport:
    db_client = db.get_firestore_connection()
    contract = await asyncio.to_thread(dal.get_contract, db_client, contract_id)

    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")

    logger.log(logging.DEBUG, "contract fetched from database")

    md_uri = contract.md_uri

    temp_dir = tempfile.gettempdir()
    temp_md_path = os.path.join(temp_dir, f"{contract_id}.md")
    if md_uri is not None:
        md_file = await asyncio.to_thread(storage.download_file, md_uri)

    logger.log(logging.DEBUG, "markdown of the contract downloaded from storage")
    with open(temp_md_path, "wb") as f:
        f.write(md_file)

    validation_report = await asyncio.to_thread(
        validate.validate, contract_path=temp_md_path, contract=contract
    )

    logger.log(logging.DEBUG, "validation report is completed")
    return validation_report
