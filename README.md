# Contract Intelligence Platform

An AI-native vertical SaaS application designed to manage legal contracts of all
kinds. The platform automates contract information extraction, performs legal
validation, sets reminders for important dates and deadlines, and provides an
interactive interface for querying contract details.

## System Architecture

The Contract Intelligence Platform is a comprehensive solution built with Python
backend, React frontend, and multiple AI services. The system leverages Google
Cloud Platform for storage and databases, ChromaDB for vector search, and
advanced AI agents for contract analysis.

### Core Components

- **Backend API**: FastAPI-based REST API for handling contract uploads and
  processing
- **AI Processing Pipeline**: Multi-step workflow for contract analysis using
  vision models and LLMs
- **Vector Database**: ChromaDB for semantic search capabilities
- **Frontend**: React application with modern UI for contract management
- **AI Agent**: LangGraph-powered agent for interactive contract queries

## Core Workflow

1. **Contract Upload**: Users upload contract documents through the web
   interface
2. **API Processing**: The API receives the uploaded file and stores it in
   Google Cloud Storage
3. **Text Conversion**: The uploaded contract is converted to markdown format
   using AI vision models and stored in GCS
4. **Schema Extraction**: Key information is extracted from the contract using
   LLMs and structured schema is saved to Firestore database
5. **Document Chunking**: The markdown content is chunked and stored in ChromaDB
   for semantic search
6. **Interactive Analysis**: Users interact with contracts through a chat
   interface powered by an AI agent built with LangGraph and deployed to
   LangSmith Cloud
7. **Contract Management**: Users can upload, delete, and modify contracts as
   needed

## Project Directory Structure

```
contract-intelligence-platform/
├── agent/                    # AI agent code built with LangGraph
├── api/                      # FastAPI routes and backend logic
├── client/                   # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components
│   │   └── queries/         # API query hooks
├── contracts/                # Contract-related schemas and utilities
├── database/                 # Database connection and operations
│   ├── db.py                # Firestore operations
│   ├── storage.py           # Google Cloud Storage operations
│   └── vector.py            # ChromaDB operations
├── model/                    # AI/ML models for processing
│   ├── extract.py           # Text extraction from PDFs
│   ├── fill.py              # Schema filling with LLMs
│   └── validate.py          # Legal validation
├── data/                     # Sample data and extracted content
├── .kilocode/               # Project documentation and rules
└── main.py                  # Application entry point
```

## Technology Stack

### Backend

- **Python 3.12+**
- **FastAPI**: High-performance API framework
- **Google Cloud Platform**: Storage, Firestore, AI services
- **ChromaDB**: Vector database for semantic search
- **LangGraph**: Framework for building AI agents

### Frontend

- **React 19**: Modern JavaScript library
- **Vite**: Fast build tool and dev server
- **TanStack Query**: Data fetching and state management
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework

### AI/ML Services

- **OpenAI GPT-4 Vision**: Text extraction from documents
- **Google Gemini**: Schema filling and validation
- **LangSmith Cloud**: AI agent deployment and monitoring

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Google Cloud Platform account with necessary APIs enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd contract-intelligence-platform
   ```

2. **Backend Setup**

   ```bash
   pip install uv
   uv sync
   # Configure environment variables for GCP services
   ```

3. **Frontend Setup**

   ```bash
   cd client
   pnpm install
   pnpm run dev
   ```

4. **Environment Configuration**
   - Set up Google Cloud credentials
   - Configure ChromaDB connection
   - Set API keys for AI services

## Usage

1. Start the backend API server
2. Launch the frontend development server
3. Upload contract documents through the web interface
4. Interact with contracts using the AI-powered chat interface
5. Set up reminders and manage contract lifecycle

## Contributing

Please read the contributing guidelines and code of conduct before contributing
to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for
details.
