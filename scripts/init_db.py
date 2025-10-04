#!/usr/bin/env python3
"""
Database initialization script for QSDPharmalitics
Creates initial admin user and sample data
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from backend.database.base import engine, SessionLocal, Base
from backend.models import *
from backend.core.security import get_password_hash
from backend.models.user import User, UserRole
from backend.models.products import Product, ProductCategory
from backend.models.pharmacies import Pharmacy, PharmacyType, CustomerType
from decimal import Decimal
from datetime import datetime


def init_db():
    """Initialize database with sample data"""
    print("🔧 Initializing QSDPharmalitics database...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                email="admin@pharmalitics.com",
                username="admin",
                first_name="System",
                last_name="Administrator",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            print("👤 Created admin user: admin / admin123")
        
        # Create analyst user
        analyst_user = db.query(User).filter(User.username == "analyst").first()
        if not analyst_user:
            analyst_user = User(
                email="analyst@pharmalitics.com",
                username="analyst",
                first_name="John",
                last_name="Analyst",
                hashed_password=get_password_hash("analyst123"),
                role=UserRole.ANALYST,
                is_active=True,
                is_verified=True
            )
            db.add(analyst_user)
            print("📊 Created analyst user: analyst / analyst123")
        
        # Create sales rep user
        sales_user = db.query(User).filter(User.username == "salesrep").first()
        if not sales_user:
            sales_user = User(
                email="sales@pharmalitics.com",
                username="salesrep",
                first_name="Jane",
                last_name="Sales",
                hashed_password=get_password_hash("sales123"),
                role=UserRole.SALES_REP,
                is_active=True,
                is_verified=True
            )
            db.add(sales_user)
            print("💼 Created sales rep user: salesrep / sales123")
        
        # Create product categories
        categories = [
            {"name": "Analgesics", "description": "Pain relief medications"},
            {"name": "Antibiotics", "description": "Antimicrobial medications"},
            {"name": "Cardiovascular", "description": "Heart and circulation medications"},
            {"name": "Diabetes Care", "description": "Diabetes management medications"},
            {"name": "Respiratory", "description": "Respiratory system medications"},
            {"name": "Gastrointestinal", "description": "Digestive system medications"},
            {"name": "Vitamins & Supplements", "description": "Nutritional supplements"},
        ]
        
        for cat_data in categories:
            existing_cat = db.query(ProductCategory).filter(ProductCategory.name == cat_data["name"]).first()
            if not existing_cat:
                category = ProductCategory(**cat_data)
                db.add(category)
        
        db.commit()
        print("🏷️ Created product categories")
        
        # Create sample products
        analgesics_cat = db.query(ProductCategory).filter(ProductCategory.name == "Analgesics").first()
        antibiotics_cat = db.query(ProductCategory).filter(ProductCategory.name == "Antibiotics").first()
        
        products = [
            {
                "code": "DIP500",
                "name": "Dipirona 500mg",
                "brand": "Medley",
                "manufacturer": "Medley Pharma",
                "description": "Analgesic and antipyretic",
                "active_ingredient": "Dipyrone",
                "dosage": "500mg",
                "package_size": "20 tablets",
                "unit_price": Decimal("2.50"),
                "suggested_retail_price": Decimal("4.00"),
                "cost_price": Decimal("1.80"),
                "category_id": analgesics_cat.id,
                "therapeutic_class": "Analgesic",
                "ndc_number": "12345-678-90"
            },
            {
                "code": "AMX250",
                "name": "Amoxicillin 250mg",
                "brand": "Eurofarma",
                "manufacturer": "Eurofarma Labs",
                "description": "Broad spectrum antibiotic",
                "active_ingredient": "Amoxicillin",
                "dosage": "250mg",
                "package_size": "21 capsules",
                "unit_price": Decimal("8.75"),
                "suggested_retail_price": Decimal("12.50"),
                "cost_price": Decimal("6.20"),
                "category_id": antibiotics_cat.id,
                "therapeutic_class": "Antibiotic",
                "prescription_required": True,
                "ndc_number": "12345-679-01"
            }
        ]
        
        for prod_data in products:
            existing_prod = db.query(Product).filter(Product.code == prod_data["code"]).first()
            if not existing_prod:
                product = Product(**prod_data)
                db.add(product)
        
        db.commit()
        print("💊 Created sample products")
        
        # Create sample pharmacies
        pharmacies = [
            {
                "name": "Farmácia Central",
                "code": "FC001",
                "email": "central@farmacias.com",
                "phone": "(11) 1234-5678",
                "address_line1": "Rua das Flores, 123",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01234-567",
                "pharmacy_type": PharmacyType.INDEPENDENT,
                "customer_type": CustomerType.RETAIL,
                "credit_limit": Decimal("50000.00"),
                "payment_terms": "Net 30"
            },
            {
                "name": "Drogaria Popular",
                "code": "DP001",
                "email": "popular@drogas.com",
                "phone": "(11) 2345-6789",
                "address_line1": "Av. Paulista, 456",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01310-100",
                "pharmacy_type": PharmacyType.CHAIN,
                "chain_name": "Rede Popular",
                "customer_type": CustomerType.WHOLESALE,
                "credit_limit": Decimal("100000.00"),
                "payment_terms": "Net 15"
            }
        ]
        
        for pharm_data in pharmacies:
            existing_pharm = db.query(Pharmacy).filter(Pharmacy.code == pharm_data["code"]).first()
            if not existing_pharm:
                pharmacy = Pharmacy(**pharm_data)
                db.add(pharmacy)
        
        db.commit()
        print("🏪 Created sample pharmacies")
        
        print("✅ Database initialization completed!")
        print("\n📋 Sample Users Created:")
        print("   Admin:    admin / admin123")
        print("   Analyst:  analyst / analyst123") 
        print("   Sales:    salesrep / sales123")
        print("\n🚀 Ready to start QSDPharmalitics API!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()