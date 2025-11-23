from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl
from datetime import date
from enum import Enum

import uuid
import inspect
import typing

class RenewalType(str, Enum):
    """Enum for contract renewal types."""
    AUTOMATIC = "AUTOMATIC"
    MANUAL = "MANUAL"
    NON_RENEWABLE = "NON_RENEWABLE"


class Currency(str, Enum):
    """Enum for common ISO 4217 currency codes."""
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    AUD = "AUD"
    INR = "INR"


class PaymentFrequency(str, Enum):
    """Enum for payment frequencies."""
    ONE_TIME = "ONE_TIME"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    ANNUALLY = "ANNUALLY"

class PaymentType(str, Enum):
    ONE_TIME = 'ONE_TIME'
    SUBSCRIPTION = 'SUBSCRIPTION'
    EMI = 'EMI'
    
class PaymentMode(str, Enum):
    ELECTRONIC_BANK_TRANSFER = "ELECTRONIC_BANK_TRANSFER" # can include internet banking, upi, card
    CASH = "CASH"
    CHEQUE = "CHEQUE"

class Address(BaseModel):
    model_config = ConfigDict(extra="forbid")

    line1: str = Field(..., description="Street address / PO box")
    line2: Optional[str] = Field(None, description="Address line 2 (optional)")
    city: str = Field()
    state: str = Field()
    postal_code: Optional[str] = Field(None)
    country: str = Field()
    

class Contact(BaseModel):
    model_config = ConfigDict(extra='forbid')

    name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    


class Party(BaseModel):
    """Details of a party involved in the contract (Supplier or Client)."""
    
    model_config = ConfigDict(extra="forbid")
    
    legal_name: str = Field(..., description="Full legal name of the party.")
    address: Address = Field(..., description="Registered address of the party.")
    primary_contact: Contact = Field(..., description="Primary contact person for the party.")
    
    # nda contract specific field
    disclosing_party: Optional[bool] = Field(..., description="Whether the party is the disclosing party in an NDA contract. True if party is disclosing party and False if party is receiving party.")

class ContractType(str, Enum):
    SUPPLIER_CONTRACT = "SUPPLIER_CONTRACT"
    NDA_CONTRACT = "NDA_CONTRACT"
    EMPLOYMENT_CONTRACT = "EMPLOYMENT_CONTRACT"

class Contract(BaseModel):
    
    """
        Parent class for all contract schemas
    """
    
    model_config = ConfigDict(extra="forbid")

    contract_id: uuid.UUID = Field(default_factory=uuid.uuid4, description="Unique identifier for the contract.")
    
    contract_type: Optional[ContractType] = Field(..., description="The title of the contract. Allowed values are 'SUPPLIER_CONTRACT', 'NDA_CONTRACT', 'EMPLOYMENT_CONTRACT'.")

    

class PaymentTerms(BaseModel):
    """Details of the payment terms for the contract."""
    model_config = ConfigDict(extra="forbid")

    currency: Currency = Field(..., description="The agreed currency of the payment by both parties.")
    due_period: int = Field(..., description="The period with in payment has to be made.")
    payment_mode: PaymentMode = Field(default=PaymentMode.ELECTRONIC_BANK_TRANSFER, description="The agreed mode of payment by both parties. Allowed Values are 'ELECTRONIC_BANK_TRANSFER', 'CASH', 'CHEQUE'. Default is 'ELECTRONIC_BANK_TRANSFER'.")
    payment_freq: PaymentFrequency = Field(default=PaymentFrequency.ONE_TIME, description="The agreed mode of payment frequency if exists any. Allowed values are 'ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'. Default value is ONE_TIME, as it is most agreed in many contracts.")
    payment_type: PaymentType  = Field(default=PaymentType.ONE_TIME, description="The type of payment agreed by both parties. Allowed values are 'ONE_TIME', 'SUBSCRIPTION', 'EMI'. Default value is 'ONE_TIME'")


class LegalCompliance(BaseModel):
    """Legal and compliance details of the contract."""
    model_config = ConfigDict(extra="forbid")

    governing_laws: List[str] = Field(..., description="List of precise names of main jurisdiction's laws that governs the contract. Broad values such as 'Indian Laws', 'Laws of India' are not allowed. All names of laws have to be precise. For example, 'The Contract Act, 1872'. For getting the names of laws, use contract type, jurisdiction and contract text.")
    


class SupplierContract(Contract):
    """
    A comprehensive Pydantic schema for a standardized supplier contract summary.
    """
    # 2. Parties Involved
    supplier: Party = Field(..., description="Details of the supplier.")
    client: Party = Field(..., description="Details of the client or buyer.")

    # 3. Key Dates & Term
    effective_date: date = Field(..., description="The date the contract becomes effective.")
    execution_date: Optional[date] = Field(effective_date, description="The date the contract was signed by all parties. Default is effective_date")
    expiration_date: Optional[date] = Field(None, description="The date the contract expires.")
    renewal_type: RenewalType = Field(RenewalType.NON_RENEWABLE, description="The renewal condition for the contract. Allowed values are 'AUTOMATIC', 'MANUAL', 'NON_RENEWABLE'. If none available, default is 'NON_RENEWABLE'")
    contract_term: Optional[int] = Field(..., description="The total months the contract will be in effect as agreed.")
    
    # 3. Payment Terms
    payment_term: PaymentTerms = Field(..., description="The payment terms of the contract")

    # 4. Legal & Compliance
    legal_compliance: LegalCompliance = Field(..., description="Legal and compliance details of the contract.")


