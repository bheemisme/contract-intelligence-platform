from dotenv import load_dotenv
from config import log_config
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api import contract_router, user_router

import logging
import uvicorn
import os

# import contracts.schemas as schemas
load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(contract_router.router)
app.include_router(user_router.router)

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
