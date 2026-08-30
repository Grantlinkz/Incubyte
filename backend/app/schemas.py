from datetime import datetime
from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.constants.fx_rates import SUPPORTED_CURRENCIES

T = TypeVar("T")


class EmployeeBase(BaseModel):
    """Base schema containing core employee attributes."""

    name: str = Field(min_length=1, max_length=255, description="Full name of the employee")
    email: EmailStr = Field(description="Unique business email address")
    job_title: str = Field(min_length=1, max_length=255, description="Job title / role")
    department: str = Field(min_length=1, max_length=100, description="Department name")
    country: str = Field(min_length=1, max_length=100, description="Operating country")
    employment_type: str = Field(default="Full-time", max_length=50, description="Employment type (e.g. Full-time, Part-time, Contractor)")
    base_salary: float = Field(gt=0, description="Annual base salary in local currency (must be positive)")
    bonus: float = Field(default=0.0, ge=0, description="Annual bonus in local currency (cannot be negative)")
    currency: str = Field(min_length=3, max_length=10, description="ISO 3-letter currency code (e.g. USD, EUR, GBP, INR)")
    status: str = Field(default="Active", max_length=50, description="Current employment status (e.g. Active, On Leave, Terminated)")

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Ensure currency code is supported in FX rates conversion matrix."""
        currency_upper = v.upper().strip()
        if currency_upper not in SUPPORTED_CURRENCIES:
            raise ValueError(
                f"Unsupported currency: '{v}'. Supported currencies: {sorted(SUPPORTED_CURRENCIES)}"
            )
        return currency_upper


class EmployeeCreate(EmployeeBase):
    """Schema for creating a new employee."""

    pass


class EmployeeUpdate(BaseModel):
    """Schema for updating an existing employee (all fields optional)."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = Field(default=None)
    job_title: str | None = Field(default=None, min_length=1, max_length=255)
    department: str | None = Field(default=None, min_length=1, max_length=100)
    country: str | None = Field(default=None, min_length=1, max_length=100)
    employment_type: str | None = Field(default=None, max_length=50)
    base_salary: float | None = Field(default=None, gt=0)
    bonus: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    status: str | None = Field(default=None, max_length=50)

    @field_validator("currency")
    @classmethod
    def validate_currency_optional(cls, v: str | None) -> str | None:
        """Ensure currency code is supported if provided."""
        if v is None:
            return None
        currency_upper = v.upper().strip()
        if currency_upper not in SUPPORTED_CURRENCIES:
            raise ValueError(
                f"Unsupported currency: '{v}'. Supported currencies: {sorted(SUPPORTED_CURRENCIES)}"
            )
        return currency_upper


class EmployeeResponse(EmployeeBase):
    """Complete employee response schema including computed USD salary and timestamps."""

    id: int
    salary_usd: float
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic pagination response wrapper."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
