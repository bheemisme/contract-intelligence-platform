from dotenv import load_dotenv
from contracts import schemas
from google import genai
from google.genai import types
from pprint import pprint

import json

def fill_schema(contract_path: str, contract: schemas.Contract.__class__) -> schemas.Contract:
    """
    Fills the schema with the extracted data.

    Throws
        ValueError: If the contract text is not in the expected format.
        RuntimeError: If there is an error in the OpenAI API call.
    """
    
    with open(contract_path, "r", encoding="utf-8") as f:
        contract_text = f.read()

    client = genai.Client()
    # contract_schema = schemas.generate_prompt_from_schema(contract)
    prompt = f"""
    You are a helpful assistant that fills the schema with the extracted data.
    Fill the schema by querying the following contract text:
    {contract_text}
    
    For fields that expect an integer, extract only the numeric value. For example, if a field expects an integer and the text is "30 calendar days", extract "30".
    For fields that expect a date, output the date in YYYY-MM-DD format.
    For fields that expect a list, output an empty list if no values are found.
    Output the schema in json and nothing else. All key values in json must be the key names in the schema.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents={"parts": [{"text": prompt}], "role": "user"},
        config=types.GenerateContentConfig(
            system_instruction="You are a helpful assistant",
            response_schema=contract,
            response_mime_type="application/json"
        ),
    )
    5
    if not response or not response.candidates or not response.candidates[0].content or not response.candidates[0].content.parts or not response.candidates[0].content.parts[0].text:
        raise RuntimeError("No response received from the API")
    
    
    # filled_schema = response.candidates[0].content.parts[0].text
    if not response.text:
        raise RuntimeError("No response received from the API")

    # The response text should be a JSON string matching ValidationReport
    # We can parse it directly into the Pydantic model
    filled_contract = contract.model_validate_json(response.text)
    
    return filled_contract


if __name__ == "__main__":
    load_dotenv()
    pprint(fill_schema("data/extracts/nda-1.md", schemas.NDAContract).model_dump_json(indent=2))
