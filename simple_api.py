#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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
        "version": "2.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)