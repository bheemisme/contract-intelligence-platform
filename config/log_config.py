DEV_LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {"format": "%(asctime)s %(name)s %(levelname)s: %(message)s"}
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
        "rotfile": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": "logs/app.log",
            "maxBytes": 5_000_000,
            "backupCount": 3,
            "encoding": "utf8",
        },
    },
    "root": {"level": "DEBUG", "handlers": ["console", "rotfile"]},
    "loggers": {
        "api": {"level": "DEBUG", "propagate": True},
        "database": {"level": "DEBUG", "propagate": True},
        "contracts": {"level": "DEBUG", "propagate": True},
        "model": {"level": "DEBUG", "propagate": True},
        
        "uvicorn": {
            "level": "DEBUG",
            "handlers": ["console", "rotfile"],
            "propagate": False,
        },
        "uvicorn.error": {
            "level": "DEBUG",
            "handlers": ["console", "rotfile"],
            "propagate": False,
        },
        "uvicorn.access": {
            "level": "DEBUG",
            "handlers": ["console", "rotfile"],
            "propagate": False,
        },
    },
}



PROD_LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {"format": "%(asctime)s %(name)s %(levelname)s: %(message)s"}
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
        "rotfile": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": "logs/app.log",
            "maxBytes": 5_000_000,
            "backupCount": 3,
            "encoding": "utf8",
        },
    },
    "root": {"level": "INFO", "handlers": ["console", "rotfile"]},
    "loggers": {
        "api": {"level": "INFO", "propagate": True},
        "database": {"level": "INFO", "propagate": True},
        "contracts": {"level": "INFO", "propagate": True},
        "model": {"level": "INFO", "propagate": True},
        
        "uvicorn": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        "uvicorn.error": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        "uvicorn.access": {
            "level": "INFO",
            "handlers": ["access_console"],
            "propagate": False,
        },
    },
}
