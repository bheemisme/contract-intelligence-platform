# Architecture

## System Architecture

The Contract Intelligence Platform is a Python-based application in its early stages of development. At a high level, it aims to use AI models to extract information from legal contracts. The current structure includes scripts for data extraction, Pydantic schemas for data validation, and a main entry point, but the final architecture is not yet defined.

The core workflow is as follows:
1.  **Contract Upload**: Users upload contract documents through the web interface (`client/`).
2.  **API Processing**: The API (`api/routes.py`) receives the uploaded file and stores it in Google Cloud Storage (`database/storage.py`).
3.  **Text Conversion**: The uploaded contract is converted to markdown format using AI vision models (`model/extract.py`) and stored in GCS.
4.  **Schema Extraction**: Key information is extracted from the contract using LLMs (`model/fill.py`) and structured schema is saved to Firestore database (`database/db.py`).
5.  **Document Processing**: Extracted contract contexts are loaded directly into the agent’s runtime context for interactive analysis, eliminating the need for a dedicated vector database.
6.  **Interactive Analysis**: Users interact with contracts through a chat interface powered by a LangChain-based AI agent deployed as part of the backend App Engine service; it exposes a REST API via `agent_router.py`, allowing the frontend and other services to query contract context directly.
7.  **Contract Management**: Users can upload, delete, and modify contracts through the web interface.

## Source Code Paths

*   `main.py`: The main entry point of the application.
*   `agent/`: Contains the AI agent code built with LangGraph.
*   `api/contract_router.py`: Defines API routes for contracts.
*   `api/user_router.py`: Handles user signin, session creation, and user lookup via secure cookies.
*   `client/`: Contains the frontend code.
*   `contracts/generate_contracts.py`: A script to generate test contract data.
*   `contracts/prompts.py`: Contains prompts used for contract generation.
*   `contracts/schemas.py`: Defines the data schemas for the application. These schemas are filled by extracting information from contracts.
*   `model/extract.py`: Responsible for extracting information from contracts.
*   `model/fill.py`: Fills Pydantic schemas with extracted contract data using an LLM.
*   `model/validate.py`: Validates contracts against legal standards and schema requirements.
*   `database/db.py`: Handles the connection to and interaction with the Firestore database.
*   `database/storage.py`: Handles file uploads to Google Cloud Storage.
*   `sessions/schemas.py`: Stores session metadata (session id, user id, expiry) for cookie-based authentication.
*   `sessions/dal.py`: Reads, writes, and deletes session documents in Firestore.

## Key Technical Decisions

*   **AI for Contract Generation**: The platform uses AI to generate comprehensive legal contracts for testing purposes, reducing the need for manual drafting of test data.

*   **Vision API for Information Extraction**: The use of a vision model allows the platform to extract text from scanned or image-based PDFs, making it more robust than traditional text-extraction methods.

*   **Pydantic for Data Validation**: The use of Pydantic ensures that the data extracted from contracts is well-structured and validated, which is crucial for maintaining data integrity.

*   **Dynamic Prompt Generation**: The application dynamically generates prompts from Pydantic schemas, allowing it to adapt to different contract types and data structures without manual prompt engineering.

*   **Firestore for Database**: Google Cloud Firestore is used as the primary database for storing and managing contract data.

*   **Agent Context Loading**: Extracted contexts are loaded directly into the agent runtime rather than being persisted in a vector store, and the agent is exposed through `api/agent_router.py` so other routes can reuse its reasoning capabilities.

*   **LangChain for AI Agent**: LangChain powers the AI agent that performs contract reasoning through the REST API router.

*   **LangSmith Cloud**: Used only for monitoring the LangChain-based agent during development.

*   **FastAPI for API**: FastAPI is used to build the REST API, providing high performance and automatic documentation.

*   **Google Cloud Storage**: Used for storing the raw contract PDF files.

*   **Session-Based Auth**: Sessions are validated via `api/utils.py` and the `require_session` decorator so API routes can rely on secure cookies and Firestore-backed session documents.
