from fastapi import FastAPI

app = FastAPI(
    title="LocalMart Backend",
    description="Backend API for LocalMart application",
    version="0.1.0"
)

@app.get("/")
async def hello_world():
    return {"message": "Hello World from LocalMart Backend!"} 