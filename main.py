from contextlib import asynccontextmanager
from dotenv import load_dotenv
from config import log_config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import contract_router, user_router, agent_router
from connectors import chromadb_connector, firestore_connector, gcs_connector

import logging
import uvicorn
import os

load_dotenv()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.firestore = firestore_connector.get_firestore_connection()
    app.state.bucket = gcs_connector.get_storage_bucket()
    app.state.chromadb = chromadb_connector.get_chroma_client()
    yield
    # optional cleanup


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://cip-client-dot-contract-intelligence-platform.el.r.appspot.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Hello from contract-intelligence-platform!"}

app.include_router(contract_router.router)
app.include_router(user_router.router)
app.include_router(agent_router.router)


def main():

    reload = False
    port = int(os.environ.get("PORT", 8000))
    

    if os.environ.get("ENV") == "dev":
        reload = True
        load_dotenv(dotenv_path=".env.dev")
    else:
        load_dotenv(dotenv_path=".env.prod")

    print("Hello from contract-intelligence-platform!")

    uvicorn.run(
        "main:app",
        reload=reload,
        reload_dirs=[
            ".",
            "api",
            "database",
            "contracts",
            "agent",
            "config",
            "model",
            "user",
            "sessions",
            "connectors",
        ],
        log_config=log_config.LOGGING_CONFIG,
        port=port,        
    )


if __name__ == "__main__":
    main()
