# Technology Stack

## Core Technologies

*   **Python**: The primary programming language used for the application. The required version is `>=3.12`.
*   **FastAPI**: Web framework for building the API.
*   **OpenAI API**: Used for contract generation and information extraction.
    *   `gpt-5-mini`: Used for generating contracts.
    *   `gpt-5.1` (Vision API): Used for extracting text from PDFs.
*   **Google Generative AI**: Used for filling Pydantic schemas.
    *   `gemini-2.5-flash`: The model used for schema filling.
*   **Pydantic**: For data validation and defining schemas.
*   **Google Cloud Firestore**: The primary database for storing and managing contract data.
*   **Google Cloud Storage**: Used for storing contract documents.
*   **ChromaDB**: Vector database for storing document chunks and enabling semantic search.
*   **LangGraph**: Framework for building AI agents with advanced reasoning capabilities.
*   **LangSmith Cloud**: Platform for deploying and monitoring AI agents.

## Frontend Technologies

*   **React**: JavaScript library for building user interfaces.
*   **Vite**: Build tool and development server.
*   **React Router**: For client-side routing.
*   **TanStack Query (React Query)**: For data fetching and state management.
*   **Tailwind CSS**: Utility-first CSS framework for styling.

## Key Libraries

*   **fastapi**: Web framework.
*   **uvicorn**: ASGI server.
*   **python-multipart**: For handling file uploads.
*   **google-genai**: For interacting with the Google Generative AI models.
*   **google-cloud-firestore**: For interacting with the Firestore database.
*   **google-cloud-storage**: For interacting with Google Cloud Storage.
*   **chromadb**: For interacting with the ChromaDB vector database.
*   **langchain**: For document chunking and text splitting.
*   **langgraph**: For building AI agents.
*   **PyMuPDF (`fitz`)**: For converting PDF pages to images for the Vision API.
*   **pdfkit**: For converting generated HTML contracts into PDFs.
*   **python-dotenv**: For managing environment variables.

## Development Tools

*   **Ruff**: Used as a linter.