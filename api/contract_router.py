"""FastAPI routes for the contract management application."""

from typing import List, Optional
from fastapi import Cookie, Response, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.routing import APIRouter
from database import storage, vector, db
from contracts import schemas as contracts_schemas, dal as contracts_dal
from model import extract, fill, validate
from sessions import dal as session_dal, schemas as session_schemas
from datetime import datetime, timezone
import os
import uuid
import tempfile
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contract")


@router.post("/upload")
async def upload_contract(
    contract_name: str = Form(...),
    contract_type: str = Form(...),
    file: UploadFile = File(...),
    session_id: Optional[str] = Cookie(None, alias="session_id"),
):
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
        db_client = db.get_firestore_connection()
        if not session_id:
            raise HTTPException(status_code=401, detail="No session found")
        
        # Check if there's an active session cookie
        session = await asyncio.to_thread(
            session_dal.get_session, db_client, session_id
        )
        if not session:
            raise HTTPException(status_code=404, detail="No session found")
        if session.expires_at > datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="inactive session")

        # Convert string to ContractType enum
        try:
            contract_type = contracts_schemas.ContractType(contract_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid contract type")

        # check the contract type
        if contract_type == contracts_schemas.ContractType.NDA_CONTRACT:
            contract_cls = contracts_schemas.NDAContract
        elif contract_type == contracts_schemas.ContractType.SUPPLIER_CONTRACT:
            contract_cls = contracts_schemas.SupplierContract
        elif contract_type == contracts_schemas.ContractType.EMPLOYMENT_CONTRACT:
            contract_cls = contracts_schemas.EmploymentContract
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
        contract_id = await asyncio.to_thread(
            contracts_dal.add_contract, db_client, contract
        )

        contract.contract_name = contract_name
        contract.user_id = session.user_id

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
        if isinstance(e, HTTPException):
            raise e

        raise HTTPException(
            status_code=500, detail=f"An error occurred during upload: {str(e)}"
        )


@router.get("/get/{contract_id}")
async def get_contract(
    contract_id: str, session_id: Optional[str] = Cookie(None, alias="session_id")
):
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

        # get session
        # Check if there's an active session cookie
        if not session_id:
            raise HTTPException(status_code=401, detail="No session found")
        
        session = await asyncio.to_thread(
            session_dal.get_session, db_client, session_id
        )
        if not session:
            raise HTTPException(status_code=404, detail="No session found")
        if session.expires_at > datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="inactive session")

        contract = await asyncio.to_thread(
            contracts_dal.get_contract, db_client, contract_id
        )

        if contract is None:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract.user_id != session.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

        return contract.model_dump_json()

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching contract: {str(e)}",
        )

async def validate_session(route_fn):
    
    return 

@router.get("/get_all")
async def get_all_contracts(
    response: Response,
    session_id: Optional[str] = Cookie(None, alias="session_id"),
) -> List[contracts_schemas.Contract]:
    db_client = db.get_firestore_connection()
    # Check if there's an active session cookie
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")
    
    
    session = await asyncio.to_thread(
        session_dal.get_session, db_client, session_id
    )
    if not session:
        raise HTTPException(status_code=404, detail="No session found")
    if session.expires_at > datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="inactive session")

    contracts = await asyncio.to_thread(
        contracts_dal.get_all_contracts, db_client, session.user_id
    )
    logger.debug(msg="fetched all contracts")

    
    return contracts


@router.get("/get_pdf/{contract_id}")
async def get_contract_files(
    contract_id: str, session_id: Optional[str] = Cookie(None, alias="session_id")
) -> FileResponse:

    try:
        db_client = db.get_firestore_connection()
        if not session_id:
            raise HTTPException(status_code=401, detail="No session found")
    
        session = await asyncio.to_thread(
            session_dal.get_session, db_client, session_id
        )
        if not session:
            raise HTTPException(status_code=404, detail="No session found")
        if session.expires_at > datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="inactive session")

        contract = await asyncio.to_thread(
            contracts_dal.get_contract, db_client, contract_id
        )
        if contract is None:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract.user_id != session.user_id:
            raise HTTPException(status_code=403, detail="unauthorized request")
        pdf_uri = contract.pdf_uri

        temp_dir = tempfile.gettempdir()
        temp_pdf_path = os.path.join(temp_dir, f"{contract_id}.pdf")

        if pdf_uri is not None:
            pdf_file = await asyncio.to_thread(storage.download_file, pdf_uri)

        with open(temp_pdf_path, "wb") as f:
            f.write(pdf_file)

        return FileResponse(path=temp_pdf_path, media_type="application/pdf")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/get_md/{contract_id}")
async def get_contract_md(
    contract_id: str, session_id: Optional[str] = Cookie(None, alias="session_id")
) -> FileResponse:
    try:
        db_client = db.get_firestore_connection()

        if not session_id:
            raise HTTPException(status_code=401, detail="No session found")
    
        session = await asyncio.to_thread(
            session_dal.get_session, db_client, session_id
        )
        if not session:
            raise HTTPException(status_code=404, detail="No session found")
        if session.expires_at > datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="inactive session")

        contract = await asyncio.to_thread(
            contracts_dal.get_contract, db_client, contract_id
        )
        if contract is None:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract.user_id != session.user_id:
            raise HTTPException(status_code=403, detail="unauthorized request")

        md_uri = contract.md_uri

        temp_dir = tempfile.gettempdir()
        temp_md_path = os.path.join(temp_dir, f"{contract_id}.md")

        if md_uri is not None:
            md_file = await asyncio.to_thread(storage.download_file, md_uri)

        with open(temp_md_path, "wb") as f:
            f.write(md_file)

        return FileResponse(path=temp_md_path, media_type="text/markdown")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e

        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/validate/{contract_id}")
async def validate_contract(
    contract_id: str, session_id: str = Cookie(None, alias="session_id")
) -> contracts_schemas.ValidationReport:
    try:
        db_client = db.get_firestore_connection()
        
        if session_id:
            session = await asyncio.to_thread(
                session_dal.get_session, db_client, session_id
            )
            if not session:
                raise HTTPException(status_code=404, detail="No session found")
            if session.expires_at > datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="inactive session")

        contract = await asyncio.to_thread(
            contracts_dal.get_contract, db_client, contract_id
        )

        if contract is None:
            raise HTTPException(status_code=404, detail="Contract not found")
        logger.log(logging.DEBUG, "contract fetched from database")

        
        if contract.user_id != session.user_id:
            raise HTTPException(status_code=403, detail="unauthorized request")


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
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Internal server error")
