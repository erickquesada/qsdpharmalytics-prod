from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class ReportFormat(str, Enum):
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"


class ReportType(str, Enum):
    SALES_SUMMARY = "sales_summary"
    MONTHLY_REPORT = "monthly_report"
    QUARTERLY_REPORT = "quarterly_report"
    ANNUAL_REPORT = "annual_report"
    PRODUCT_ANALYSIS = "product_analysis"
    MARKET_SHARE = "market_share"
    PERFORMANCE_DASHBOARD = "performance_dashboard"
    COMPARATIVE_ANALYSIS = "comparative_analysis"


class ReportRequest(BaseModel):
    report_name: str = Field(..., min_length=1, max_length=255)
    report_type: ReportType
    format_type: ReportFormat
    date_range_start: date
    date_range_end: date
    filters: Optional[Dict[str, Any]] = None
    include_charts: bool = True
    include_summary: bool = True
    email_recipients: Optional[List[str]] = None


class ReportResponse(BaseModel):
    id: int
    report_name: str
    report_type: ReportType
    format_type: ReportFormat
    status: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    download_count: int
    generation_date: datetime
    generated_by: str
    date_range_start: date
    date_range_end: date
    total_records: int
    generation_duration: Optional[Decimal] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    size: int
    pages: int