# 1️⃣ Executive Summary
- This document outlines the development plan for a FastAPI backend to support a simple To-Do application.
- The backend will provide user authentication and CRUD functionality for managing To-Do items.
- Key constraints include using Python 3.13, FastAPI, MongoDB Atlas with Motor, Pydantic v2, no Docker, and a single `main` branch Git workflow.
- Development will follow a dynamic sprint plan, with manual testing required after every task.

# 2️⃣ In-Scope & Success Criteria
- **In-Scope Features:**
  - User registration (name, email, password).
  - User login and logout (JWT-based).
  - Create, Read, Update, Delete (CRUD) To-Do items for authenticated users.
  - Mark To-Do items as complete or active.
  - Data isolation between users.
- **Success Criteria:**
  - All frontend features (Auth and To-Do management) are fully functional with the backend.
  - All task-level manual tests pass via the frontend UI.
  - Each sprint's code is committed and pushed to the `main` branch after successful testing.

# 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Envelope:** `{ "error": "message" }`

---

### Authentication Endpoints

- **`POST /api/v1/auth/signup`**
  - **Purpose:** Register a new user.
  - **Request Body:** `{ "name": "string", "email": "string", "password": "string" }`
  - **Response Body:** `{ "token": "string", "user": { "id": "string", "name": "string", "email": "string" } }`
  - **Validation:** `name` and `email` are required. `email` must be unique. `password` must be at least 6 characters.

- **`POST /api/v1/auth/login`**
  - **Purpose:** Log in an existing user.
  - **Request Body:** `{ "email": "string", "password": "string" }`
  - **Response Body:** `{ "token": "string", "user": { "id": "string", "name": "string", "email": "string" } }`
  - **Validation:** `email` and `password` are required.

- **`GET /api/v1/auth/me`**
  - **Purpose:** Get the current authenticated user's details.
  - **Request Header:** `Authorization: Bearer <token>`
  - **Response Body:** `{ "id": "string", "name": "string", "email": "string" }`
  - **Validation:** Requires a valid JWT.

### To-Do Endpoints

- **`GET /api/v1/todos`**
  - **Purpose:** Get all To-Do items for the authenticated user.
  - **Request Header:** `Authorization: Bearer <token>`
  - **Response Body:** `[{ "id": "string", "title": "string", "description": "string", "completed": "boolean", "userId": "string" }]`

- **`POST /api/v1/todos`**
  - **Purpose:** Create a new To-Do item.
  - **Request Header:** `Authorization: Bearer <token>`
  - **Request Body:** `{ "title": "string", "description": "string" }`
  - **Response Body:** `{ "id": "string", "title": "string", "description": "string", "completed": false, "userId": "string" }`
  - **Validation:** `title` is required.

- **`PUT /api/v1/todos/{todo_id}`**
  - **Purpose:** Update an existing To-Do item.
  - **Request Header:** `Authorization: Bearer <token>`
  - **Request Body:** `{ "title": "string", "description": "string", "completed": "boolean" }`
  - **Response Body:** `{ "id": "string", "title": "string", "description": "string", "completed": "boolean", "userId": "string" }`
  - **Validation:** `title` is required if provided. User must own the todo.

- **`DELETE /api/v1/todos/{todo_id}`**
  - **Purpose:** Delete a To-Do item.
  - **Request Header:** `Authorization: Bearer <token>`
  - **Response Body:** `{ "message": "Todo deleted successfully" }`
  - **Validation:** User must own the todo.

# 4️⃣ Data Model (MongoDB Atlas)

- **Collection: `users`**
  - `_id`: ObjectId (auto-generated)
  - `name`: string, required
  - `email`: string, required, unique
  - `hashed_password`: string, required
  - **Example Document:**
    ```json
    {
      "_id": "ObjectId('...')",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "hashed_password": "..."
    }
    ```

- **Collection: `todos`**
  - `_id`: ObjectId (auto-generated)
  - `title`: string, required
  - `description`: string, optional, default: ""
  - `completed`: boolean, required, default: false
  - `user_id`: ObjectId, required, ref: 'users'
  - **Example Document:**
    ```json
    {
      "_id": "ObjectId('...')",
      "title": "My first todo",
      "description": "This is a description.",
      "completed": false,
      "user_id": "ObjectId('...')"
    }
    ```

# 5️⃣ Frontend Audit & Feature Map

- **Route: `/` (Auth Page - `Auth.tsx`)**
  - **Purpose:** User registration and login.
  - **Data Needed:** User `name`, `email`, `password`.
  - **Endpoints:** `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`
  - **Models:** `users`
  - **Auth:** Public

- **Route: `/todos` (Todo App Page - `TodoApp.tsx`)**
  - **Purpose:** Display, create, update, and delete To-Do items.
  - **Data Needed:** List of user's todos.
  - **Endpoints:** `GET /api/v1/todos`, `POST /api/v1/todos`, `PUT /api/v1/todos/{id}`, `DELETE /api/v1/todos/{id}`
  - **Models:** `todos`
  - **Auth:** Required

# 6️⃣ Configuration & ENV Vars
- `APP_ENV`: "development"
- `PORT`: 8000
- `MONGODB_URI`: "mongodb+srv://abbasrizvi_db_user:12345678!@#$%^&*@todo.pgunvip.mongodb.net/?appName=todo"
- `JWT_SECRET`: A long, random, secret string for signing tokens.
- `JWT_EXPIRES_IN`: 3600 (1 hour in seconds)
- `CORS_ORIGINS`: The frontend URL (e.g., "http://localhost:5173")

