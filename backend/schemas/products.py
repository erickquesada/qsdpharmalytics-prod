from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ProductCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None


class ProductCategoryCreate(ProductCategoryBase):
    pass


class ProductCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductCategoryResponse(ProductCategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    brand: Optional[str] = Field(None, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    active_ingredient: Optional[str] = Field(None, max_length=255)
    dosage: Optional[str] = Field(None, max_length=100)
    package_size: Optional[str] = Field(None, max_length=50)
    unit_price: Optional[Decimal] = Field(None, gt=0)
    suggested_retail_price: Optional[Decimal] = Field(None, gt=0)
    cost_price: Optional[Decimal] = Field(None, gt=0)
    category_id: int
    therapeutic_class: Optional[str] = Field(None, max_length=100)
    controlled_substance: bool = False
    prescription_required: bool = False
    ndc_number: Optional[str] = Field(None, max_length=20)
    approval_date: Optional[datetime] = None
    expiry_monitoring: bool = True
    is_available: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    active_ingredient: Optional[str] = Field(None, max_length=255)
    dosage: Optional[str] = Field(None, max_length=100)
    package_size: Optional[str] = Field(None, max_length=50)
    unit_price: Optional[Decimal] = Field(None, gt=0)
    suggested_retail_price: Optional[Decimal] = Field(None, gt=0)
    cost_price: Optional[Decimal] = Field(None, gt=0)
    category_id: Optional[int] = None
    therapeutic_class: Optional[str] = Field(None, max_length=100)
    controlled_substance: Optional[bool] = None
    prescription_required: Optional[bool] = None
    ndc_number: Optional[str] = Field(None, max_length=20)
    approval_date: Optional[datetime] = None
    expiry_monitoring: Optional[bool] = None
    is_available: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Related data
    category_name: Optional[str] = None
    full_description: Optional[str] = None
    
    class Config:
        from_attributes = True