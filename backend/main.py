import os
from fastapi import FastAPI, HTTPException, APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
from bson import ObjectId
from contextlib import asynccontextmanager

from backend.src.models import UserIn, UserOut, LoginRequest, TodoIn, TodoUpdate, TodoOut, User
from backend.src.security import get_password_hash, create_access_token, verify_password, get_current_user
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Attempting to connect to MongoDB...")
    try:
        app.mongodb_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"), serverSelectionTimeoutMS=5000)
        app.mongodb = app.mongodb_client["todoapp"]
        await app.mongodb_client.admin.command('ping')
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

@auth_router.post("/signup", response_model=UserOut)
async def signup(user_in: UserIn):
    user = await app.mongodb.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user_data = user_in.dict(exclude={"password"})
    user_data["hashed_password"] = hashed_password
    
    new_user = await app.mongodb.users.insert_one(user_data)
    created_user = await app.mongodb.users.find_one({"_id": new_user.inserted_id})

    access_token = create_access_token(data={"sub": created_user["email"]})
    
    return UserOut(**created_user)

@auth_router.post("/login")
async def login(login_request: LoginRequest):
    user = await app.mongodb.users.find_one({"email": login_request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(login_request.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token(data={"sub": user["email"]})
    
    return {"access_token": access_token, "token_type": "bearer", "user": UserOut(**user)}

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

todo_router = APIRouter()

@todo_router.post("/", response_model=TodoOut)
async def create_todo(todo_in: TodoIn, current_user: User = Depends(get_current_user)):
    todo_data = todo_in.dict()
    todo_data['user_id'] = str(current_user['_id'])
    todo_data['completed'] = False
    
    try:
        new_todo = await app.mongodb.todos.insert_one(todo_data)
        created_todo = await app.mongodb.todos.find_one({"_id": new_todo.inserted_id})
        created_todo['id'] = str(created_todo['_id'])
        return TodoOut(**created_todo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create todo: {e}")

@todo_router.get("/", response_model=List[TodoOut])
async def get_todos(current_user: User = Depends(get_current_user)):
    try:
        todos = await app.mongodb.todos.find({"user_id": str(current_user['_id'])}).to_list(100)
        for todo in todos:
            todo['id'] = str(todo['_id'])
        return [TodoOut(**todo) for todo in todos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get todos: {e}")

@todo_router.put("/{todo_id}", response_model=TodoOut)
async def update_todo(todo_id: str, todo_update: TodoUpdate, current_user: User = Depends(get_current_user)):
    try:
        todo = await app.mongodb.todos.find_one({"_id": ObjectId(todo_id), "user_id": str(current_user['_id'])})
        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")
        
        update_data = todo_update.dict(exclude_unset=True)
        if update_data:
            await app.mongodb.todos.update_one({"_id": ObjectId(todo_id)}, {"$set": update_data})
        
        updated_todo = await app.mongodb.todos.find_one({"_id": ObjectId(todo_id)})
        updated_todo['id'] = str(updated_todo['_id'])
        return TodoOut(**updated_todo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update todo: {e}")

@todo_router.delete("/{todo_id}", status_code=204)
async def delete_todo(todo_id: str, current_user: User = Depends(get_current_user)):
    try:
        todo = await app.mongodb.todos.find_one({"_id": ObjectId(todo_id), "user_id": str(current_user['_id'])})
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
        await app.mongodb_client.admin.command('ping')
        return {"status": "ok", "db_connection": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)