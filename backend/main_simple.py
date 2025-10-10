from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://pharmalitics_user:pharmalitics123@postgres:5432/pharmalitics")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(20), default="sales_rep")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(255))
    price = Column(Numeric(10, 2))
    category = Column(String(100))
    is_active = Column(Boolean, default=True)

class Pharmacy(Base):
    __tablename__ = "pharmacies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    city = Column(String(100))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer)
    pharmacy_id = Column(Integer)
    quantity = Column(Integer)
    total_amount = Column(Numeric(10, 2))
    sale_date = Column(DateTime, default=datetime.utcnow)

# Schemas
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    code: str
    name: str
    price: float
    category: str
    class Config:
        from_attributes = True

# FastAPI App
app = FastAPI(
    title="QSDPharmalitics API v2.0",
    description="Pharmaceutical Analytics Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)

# Routes
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
        "database": "connected"
    }

@app.get("/api/v1/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active == True).all()
    return users

@app.get("/api/v1/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).all()
    return products

@app.post("/api/v1/init")
def initialize_data(db: Session = Depends(get_db)):
    # Create admin user
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@pharmalitics.com",
            hashed_password="admin_hashed",
            role="admin"
        )
        db.add(admin)
    
    # Create sample products
    if not db.query(Product).first():
        products = [
            Product(code="DIP500", name="Dipirona 500mg", price=2.50, category="Analgesics"),
            Product(code="AMX250", name="Amoxicillin 250mg", price=8.75, category="Antibiotics")
        ]
        for product in products:
            db.add(product)
    
    # Create sample pharmacies
    if not db.query(Pharmacy).first():
        pharmacies = [
            Pharmacy(name="Farmácia Central", city="São Paulo", phone="(11) 1234-5678"),
            Pharmacy(name="Drogaria Popular", city="Rio de Janeiro", phone="(21) 8765-4321")
        ]
        for pharmacy in pharmacies:
            db.add(pharmacy)
    
    db.commit()
    return {"message": "Database initialized with sample data"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)