import logging
import aiofiles
import asyncio
import tempfile
import os
import json

from langchain.tools import tool
from google.cloud.firestore_v1.client import Client
from google.cloud.storage import Bucket
from connectors import gcs_connector
from model import validate
from contracts import dal as contracts_dal
from agent import dal as agent_dal

logger = logging.getLogger(__name__)

def make_get_contract_schema_tool(db_client: Client, agent_id: str):
    """Creates tools for interacting with contracts."""

    @tool
    def get_contract_data() -> dict:
        """Get contract data from the database.
        This tool is used to fetch contract data from the database.
        
        Returns:
            A dictionary containing the contract data.
        """
        logger.debug(f"fetching contract data")
        
        agent_doc = agent_dal.get_agent_document(db_client, agent_id)
        contract_id = agent_doc.selected_contract
        contract_doc = contracts_dal.get_contract(db_client, contract_id)

        if contract_doc is None:
            raise ValueError(f"Contract with ID {contract_id} not found.")

        contract_doc = contract_doc.model_dump()
        contract_doc.pop("user_id", None)
        contract_doc.pop("contract_id", None)
        contract_doc.pop("md_uri", None)
        contract_doc.pop("pdf_uri", None)
        
        return contract_doc
    
    return get_contract_data

def make_fetch_validation_report_tool(db_client: Client, agent_id: str):
    """Creates tools for interacting with contracts."""

    @tool
    def fetch_validation_report() -> dict:
        """Fetch validation report from the database.

        Returns:
            A dictionary containing the validation report.
        """

        agent_doc = agent_dal.get_agent_document(db_client, agent_id)
        contract_id = agent_doc.selected_contract
        logger.debug(f"fetching validation report for contract_id: {contract_id}")
        validation_report = contracts_dal.get_validation_report(db_client, contract_id)

        if validation_report is None:
            raise ValueError(f"Validation report for contract with ID {contract_id} not found.")

        return validation_report.model_dump()
    
    return fetch_validation_report



def make_validate_contract_tool(db_client: Client, bucket: Bucket, agent_id: str):
    """Creates tools for interacting with contracts."""
    @tool
    async def validate_contract():
        """Validate a contract and generate a validation report.
            
        Returns:
            A dictionary containing the validation report.
        """

        agent = agent_dal.get_agent_document(db_client, agent_id)
        contract_id = agent.selected_contract
        logger.debug(f"user session validated for validating contract_id: {contract_id}")
        contract = await asyncio.to_thread(
            contracts_dal.get_contract, db_client, contract_id
        )

        if contract is None:
            raise ValueError("Contract not found")

        logger.log(logging.DEBUG, "contract fetched from database")

        md_uri = contract.md_uri

        temp_dir = tempfile.gettempdir()
        temp_md_path = os.path.join(temp_dir, f"{contract_id}.md")
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
        return validation_report.model_dump()
    

    return validate_contract