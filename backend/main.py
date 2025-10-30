import os
from fastapi import FastAPI, HTTPException, APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
from bson import ObjectId
from contextlib import asynccontextmanager
from marshmallow import ValidationError

from backend.src.models import (
    UserSchema,
    UserInSchema,
    UserOutSchema,
    LoginRequestSchema,
    TodoInSchema,
    TodoUpdateSchema,
    TodoOutSchema,
)
from backend.src.security import (
    get_password_hash,
    create_access_token,
    verify_password,
    get_current_user,
)
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Attempting to connect to MongoDB...")
    try:
        app.mongodb_client = AsyncIOMotorClient(
            os.getenv("MONGODB_URI"), serverSelectionTimeoutMS=5000
        )
        app.mongodb = app.mongodb_client["todoapp"]
        await app.mongodb_client.admin.command("ping")
        print("Successfully connected to MongoDB.")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

    yield

    # Shutdown
    app.mongodb_client.close()
    print("MongoDB connection closed.")


app = FastAPI(lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_router = APIRouter()


@auth_router.post("/signup")
async def signup(request: Request):
    try:
        user_in = UserInSchema().load(await request.json())
    except ValidationError as err:
        raise HTTPException(status_code=400, detail=err.messages)

    user = await app.mongodb.users.find_one({"email": user_in["email"]})
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_in["password"])
    user_data = {"name": user_in["name"], "email": user_in["email"], "hashed_password": hashed_password}

    new_user = await app.mongodb.users.insert_one(user_data)
    created_user = await app.mongodb.users.find_one({"_id": new_user.inserted_id})

    return UserOutSchema().dump(created_user)


@auth_router.post("/login")
async def login(request: Request):
    try:
        login_request = LoginRequestSchema().load(await request.json())
    except ValidationError as err:
        raise HTTPException(status_code=400, detail=err.messages)

    user = await app.mongodb.users.find_one({"email": login_request["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(login_request["password"], user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token(data={"sub": user["email"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOutSchema().dump(user),
    }


app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

todo_router = APIRouter()


@todo_router.post("/")
async def create_todo(request: Request, current_user: dict = Depends(get_current_user)):
    try:
        todo_in = TodoInSchema().load(await request.json())
    except ValidationError as err:
        raise HTTPException(status_code=400, detail=err.messages)

    todo_data = todo_in
    todo_data["user_id"] = str(current_user["_id"])
    todo_data["completed"] = False

    try:
        new_todo = await app.mongodb.todos.insert_one(todo_data)
        created_todo = await app.mongodb.todos.find_one({"_id": new_todo.inserted_id})
        return TodoOutSchema().dump(created_todo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create todo: {e}")


@todo_router.get("/")
async def get_todos(current_user: dict = Depends(get_current_user)):
    try:
        todos = (
            await app.mongodb.todos.find({"user_id": str(current_user["_id"])}).to_list(100)
        )
        return TodoOutSchema(many=True).dump(todos)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get todos: {e}")


@todo_router.put("/{todo_id}")
async def update_todo(
    todo_id: str, request: Request, current_user: dict = Depends(get_current_user)
):
    try:
        todo_update = TodoUpdateSchema().load(await request.json())
    except ValidationError as err:
        raise HTTPException(status_code=400, detail=err.messages)

    try:
        todo = await app.mongodb.todos.find_one(
            {"_id": ObjectId(todo_id), "user_id": str(current_user["_id"])}
        )
        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")

        if todo_update:
            await app.mongodb.todos.update_one(
                {"_id": ObjectId(todo_id)}, {"$set": todo_update}
            )

        updated_todo = await app.mongodb.todos.find_one({"_id": ObjectId(todo_id)})
        return TodoOutSchema().dump(updated_todo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update todo: {e}")


@todo_router.delete("/{todo_id}", status_code=204)
async def delete_todo(todo_id: str, current_user: dict = Depends(get_current_user)):
    try:
        todo = await app.mongodb.todos.find_one(
            {"_id": ObjectId(todo_id), "user_id": str(current_user["_id"])}
        )
        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")

        await app.mongodb.todos.delete_one({"_id": ObjectId(todo_id)})
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete todo: {e}")


app.include_router(todo_router, prefix="/api/v1/todos", tags=["todos"])


@app.get("/api/v1/healthz")
async def health_check():
    try:
        # Check the database connection by pinging the admin database
        await app.mongodb_client.admin.command("ping")
        return {"status": "ok", "db_connection": "ok"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Database connection failed: {e}"
        )