class NDAContract(Contract):
    """
    A comprehensive Pydantic schema for a standardized non disclosure agreement summary.
    """
    parties: List[Party] = Field(..., description="List of all parties involved in the agreement. List should contain at least two parties. List should include all disclosing and receiving parties.", min_length=2)
    
    effective_date: date = Field(..., description="The date the NDA becomes effective.")
    expiration_date: Optional[date] = Field(None, description="The date the NDA expires.")
    contract_term: Optional[int] = Field(..., description="The total months the contract will be in effect as agreed.")
    renewal_type: RenewalType = Field(RenewalType.NON_RENEWABLE, description="The renewal condition for the contract. Allowed values are 'AUTOMATIC', 'MANUAL', 'NON_RENEWABLE'. If none available, default is 'NON_RENEWABLE'")
    
    legal_compliance: LegalCompliance = Field(..., description="Legal and compliance details of the NDA.")
    
    confidentiality_clause: str = Field(..., description="The confidentiality clause of the NDA. It is the clause that describes what can be considered as confidential information. It is the clause that describes how disclosing party can disclose the information.")
    
class CTC(BaseModel):
    """Details of the benefits provided to the employee."""
    
    model_config = ConfigDict(extra="forbid")
    
    currency: Currency = Field(..., description="The currency of the salary.")
    
    base_salary: float = Field(..., description="The annual base salary of the employee.")
    house_allowance: Optional[float] = Field(None, description="Monthly House allowance provided to the employee.")
    medical_allowance: Optional[float] = Field(None, description="Monthly Medical allowance provided to the employee.")
    travel_allowance: Optional[float] = Field(None, description="Monthly Travel allowance provided to the employee.")

    performance_bonus: Optional[float] = Field(None, description="Monthly Performance bonus provided to the employee.")
    gratuity: Optional[float] = Field(None, description="Annual Gratuity provided to the employee.")
    provident_fund: Optional[float] = Field(None, description="Monthly Provident fund provided to the employee.")
    
    total_ctc: float = Field(base_salary, description="The total annual cost to company for the employee. Default is base_salary.")

    
class EmploymentContract(Contract):
    """A comprehensive Pydantic schema for a standardized employment contract summary."""
    
    employee: Party = Field(..., description="Details of the employee.")
    employer: Party = Field(..., description="Details of the employer.")
    
    effective_date: date = Field(..., description="The date the employment contract becomes effective.")
    expiration_date: Optional[date] = Field(None, description="The date the employment contract expires.")
    contract_term: Optional[int] = Field(..., description="The total months the contract will be in effect as agreed.")
    renewal_type: RenewalType = Field(RenewalType.NON_RENEWABLE, description="The renewal condition for the contract. Allowed values are 'AUTOMATIC', 'MANUAL', 'NON_RENEWABLE'. If none available, default is 'NON_RENEWABLE'")
    
    legal_compliance: LegalCompliance = Field(..., description="Legal and compliance details of the employment contract.")
    
    job_title: str = Field(..., description="The job title of the employee.")
    ctc: CTC = Field(..., description="Details of the benefits provided to the employee.")
    

def generate_prompt_from_schema(schema: BaseModel.__class__, level=0) -> str:
    """
    Recursively generates a descriptive string from a Pydantic schema.
    """
    prompt_parts = []
    indent = "  " * level
   
    for field_name, field_info in schema.model_fields.items():
        # ignore field if field is UUID
        if field_info.annotation is uuid.UUID:
            continue
        
        # Use the field's description if available, otherwise generate a generic one
        description = f"key_name='{field_name}' - {field_info.description}" or f"key_name='{field_name}' - Details for {field_name.replace('_', ' ')}"
        
        # Check if the field's annotation is a Pydantic model (nested schema)
        if inspect.isclass(field_info.annotation) and issubclass(field_info.annotation, BaseModel):
                
                prompt_parts.append(f"\n{indent}- {description}")
                # Recurse into the nested schema
                nested_prompt = generate_prompt_from_schema(field_info.annotation, level + 1)
                prompt_parts.append(nested_prompt)
        
        elif typing.get_origin(field_info.annotation) is list and inspect.isclass(typing.get_args(field_info.annotation)[0]) and issubclass(typing.get_args(field_info.annotation)[0], BaseModel):
            class_name = typing.get_args(field_info.annotation)[0]
            prompt_parts.append(f"\n{indent}- {description} Following is the schema of each item in the list")
            nested_prompt = generate_prompt_from_schema(class_name, level + 1)
            prompt_parts.append(nested_prompt)
        else:
            prompt_line = f"{indent}- {description}"
            
            prompt_parts.append(prompt_line)
            
    return "\n".join(prompt_parts)

class ValidationCheck(BaseModel):
    """Result of a single validation check."""
    model_config = ConfigDict(extra="forbid")
    
    score: int = Field(..., description="Score for the validation check on a scale of 1 to 10.")
    errors: List[str] = Field(..., description="List of validation errors found.")

class ValidationReport(BaseModel):
    """Comprehensive validation report for a contract."""
    model_config = ConfigDict(extra="forbid")
    
    date_verification: ValidationCheck = Field(..., description="Verification of dates correctness.")
    missing_clauses_compliance: ValidationCheck = Field(..., description="Check for missing clauses and compliance with specific laws.")
    spelling_mistakes: ValidationCheck = Field(..., description="Verification for spelling mistakes of important headings and subheadings.")
    language_ambiguities: ValidationCheck = Field(..., description="Verification for language ambiguities in the contract which are misleading.")



if __name__ == '__main__':
    
    # contract_schema = generate_contract_schema(EmploymentContract)
    # print(contract_schema)
    
    
    print(generate_prompt_from_schema(NDAContract))
    
    