# zugzbot-v2 (FastAPI)

Backend FastAPI bootstrapped por el arnés SDD.

## Quickstart

```bash
# Con pip (con o sin venv activo)
pip install -e ".[dev]"
uvicorn src.main:app --reload --port 8000

# Con uv (si está disponible)
uv sync
uv run uvicorn src.main:app --reload --port 8000
```

## Tests

```bash
python -m pytest
# o
pytest
```

## Lint + format

```bash
ruff check .
ruff format .
```

## Docker

```bash
docker compose up -d --build
curl http://localhost:8000/health
```

## Estructura

```
src/
├── main.py             # FastAPI app
├── core/config.py      # Settings (pydantic-settings)
├── routers/            # Endpoints (vacío por defecto)
├── schemas/            # Pydantic models (vacío por defecto)
└── tests/              # Pytest suite
```

## Stack

- Python 3.11+
- FastAPI 0.115+
- Pydantic 2.10+ + pydantic-settings
- Uvicorn 0.32+ (con `[standard]`)
- Pytest 8 + pytest-asyncio
- Ruff 0.8+ (lint + format)

Ver `pyproject.toml` para versiones pinneadas.
