from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal


class AnalyticsResponse(BaseModel):
    period_start: date
    period_end: date
    total_revenue: Decimal
    total_quantity: int
    total_orders: int
    average_order_value: Decimal


class SalesPerformanceResponse(BaseModel):
    period: str
    data_points: List[Dict[str, Any]]
    total_revenue: Decimal
    revenue_growth: Optional[Decimal] = None
    top_products: List[Dict[str, Any]]
    top_pharmacies: List[Dict[str, Any]]


class MarketShareResponse(BaseModel):
    category: str
    market_share_percentage: Decimal
    our_revenue: Decimal
    total_market_size: Decimal
    market_rank: Optional[int] = None
    competitor_count: int
    trend_direction: Optional[str] = None


class TrendAnalysisResponse(BaseModel):
    analysis_name: str
    trend_direction: Optional[str] = None
    trend_strength: Optional[Decimal] = None
    seasonal_pattern: bool
    forecast_data: Optional[Dict[str, Any]] = None
    analysis_period: str
    

class DashboardSummaryResponse(BaseModel):
    total_revenue: Decimal
    revenue_growth: Decimal
    total_orders: int
    orders_growth: Decimal
    active_pharmacies: int
    top_products: List[Dict[str, Any]]
    recent_sales: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]
    alerts: List[str]


class AnalyticsFilters(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    period: Optional[str] = "monthly"  # daily, weekly, monthly, quarterly
    product_ids: Optional[List[int]] = None
    pharmacy_ids: Optional[List[int]] = None
    categories: Optional[List[str]] = None
    territories: Optional[List[str]] = None
    compare_with_previous: bool = True