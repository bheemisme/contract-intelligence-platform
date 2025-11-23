import os
import pdfkit
import prompts
from dotenv import load_dotenv
from openai import OpenAI


def generate_contract(output_path, user_prompt):
    """Generates a contract in PDF format using AI model.

    Args:
        output_path: The path to save the generated PDF.
        user_prompt: The prompt to use for generating the contract.

    Raises:
        Exception: For errors during the API call or PDF generation.
        ValueError: If the generated content is invalid or empty.
        IOError: If there are issues with file operations.
    """

    try:
        client = OpenAI(api_key=os.environ.get("OPEN_AI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "system",
                    "content": prompts.global_system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            verbosity="high",
            reasoning_effort="medium",
        )
        generated_content = response.choices[0].message.content

        if not generated_content:
            raise ValueError("Generated content is None")

        generated_content = generated_content.replace("```html", "")
        generated_content = generated_content.replace("```", "")

        # Convert HTML to PDF using pdfkit
        options = {
            "page-size": "A4",
            # margins
            "margin-top": "15mm",
            "margin-bottom": "15mm",
            "margin-left": "10mm",
            "margin-right": "10mm",
            # encoding params
            "encoding": "UTF-8",
            "enable-local-file-access": None,
            # # Improves font rendering
            "dpi": 150,  # better font sharpness (default is 96)
            "image-dpi": 300,
            "image-quality": 100,
        }

        pdfkit.from_string(
            generated_content, output_path, options=options, configuration=None
        )

        print(f"Contract generated and saved to {output_path}")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":

    load_dotenv()

    for i in range(2, 6):

        generate_contract(
            output_path=f"data/employment_contracts/ec-{i}.pdf",
            user_prompt=prompts.employment_prompt,
        )
