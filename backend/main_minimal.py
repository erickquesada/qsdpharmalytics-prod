from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="QSDPharmalitics API v2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "🏥 QSDPharmalitics API v2.0", 
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/api/v1/products")
def products():
    return [
        {"id": 1, "name": "Dipirona 500mg", "price": 2.50},
        {"id": 2, "name": "Amoxicillin 250mg", "price": 8.75}
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)