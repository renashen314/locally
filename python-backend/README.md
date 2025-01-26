# LocalMart Backend

This is the backend API for the LocalMart application.

## Setup

1. Make sure you have Python 3.9+ and Poetry installed
2. Install dependencies:
   ```bash
   poetry install
   ```

## Running the Development Server

Start the development server with:
```bash
poetry run uvicorn localmart_backend.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access:
- Interactive API docs (Swagger UI): http://localhost:8000/docs
- Alternative API docs (ReDoc): http://localhost:8000/redoc
