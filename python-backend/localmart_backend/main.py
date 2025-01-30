from fastapi import FastAPI, HTTPException, Response
from pocketbase import PocketBase
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize PocketBase client
pb = PocketBase('http://pocketbase:8090')

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    email: str
    password: str
    passwordConfirm: str
    name: str

app = FastAPI(
    title="LocalMart Backend",
    description="Backend API for LocalMart application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Print all routes on startup with clickable URLs"""
    host = "http://localhost:8000"  # Default FastAPI host
    print("\n🚀 Available routes:")
    for route in app.routes:
        if hasattr(route, "methods"):
            methods = ", ".join(route.methods)
            url = f"{host}{route.path}"
            print(f"{methods:20} {url}")
    print()

### ROUTES

@app.get("/", response_model=Dict)
async def hello_world():
    return {"message": "Hello World from LocalMart Backend!"}

@app.get("/api/v0/stores", response_model=List[Dict])
async def list_stores():
    """List all stores"""
    try:
        # Get all records from the stores collection
        stores = pb.collection('stores').get_list(1, 50)

        # Convert Record objects to simplified dictionaries
        return [serialize_store(store) for store in stores.items]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Issue fetching stores"
        )

@app.get("/api/v0/stores/{store_id}/items", response_model=List[Dict])
async def list_store_items(store_id: str):
    """List all items for a specific store"""
    try:
        # Get all records from the store_items collection for this store
        items = pb.collection('store_items').get_list(
            1, 50,
            query_params={
                "filter": f'store = "{store_id}"'
            }
        )

        # Convert Record objects to simplified dictionaries
        return [serialize_store_item(item) for item in items.items]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Issue fetching store items: {str(e)}"
        )

### AUTH ROUTES

@app.post("/api/v0/auth/signup", response_model=Dict)
async def signup(user: UserSignup):
    """Create a new user account"""
    try:
        # Create user record
        record = pb.collection('users').create({
            'email': user.email,
            'password': user.password,
            'passwordConfirm': user.passwordConfirm,
            'name': user.name,
            'username': user.email,  # Use email as username since PocketBase requires it
        })

        # After creation, authenticate to get the token
        auth_data = pb.collection('users').auth_with_password(
            user.email,
            user.password
        )

        return {
            "token": auth_data.token,
            "user": {
                "id": auth_data.record.id,
                "email": auth_data.record.email,
                "name": auth_data.record.name,
            }
        }
    except Exception as e:
        print(f"Signup error: {str(e)}")  # Add debug logging
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/api/v0/auth/login", response_model=Dict)
async def login(user: UserLogin):
    """Log in an existing user"""
    try:
        auth_data = pb.collection('users').auth_with_password(
            user.email,
            user.password
        )
        return {
            "token": auth_data.token,
            "user": {
                "id": auth_data.record.id,
                "email": auth_data.record.email,
                "name": auth_data.record.name,
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

### UTILS

def serialize_store(store) -> Dict:
    """Extract store fields from a store record"""
    return {
        "id": store.id,
        "name": store.name,
        "street_1": store.street_1,
        "street_2": store.street_2,
        "city": store.city,
        "state": store.state
    }

def serialize_store_item(item) -> Dict:
    """Extract item fields from a store item record"""
    return {
        "id": item.id,
        "name": item.name,
        "price": item.price
    }
