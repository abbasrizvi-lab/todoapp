import pytest
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager
from backend.main import app
import os

# Set the base URL for the API
BASE_URL = "http://test/api/v1"

# Create a test user
test_user = {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "testpassword"
}

# Create a test todo
test_todo = {
    "title": "Test Todo",
    "description": "This is a test todo"
}

# Store the access token
access_token = ""

@pytest.fixture(autouse=True)
def setup_db():
    async def _setup_db():
        async with LifespanManager(app):
            await app.mongodb.users.delete_many({})
            await app.mongodb.todos.delete_many({})
    
    import asyncio
    asyncio.run(_setup_db())
    yield

@pytest.mark.asyncio
async def test_health_check():
    """
    Test the health check endpoint.
    """
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            response = await ac.get("/healthz")
            assert response.status_code == 200
            assert response.json() == {"status": "ok", "db_connection": "ok"}

@pytest.mark.asyncio
async def test_signup():
    """
    Test the signup endpoint.
    """
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            response = await ac.post("/auth/signup", json=test_user)
            assert response.status_code == 200
            assert response.json()["email"] == test_user["email"]

@pytest.mark.asyncio
async def test_login():
    """
    Test the login endpoint.
    """
    global access_token
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            response = await ac.post("/auth/login", json=test_user)
            assert response.status_code == 200
            assert "access_token" in response.json()
            access_token = response.json()["access_token"]

@pytest.mark.asyncio
async def test_create_todo():
    """
    Test the create todo endpoint.
    """
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = await ac.post("/todos/", json=test_todo, headers=headers)
            assert response.status_code == 200
            assert response.json()["title"] == test_todo["title"]

@pytest.mark.asyncio
async def test_get_todos():
    """
    Test the get todos endpoint.
    """
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = await ac.get("/todos/", headers=headers)
            assert response.status_code == 200
            assert len(response.json()) > 0

@pytest.mark.asyncio
async def test_update_todo():
    """
    Test the update todo endpoint.
    """
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = await ac.get("/todos/", headers=headers)
            todo_id = response.json()["id"]
            updated_todo = {"title": "Updated Test Todo"}
            response = await ac.put(f"/todos/{todo_id}", json=updated_todo, headers=headers)
            assert response.status_code == 200
            assert response.json()["title"] == updated_todo["title"]

@pytest.mark.asyncio
async def test_delete_todo():
    """
    Test the delete todo endpoint.
    """
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = await ac.get("/todos/", headers=headers)
            todo_id = response.json()["id"]
            response = await ac.delete(f"/todos/{todo_id}", headers=headers)
            assert response.status_code == 204