# 7️⃣ Testing Strategy (Manual via Frontend)
- All backend functionality will be validated exclusively through the frontend UI.
- Every task in the sprint plan includes a specific **Manual Test Step** and a **User Test Prompt**.
- After all tasks in a sprint are completed and pass their manual tests, the code will be committed and pushed to the `main` branch.
- If any test fails, the issue must be fixed and re-tested before pushing.

# 8️⃣ Dynamic Sprint Plan & Backlog

---

## S0 – Environment Setup & Frontend Connection

- **Objectives:**
  - Create a basic FastAPI application skeleton with `/api/v1` base path and a `/healthz` endpoint.
  - Establish a connection to the MongoDB Atlas database using the `MONGODB_URI`.
  - Implement the `/healthz` endpoint to perform a database ping and confirm connectivity.
  - Configure CORS to allow requests from the frontend application.
  - Replace all `localStorage` logic in the frontend with API calls to the new backend endpoints.
  - Initialize a Git repository, set the default branch to `main`, and create a `.gitignore` file.
- **Definition of Done:**
  - The FastAPI backend runs locally without errors and successfully connects to MongoDB Atlas.
  - The `/healthz` endpoint returns a success status including DB connection status.
  - The frontend application can make requests to the backend.
  - The initial project structure is pushed to the `main` branch on GitHub.
- **Tasks:**
  - **Task 1: Setup FastAPI Project**
    - **Manual Test Step:** Run the backend server. Access `http://localhost:8000/healthz` in a browser.
    - **Expected Result:** See a JSON response like `{ "status": "ok", "db_connection": "ok" }`.
    - **User Test Prompt:** "Start the backend server and navigate to the `/healthz` URL to confirm it's running and connected to the database."
  - **Task 2: Connect Frontend to Backend**
    - **Manual Test Step:** Run both frontend and backend. Open the browser's developer tools. Refresh the frontend application.
    - **Expected Result:** No CORS errors in the console. The app should load, but with no data.
    - **User Test Prompt:** "Run the frontend and backend. Open the app and check the browser console to ensure there are no CORS errors."
- **Post-sprint:**
  - Commit and push to `main`.

---

## S1 – Basic Auth (Signup / Login / Logout)

- **Objectives:**
  - Implement JWT-based user authentication for signup and login.
  - Secure the To-Do endpoints, allowing access only to authenticated users.
  - Ensure passwords are securely hashed (e.g., with Argon2 or bcrypt) before storing.
- **User Stories:**
  - As a new user, I want to register for an account.
  - As a registered user, I want to log in to my account.
  - As a logged-in user, I want to log out.
- **Definition of Done:**
  - The entire authentication flow (signup, login, logout) works correctly from the frontend.
  - Protected routes return a 401/403 error if accessed without a valid token.
  - A user's JWT is stored on the client-side upon login.
- **Tasks:**
  - **Task 1: Implement User Signup**
    - **Manual Test Step:** On the frontend's registration page, fill in the name, email, and password fields and submit.
    - **Expected Result:** The user is created in the `users` collection in MongoDB, and the frontend redirects to the `/todos` page.
    - **User Test Prompt:** "Create a new account using the registration form and verify you are redirected to the main To-Do page."
  - **Task 2: Implement User Login**
    - **Manual Test Step:** On the frontend's login page, enter the credentials of a registered user and submit.
    - **Expected Result:** The user is successfully logged in, and the frontend redirects to the `/todos` page.
    - **User Test Prompt:** "Log in with the account you created. You should be taken to the To-Do list page."
  - **Task 3: Implement User Logout**
    - **Manual Test Step:** While logged in, click the "Logout" button.
    - **Expected Result:** The user is logged out, and the frontend redirects to the login page. Attempting to access `/todos` should fail.
    - **User Test Prompt:** "Click the logout button. Then, try to go back to the To-Do page; you should be redirected to the login screen."
- **Post-sprint:**
  - Commit and push to `main`.

---

## S2 – To-Do Item Management (CRUD)

- **Objectives:**
  - Implement all CRUD operations for To-Do items.
  - Ensure that all To-Do operations are scoped to the currently authenticated user.
- **User Stories:**
  - As a user, I want to create a new To-Do item.
  - As a user, I want to view all my To-Do items.
  - As a user, I want to update a To-Do item's title, description, or completion status.
  - As a user, I want to delete a To-Do item.
- **Definition of Done:**
  - A logged-in user can create, view, update, and delete their own To-Do items through the frontend.
  - A user cannot see or modify To-Do items belonging to another user.
- **Tasks:**
  - **Task 1: Create & View To-Dos**
    - **Manual Test Step:** Log in. Use the form to add a new To-Do item.
    - **Expected Result:** The new To-Do appears in the list. The item is saved in the `todos` collection in MongoDB with the correct `user_id`.
    - **User Test Prompt:** "Log in and add a new task. Confirm it appears in your list."
  - **Task 2: Update To-Do (Title, Description, Status)**
    - **Manual Test Step:** Log in. Click the checkbox to mark a To-Do as complete. Then, click the edit button to change its title and description.
    - **Expected Result:** The To-Do's appearance changes to reflect its completed status. The title and description update in the list. Changes are reflected in the database.
    - **User Test Prompt:** "Mark a task as complete and see it update. Then, edit the text of a task and save it."
  - **Task 3: Delete To-Do**
    - **Manual Test Step:** Log in. Click the trash icon next to a To-Do item and confirm the deletion.
    - **Expected Result:** The To-Do item is removed from the list on the frontend and deleted from the database.
    - **User Test Prompt:** "Delete a task from your list and confirm it is removed."
- **Post-sprint:**
  - Commit and push to `main`.