"""Data Access Layer methods for contracts"""

from typing import Optional
from google.cloud import firestore
from contracts.schemas import (
    Contract,
    ContractType,
    EmploymentContract,
    NDAContract,
    SupplierContract,
)
from google.cloud.firestore import Client


# function to add contract to contracts collection
def add_contract(db: Client, contract: Contract) -> str:
    """
    add contract to contracts collection
    """
    doc_ref = db.collection("contracts").document(str(contract.contract_id))

    if doc_ref.get().exists:
        raise ValueError(f"Contract with ID {contract.contract_id} already exists.")
  
    doc_ref.set(contract.model_dump(mode="json"))    
    return doc_ref.id


def get_contract_only(db: Client, contract_id: str) -> Optional[Contract]:
    """Fetch a contract by its ID."""

    doc_ref = db.collection("contracts").document(contract_id)
    doc = doc_ref.get()  # db request
    if not doc.exists:
        return None
    return Contract(**doc.to_dict()) # type: ignore

def get_contract(db: Client, contract_id: str) -> Optional[Contract]:
    """Fetch a contract by its ID and return the appropriate Contract subclass."""

    doc_ref = db.collection("contracts").document(contract_id)
    doc = doc_ref.get() # db request
    if not doc.exists:
        return None
    
    contract = Contract(**doc.to_dict())  # type: ignore
    
    if contract.contract_type == ContractType.NDA_CONTRACT:
        return NDAContract(**doc.to_dict())  # type: ignore
    elif contract.contract_type == ContractType.SUPPLIER_CONTRACT:
        return SupplierContract(**doc.to_dict())  # type: ignore
    elif contract.contract_type == ContractType.EMPLOYMENT_CONTRACT:
        return EmploymentContract(**doc.to_dict())  # type: ignore
    
    return contract


def fetch_contracts_by_type(db: Client, contract_type: ContractType) -> list[Contract]:
    contracts_ref = db.collection("contracts")
    query = contracts_ref.where("contract_type", "==", contract_type.value)
    docs = query.stream()
    return [Contract(**doc.to_dict()) for doc in docs]


def get_all_contracts(db: Client, user_id) -> list[Contract]:
    contracts_ref = db.collection("contracts").where("user_id", "==", user_id)
    docs = contracts_ref.stream()
    
    return [Contract(**(doc.to_dict())) for doc in docs]


if __name__ == "__main__":

    from connectors import firestore_connector
    from dotenv import load_dotenv

    load_dotenv()
    contract = get_contract(firestore_connector.get_firestore_connection(),"123e4567-e89b-12d3-a456-426614174000")
    print(contract)
