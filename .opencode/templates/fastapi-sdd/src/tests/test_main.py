"""Smoke tests for the FastAPI app entry point."""
from fastapi.testclient import TestClient


def test_health_endpoint_returns_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "env" in body


def test_app_metadata() -> None:
    from src.main import app

    assert app.title
    assert app.version
