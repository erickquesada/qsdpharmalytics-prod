from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .sales import router as sales_router
from .products import router as products_router
from .pharmacies import router as pharmacies_router
from .analytics import router as analytics_router
from .reports import router as reports_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(sales_router, prefix="/sales", tags=["Sales"])
api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(pharmacies_router, prefix="/pharmacies", tags=["Pharmacies"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])