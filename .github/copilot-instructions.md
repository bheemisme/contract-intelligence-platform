# Contract Intelligence Platform - AI Agent Guidelines

## Architecture Overview
This is a full-stack SaaS platform for contract management using AI processing. Backend (FastAPI/Python) handles contract uploads, AI extraction/filling/validation, and storage. Frontend (React/TypeScript) provides UI for uploads, chat, and management. Key components:
- **Data Flow**: PDF upload → GCS storage → AI text extraction (OpenAI Vision) → schema filling (Gemini) → validation → Firestore + ChromaDB vectorization
- **AI Agent**: LangGraph-based agent in `agent/agent.py` for interactive contract queries
- **Auth**: OIDC-based sessions stored in Firestore
- **Vector Search**: ChromaDB for semantic search on chunked contract content

## Critical Workflows
- **Backend Start**: `uvicorn main:app --reload` (auto-reloads on changes in api/, database/, contracts/, agent/, model/, config/, main.py)
- **Frontend Start**: `cd client && pnpm run dev` (Vite dev server)
- **Dependencies**: Backend uses `uv sync` (uv package manager); Frontend uses `pnpm install`
- **Environment**: Requires GCP credentials, ChromaDB cloud API keys, OpenAI/Gemini API keys in `.env`

## Project-Specific Patterns
- **Contract Processing**: Use temp files in `tempfile.gettempdir()` for PDF→MD conversion; clean up after upload
- **Async Operations**: Wrap Firestore/Chroma calls with `await asyncio.to_thread()` for FastAPI compatibility
- **Schema Handling**: Pydantic models in `contracts/schemas.py` with enums (e.g., `ContractType.NDA_CONTRACT`); validate contract types before processing
- **File Storage**: Unique filenames via `uuid.uuid4()` to avoid collisions; store PDFs in `pdfs/` and MDs in `mds/` GCS buckets
- **Frontend Queries**: TanStack Query with sessionStorage persistence; protected routes check user auth via `useGetUser()`
- **Error Handling**: Raise `HTTPException` for API errors; log with configured loggers from `config/log_config.py`
- **Vector Operations**: Chunk documents with `RecursiveCharacterTextSplitter` (1000 char chunks, 200 overlap) before ChromaDB storage

## Key Files & Directories
- `api/contract_router.py`: Upload/get/delete contract endpoints; exemplifies full processing pipeline
- `model/extract.py`, `model/fill.py`, `model/validate.py`: AI processing steps
- `database/vector.py`: ChromaDB chunking and search
- `contracts/dal.py`: Firestore CRUD operations for contracts
- `client/src/queries/`: API hooks using TanStack Query
- `agent/agent.py`: LangGraph state machine for chat interactions

## Integration Points
- **GCP Services**: Firestore for metadata, Cloud Storage for files; use `database/db.py` and `database/storage.py`
- **ChromaDB Cloud**: Semantic search; configure via env vars in `database/vector.py`
- **AI APIs**: OpenAI for extraction, Gemini for filling/validation/agent; handle API limits and retries
- **OIDC Auth**: User sessions in `sessions/`; validate session cookies on protected endpoints

Follow Pydantic for data models, FastAPI for routing, and React hooks for state. Always validate contract types and handle temp file cleanup.