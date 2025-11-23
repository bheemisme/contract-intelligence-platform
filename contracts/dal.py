"""Data Access Layer methods for contracts"""

from typing import Optional
from google.cloud import firestore
from contracts.schemas import Contract, ContractType
from google.cloud.firestore import Client

# function to add contract to contracts collection
def add_contract(db: Client, contract: Contract) -> str:
    doc_ref = db.collection('contracts').document(str(contract.contract_id))
    doc_ref.set(contract.model_dump(mode='json'))
    return doc_ref.id

# function to add batch of contracts to contracts collection
def add_contracts(db: Client, contracts: list[Contract]):
    batch = db.batch()
    for contract in contracts:
        doc_ref = db.collection('contracts').document(str(contract.contract_id))
        batch.set(doc_ref, contract.model_dump())
    batch.commit()


def get_contract(db: Client, contract_id: str) -> Optional[Contract]:
    doc_ref = db.collection('contracts').document(contract_id)
    doc = doc_ref.get()
    if doc.exists:
        return Contract(**doc.to_dict()) # type: ignore
    else:
        return None

def fetch_contracts_by_type(db: Client, contract_type: ContractType) -> list[Contract]:
    contracts_ref = db.collection('contracts')
    query = contracts_ref.where('contract_type', '==', contract_type.value)
    docs = query.stream()
    return [Contract(**doc.to_dict()) for doc in docs]

