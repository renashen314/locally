from fastapi import FastAPI, HTTPException, Response
from pocketbase import PocketBase
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
import datetime
import json

# Initialize PocketBase client
pb = PocketBase('http://pocketbase:8090')

# Get Uber Direct credentials from environment
UBER_CUSTOMER_ID = os.getenv('LOCALMART_UBER_DIRECT_CUSTOMER_ID')
UBER_CLIENT_ID = os.getenv('LOCALMART_UBER_DIRECT_CLIENT_ID')
UBER_CLIENT_SECRET = os.getenv('LOCALMART_UBER_DIRECT_CLIENT_SECRET')

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    email: str
    password: str
    passwordConfirm: str
    name: str

class DeliveryQuoteRequest(BaseModel):
    store_id: str
    item_id: str  # Add item_id to get the price
    delivery_address: Dict

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

@app.post("/api/v0/delivery/quote", response_model=Dict)
async def get_delivery_quote(request: DeliveryQuoteRequest):
    """Get a delivery quote from Uber Direct"""
    try:
        # First, get the store details and item details
        store = pb.collection('stores').get_one(request.store_id)
        item = pb.collection('store_items').get_one(request.item_id)

        # Convert price to cents for Uber Direct
        item_price_cents = int(item.price * 100)

        # Get Uber Direct OAuth token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://auth.uber.com/oauth/v2/token',
                data={
                    'client_id': UBER_CLIENT_ID,
                    'client_secret': UBER_CLIENT_SECRET,
                    'grant_type': 'client_credentials',
                    'scope': 'eats.deliveries'
                }
            )
            token_data = token_response.json()
            access_token = token_data['access_token']

            # Format addresses as required by Uber Direct
            pickup_address = {
                "street_address": [store.street_1],
                "city": store.city,
                "state": store.state,
                "zip_code": "11102",
                "country": "US"
            }

            dropoff_address = {
                "street_address": [request.delivery_address['street']],
                "city": request.delivery_address['city'],
                "state": request.delivery_address['state'],
                "zip_code": "11102",  # Hardcode to Astoria zip
                "country": "US"
            }

            # Get current time for delivery windows
            now = datetime.datetime.now(datetime.timezone.utc)
            pickup_ready = now + datetime.timedelta(minutes=20)
            pickup_deadline = pickup_ready + datetime.timedelta(minutes=30)
            dropoff_ready = pickup_deadline
            dropoff_deadline = dropoff_ready + datetime.timedelta(hours=1)

            # Get delivery quote
            quote_response = await client.post(
                f'https://api.uber.com/v1/customers/{UBER_CUSTOMER_ID}/delivery_quotes',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                },
                json={
                    "pickup_address": json.dumps(pickup_address),
                    "dropoff_address": json.dumps(dropoff_address),
                    "pickup_ready_dt": pickup_ready.isoformat(),
                    "pickup_deadline_dt": pickup_deadline.isoformat(),
                    "dropoff_ready_dt": dropoff_ready.isoformat(),
                    "dropoff_deadline_dt": dropoff_deadline.isoformat(),
                    "manifest_total_value": item_price_cents,
                    "pickup_phone_number": "+15555555555",
                    "dropoff_phone_number": "+15555555555"
                }
            )

            if quote_response.status_code != 200:
                print(f"Uber API error: {quote_response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to get delivery quote from Uber"
                )

            quote_data = quote_response.json()
            return {
                'fee': quote_data['fee'],
                'currency': quote_data['currency'],
                'estimated_delivery_time': quote_data['dropoff_eta']
            }

    except Exception as e:
        print(f"Delivery quote error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get delivery quote: {str(e)}"
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
