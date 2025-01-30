from fastapi import FastAPI, HTTPException
from pocketbase import PocketBase
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware

# Initialize PocketBase client
pb = PocketBase('http://pocketbase:8090')

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


### UTILS

def serialize_store(store) -> Dict:
    """Extract id and name from a store record"""
    return {
        "id": store.id,
        "name": store.name
    }
