"""FastAPI routes for the contract management application."""

from typing import Annotated, List, Union
from fastapi import Body, Depends, Path, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.routing import APIRouter
from openai import BaseModel
from api.utils import validate_session, handle_exceptions, get_bucket, get_firestore
from connectors import gcs_connector
from contracts import schemas as contracts_schemas, dal as contracts_dal
from model import extract, fill, validate
from sessions import schemas as session_schemas
from google.cloud import firestore, storage

import os
import uuid
import tempfile
import logging
import asyncio
import aiofiles

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contract")


@router.post("/upload")
@handle_exceptions
async def upload_contract(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[storage.Bucket, Depends(get_bucket)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    contract_name: str = Form(...),
    contract_type: str = Form(...),
    file: UploadFile = File(...),
) -> contracts_schemas.Contract:

    logger.debug(f"user session validated for user_id: {session.user_id}")

    # check if the file is provided
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    if not file.filename:
        raise HTTPException(status_code=400, detail="File has no name")

    # Convert string to ContractType enum
    try:
        contract_type = contracts_schemas.ContractType(contract_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contract type")

    pdf_file_uri = f"pdfs/{session.user_id}_{uuid.uuid4()}.pdf"
    md_file_uri = f"mds/{session.user_id}_{uuid.uuid4()}.md"

    contract = contracts_schemas.Contract(
        user_id=session.user_id,
        contract_name=contract_name,
        contract_type=contract_type,
        pdf_uri=pdf_file_uri,
        md_uri=md_file_uri,
    )

    # set temp directory to the api folder
    api_temp = tempfile.gettempdir()
    temp_pdf_path = os.path.join(api_temp, file.filename)
    temp_md_path = os.path.join(api_temp, file.filename.replace(".pdf", ".md"))

    # write the file to a temp pdf file and store in the api folder
    async with aiofiles.open(temp_pdf_path, "wb") as f:
        await f.write(await file.read())
    
    logger.debug("contract pdf file saved to temporary path successfully")

    # extract the text from the pdf file and store it in a temp md file
    await asyncio.to_thread(extract.extract, temp_pdf_path, temp_md_path)
    logger.debug("contract extracted to markdown successfully")

    # Upload the file to Google Cloud Storage
    await asyncio.to_thread(gcs_connector.upload_file, bucket, temp_pdf_path, pdf_file_uri)
    await asyncio.to_thread(gcs_connector.upload_file, bucket, temp_md_path, md_file_uri)
    logger.debug("contract uploaded successfully")

    # Save contract to Firestore
    await asyncio.to_thread(contracts_dal.add_contract, db_client, contract)
    logger.debug("contract saved to database successfully")

    await asyncio.to_thread(os.remove, temp_pdf_path)
    await asyncio.to_thread(os.remove, temp_md_path)
    logger.debug("temporary files removed successfully")

    return contract

@router.post("/fill")
@handle_exceptions
async def fill_contract(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[storage.Bucket, Depends(get_bucket)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    contract_id: Annotated[str, Body(embed=True)],
) -> dict:

    logger.debug(f"user session validated for filling contract_id: {contract_id}")

    contract = await asyncio.to_thread(
        contracts_dal.get_contract_unvalidated, db_client, contract_id
    )
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.user_id != session.user_id:
        raise HTTPException(status_code=403, detail="unauthorized request")

   
    if contract.contract_type is contracts_schemas.ContractType.EMPLOYMENT_CONTRACT:
        contract_cls = contracts_schemas.EmploymentContract
    elif contract.contract_type is contracts_schemas.ContractType.NDA_CONTRACT:
        contract_cls = contracts_schemas.NDAContract
    elif contract.contract_type is contracts_schemas.ContractType.SUPPLIER_CONTRACT:
        contract_cls = contracts_schemas.SupplierContract
    
    md_uri = contract.md_uri

    temp_dir = tempfile.gettempdir()
    temp_md_path = os.path.join(temp_dir, f"{contract_id}.md")
    if md_uri is not None:
        md_file = await asyncio.to_thread(gcs_connector.download_file, bucket, md_uri)

    async with aiofiles.open(temp_md_path, "wb") as f:
        await f.write(md_file)

    filled_contract = await asyncio.to_thread(
        fill.fill_schema, contract_path=temp_md_path, contract_cls=contract_cls
    )
    logger.debug("contract filling completed successfully")
    
    filled_contract.contract_id = contract.contract_id
    filled_contract.md_uri = contract.md_uri
    filled_contract.pdf_uri = contract.pdf_uri
    filled_contract.contract_name = contract.contract_name
    filled_contract.contract_type = contract.contract_type
    filled_contract.user_id = contract.user_id
    
    
    await asyncio.to_thread(contracts_dal.update_contract, db_client, filled_contract)
    
    
    logger.debug("filled contract saved to database successfully")
    return filled_contract.model_dump(mode="json")

@router.get("/get_unval/{contract_id}")
@handle_exceptions
async def get_contract_unval(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    contract_id: str,
    session: Annotated[session_schemas.Session, Depends(validate_session)],
) -> contracts_schemas.Contract:
    """
    Fetches a contract from Firestore by its ID.

    Args:
        contract_id (str): The unique identifier of the contract.

    Returns:
        dict: The contract data if found.

    Raises:
        HTTPException: If the contract is not found or an error occurs.
    """
    logger.debug(f"user session validated for fetching contract_id: {contract_id}")
    contract = await asyncio.to_thread(
        contracts_dal.get_contract_unvalidated, db_client, contract_id
    )
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.user_id != session.user_id:
        raise HTTPException(
            status_code=403, detail="Unauthorized to access this contract"
        )
    return contract


@router.get("/get/{contract_id}")
@handle_exceptions
async def get_contract(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    contract_id: str,
    session: Annotated[session_schemas.Session, Depends(validate_session)],
) -> contracts_schemas.AnyContract:
    """
    Fetches a contract from Firestore by its ID.

    Args:
        contract_id (str): The unique identifier of the contract.

    Returns:
        dict: The contract data if found.

    Raises:
        HTTPException: If the contract is not found or an error occurs.
    """
    logger.debug(f"user session validated for fetching contract_id: {contract_id}")
    contract = await asyncio.to_thread(
        contracts_dal.get_contract, db_client, contract_id
    )
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.user_id != session.user_id:
        raise HTTPException(
            status_code=403, detail="Unauthorized to access this contract"
        )
    return contract # type: ignore


@router.get("/get_all")
@handle_exceptions
async def get_all_contracts(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
) -> List[contracts_schemas.Contract]:
    """Fetches all contracts for the authenticated user."""

    logger.debug("Fetching all contracts for user")
    logger.debug(f"Session ID from cookie: {session.session_id}")

    logger.debug(f"user session validated for user_id: {session.user_id}")
    contracts = await asyncio.to_thread(
        contracts_dal.get_all_contracts, db_client, session.user_id
    )
    logger.debug(msg="fetched all contracts")

    return contracts


@router.get("/get_pdf/{contract_id}")
@handle_exceptions
async def get_contract_pdf(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[storage.Bucket, Depends(get_bucket)],
    contract_id: str,
    session: Annotated[session_schemas.Session, Depends(validate_session)],
) -> FileResponse:

    logger.debug(f"user session validated for fetching contract_id: {contract_id}")

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
        pdf_file = await asyncio.to_thread(gcs_connector.download_file, bucket, pdf_uri)

    async with aiofiles.open(temp_pdf_path, "wb") as f:
        await f.write(pdf_file)

    return FileResponse(path=temp_pdf_path, media_type="application/pdf")


@router.get("/get_md/{contract_id}")
@handle_exceptions
async def get_contract_md(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[storage.Bucket, Depends(get_bucket)],
    contract_id: str,
    session: Annotated[session_schemas.Session, Depends(validate_session)],
) -> FileResponse:

    logger.debug(f"user session validated for fetching contract_id: {contract_id}")
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
        md_file = await asyncio.to_thread(gcs_connector.download_file, bucket, md_uri)

    async with aiofiles.open(temp_md_path, "wb") as f:
        await f.write(md_file)

    return FileResponse(path=temp_md_path, media_type="text/markdown")

class ValidateContractDTO(BaseModel):
    contract_id: str

@router.post("/validate")
@handle_exceptions
async def validate_contract(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    bucket: Annotated[storage.Bucket, Depends(get_bucket)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    request: ValidateContractDTO = Body(...),
) -> contracts_schemas.ValidationReport:

    logger.debug(f"user session validated for validating contract_id: {request.contract_id}")
    contract = await asyncio.to_thread(
        contracts_dal.get_contract, db_client, request.contract_id
    )

    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    logger.log(logging.DEBUG, "contract fetched from database")

    if contract.user_id != session.user_id:
        raise HTTPException(status_code=403, detail="unauthorized request")

    md_uri = contract.md_uri

    temp_dir = tempfile.gettempdir()
    temp_md_path = os.path.join(temp_dir, f"{request.contract_id}.md")
    if md_uri is not None:
        md_file = await asyncio.to_thread(gcs_connector.download_file, bucket, md_uri)

    logger.log(logging.DEBUG, "markdown of the contract downloaded from storage")
    async with aiofiles.open(temp_md_path, "wb") as f:
        await f.write(md_file)

    validation_report = await asyncio.to_thread(
        validate.validate, contract_path=temp_md_path, contract=contract
    )
    logger.debug("Validated the contract")
    
    await asyncio.to_thread(contracts_dal.save_validation_report, db_client, validation_report)

    logger.log(logging.DEBUG, "validation report is saved to database")
    return validation_report

@router.get("/validate/{contract_id}")
@handle_exceptions
async def get_validation_report(
    db_client: Annotated[firestore.Client, Depends(get_firestore)],
    session: Annotated[session_schemas.Session, Depends(validate_session)],
    contract_id: Annotated[str, Path(description="The ID of the contract to validate")],
) -> contracts_schemas.ValidationReport:

    logger.debug(f"user session validated for getting validation report of contract_id: {contract_id}")
    contract = await asyncio.to_thread(
        contracts_dal.get_contract, db_client, contract_id
    )

    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    logger.log(logging.DEBUG, "contract fetched from database")

    if contract.user_id != session.user_id:
        raise HTTPException(status_code=403, detail="unauthorized request")

    validation_report = await asyncio.to_thread(
        contracts_dal.get_validation_report, db_client, contract_id
    )

    if validation_report is None:
        raise HTTPException(status_code=404, detail="Validation report not found")

    logger.log(logging.DEBUG, "validation report fetched from database")
    return validation_report