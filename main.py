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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(contract_router.router)
app.include_router(user_router.router)
app.include_router(agent_router.router)

logger = logging.getLogger(__name__)


def main():

    if os.environ["ENV"] == "dev":
        LOG_CONFIG = log_config.DEV_LOGGING_CONFIG
    else:
        LOG_CONFIG = log_config.PROD_LOGGING_CONFIG

    print("Hello from contract-intelligence-platform!")

    uvicorn.run(
        "main:app",
        reload=True,
        reload_dirs=[
            "api",
            "database",
            "contracts",
            "agent",
            "config",
            "model",
            "main.py",
        ],
        log_config=LOG_CONFIG,
    )


if __name__ == "__main__":
    main()
