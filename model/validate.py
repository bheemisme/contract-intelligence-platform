"""Legal validation of the contracts"""
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from contracts import schemas
from pydantic import BaseModel
from contracts.schemas import Contract
from model import fill

def validate(contract_path: str, contract: Contract) -> schemas.ValidationReport:
    """
    Validate the contract against the given schema and legal requirements.

    Args:
        contract_path (str): Path to the markdown pfile containing the contract text.
        contract_schema (BaseModel.__class__): The Pydantic schema class for the contract type.

    Returns:
        schemas.ValidationReport: A detailed validation report.
    """
    
    try:
        with open(contract_path, "r", encoding="utf-8") as f:
            contract_text = f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"The file {contract_path} was not found.")

    client = genai.Client()

    # Generate a description of the schema to help the model understand what to look for
    schema_description = contract.model_dump_json()

    prompt = f"""
    You are a legal expert assistant. Your task is to validate the following contract text against the provided schema requirements and general legal standards.

    Contract Text:
    {contract_text}

    Contract Schema Requirements:
    {schema_description}

    Perform the following validation checks:
    1. **Date Verification**: Verify whether dates are correct, consistent, and logical (e.g., expiration date is after effective date).
    2. **Missing Clauses and Compliance**: Check for missing clauses required by the schema and compliance with specific laws mentioned or implied.
    3. **Spelling Mistakes**: Verify for spelling mistakes of important headings and subheadings.
    4. **Language Ambiguities**: Verify for language ambiguities in the contract which are misleading or unclear.

    For each check, provide a score from 1 to 10 (10 being perfect) and list any validation errors found.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schemas.ValidationReport,
            system_instruction="You are a helpful legal assistant that validates contracts and outputs the result in JSON format."
        ),
    )

    if not response.text:
        raise RuntimeError("No response received from the API")

    # The response text should be a JSON string matching ValidationReport
    # We can parse it directly into the Pydantic model
    
    validation_report = schemas.ValidationReport.model_validate_json(response.text)
    validation_report.contract_id = contract.contract_id
    
    return validation_report

if __name__ == "__main__":
    # Example usage
    try:
        load_dotenv()
        employee_contract = fill.fill_schema("data/extracts/ec-1.md", schemas.EmploymentContract)
        
        report = validate("data/extracts/ec-1.md", employee_contract)
        print(report.model_dump_json(indent=2))
    except Exception as e:
        print(f"An error occurred: {e}")
