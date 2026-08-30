"""Constants package exporting FX rates and organizational domain metadata."""

from app.constants.fx_rates import (
    COUNTRY_CURRENCY_MAP,
    COUNTRY_SALARY_RANGES,
    DEPARTMENTS_AND_ROLES,
    EMPLOYMENT_TYPES,
    FX_RATES,
    STATUSES,
    SUPPORTED_CURRENCIES,
    calculate_salary_usd,
    convert_to_usd,
)

__all__ = [
    "COUNTRY_CURRENCY_MAP",
    "COUNTRY_SALARY_RANGES",
    "DEPARTMENTS_AND_ROLES",
    "EMPLOYMENT_TYPES",
    "FX_RATES",
    "STATUSES",
    "SUPPORTED_CURRENCIES",
    "calculate_salary_usd",
    "convert_to_usd",
]
