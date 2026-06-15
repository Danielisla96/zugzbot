# zugzbot-v2 (FastAPI)

Backend FastAPI bootstrapped por el arnés SDD.

## Quickstart

```bash
# Con uv (recomendado)
uv sync
uv run uvicorn app.main:app --reload --port 8000

# O con pip
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## Tests

```bash
uv run pytest
# o
pytest
```

## Lint + format

```bash
uv run ruff check .
uv run ruff format .
```

## Docker

```bash
docker compose up -d --build
curl http://localhost:8000/health
```

## Estructura

```
src/
├── app/
│   ├── main.py             # FastAPI app
│   ├── core/config.py      # Settings (pydantic-settings)
│   ├── routers/            # Endpoints (vacío por defecto)
│   └── schemas/            # Pydantic models (vacío por defecto)
└── tests/                  # Pytest suite
```

## Stack

- Python 3.11+
- FastAPI 0.115+
- Pydantic 2.10+ + pydantic-settings
- Uvicorn 0.32+ (con `[standard]`)
- Pytest 8 + pytest-asyncio
- Ruff 0.8+ (lint + format)

Ver `.opencode/templates/fastapi-sdd/pyproject.toml` para versiones pinneadas.
