# Import all models here for Alembic auto-generation
from .user import User
from .sales import Sale
from .products import Product, ProductCategory
from .pharmacies import Pharmacy
from .analytics import (
    SalesMetric,
    MarketShareData,
    TrendAnalysis,
    ReportGeneration
)

__all__ = [
    "User",
    "Sale", 
    "Product",
    "ProductCategory",
    "Pharmacy",
    "SalesMetric",
    "MarketShareData", 
    "TrendAnalysis",
    "ReportGeneration"
]