import os
import openai
import fitz  # PyMuPDF
import base64
from dotenv import load_dotenv
from openai import OpenAI
from google import genai
from google.genai import types

# Configure OpenAI API
openai.api_key = os.getenv("OPEN_AI_API_KEY")

def pdf_to_base64_images(pdf_path: str):
    """Converts each page of a PDF to a list of base64 encoded images."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"The file {pdf_path} was not found.")

    doc = fitz.open(pdf_path)
    base64_images = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap()
        img_bytes = pix.tobytes("png")
        base64_images.append(base64.b64encode(img_bytes).decode("utf-8"))

    doc.close()
    return base64_images


def open_ai_extractor(pdf_path: str) -> str:
    """
    Extracts text from a PDF using OpenAI's Vision API and saves it to a markdown file.

    Args:
        pdf_path: The path to the PDF file.

    Returns:
        The path to the generated markdown file.
    """
    # 1. Convert PDF to images
    base64_images = pdf_to_base64_images(pdf_path)

    if not base64_images:
        raise ValueError("Could not extract any images from the PDF.")

    # 2. Call OpenAI Vision API
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{img}",
                }
                for img in base64_images
            ],
        }
    ]

    try:
        client = OpenAI()
        
        response = client.responses.create(
            model="gpt-5.1",
            input=messages,
        )
        extracted_text = response.output_text

    except Exception as e:
        raise RuntimeError(f"An error occurred with the OpenAI API: {e}")

    # 3. Save to markdown file
    if not extracted_text:
        raise ValueError("Failed to get a valid response from the OpenAI API.")

    md_filename = os.path.splitext(os.path.basename(pdf_path))[0] + ".md"
    md_path = os.path.join("data", "extracts", md_filename)

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(extracted_text)

    return md_path

def gemini_extractor(pdf_path: str) -> str:
    
    client = genai.Client()
    
    # 1. Convert PDF to images
    base64_images = pdf_to_base64_images(pdf_path)

    if not base64_images:
        raise ValueError("Could not extract any images from the PDF.")
    
    
    # 2. Constructing prompt for API
    contents = types.Content(
        role='user',
        parts=[
            types.Part(
                text='Extract the text from the image and return it as markdown. Output markdown code and nothing else.'
            ),
            types.Part(
                inline_data=types.Blob(
                    mime_type='image/jpeg',
                    data=base64_images[0]
                )
            )
        ]
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[contents],
        )
        extracted_text = response.candidates[0].content.parts[0].text

    except Exception as e:
        raise RuntimeError(f"An error occurred with the OpenAI API: {e}")

    # 3. Save to markdown file
    if not extracted_text:
        raise ValueError("Failed to get a valid response from the OpenAI API.")

    md_filename = os.path.splitext(os.path.basename(pdf_path))[0] + ".md"
    md_path = os.path.join("data", "extracts", md_filename)

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(extracted_text)

    return md_path


def extract(doc_path: str):
    """
    Extracts the document into a markdown format and stores the markdown file.
    """
    if doc_path.lower().endswith(".pdf"):
        return gemini_extractor(doc_path)
    else:
        raise ValueError("Unsupported file type. Only PDF files are supported.")


if __name__ == "__main__":
    # Example:
    load_dotenv()
    try:
        md_file = extract("data/nda/nda-1.pdf")
        print(f"Successfully created markdown file: {md_file}")
    except (FileNotFoundError, ValueError, RuntimeError) as e:
        print(f"An error occurred: {e}")
    pass
