"""Static foreign exchange (FX) conversion rates lookup matrix and organizational constants."""

FX_RATES: dict[str, float] = {
    "USD": 1.0,
    "EUR": 1.08,
    "GBP": 1.28,
    "INR": 0.012,
    "CAD": 0.74,
    "AUD": 0.66,
    "SGD": 0.75,
    "JPY": 0.0067,
    "NGN": 0.00067,
}

SUPPORTED_CURRENCIES: set[str] = set(FX_RATES.keys())

COUNTRY_CURRENCY_MAP: dict[str, str] = {
    "United States": "USD",
    "Germany": "EUR",
    "United Kingdom": "GBP",
    "India": "INR",
    "Canada": "CAD",
    "Australia": "AUD",
    "Singapore": "SGD",
    "Japan": "JPY",
    "Nigeria": "NGN",
}

# Localized base salary & bonus distribution ranges (min_base, max_base, min_bonus, max_bonus)
COUNTRY_SALARY_RANGES: dict[str, tuple[float, float, float, float]] = {
    "United States": (55000.0, 220000.0, 0.0, 45000.0),
    "Germany": (45000.0, 140000.0, 0.0, 25000.0),
    "United Kingdom": (38000.0, 130000.0, 0.0, 25000.0),
    "India": (600000.0, 3500000.0, 0.0, 600000.0),
    "Canada": (55000.0, 160000.0, 0.0, 30000.0),
    "Australia": (65000.0, 180000.0, 0.0, 35000.0),
    "Singapore": (60000.0, 170000.0, 0.0, 30000.0),
    "Japan": (4500000.0, 16000000.0, 0.0, 3000000.0),
    "Nigeria": (15000000.0, 75000000.0, 0.0, 12000000.0),
}

DEPARTMENTS_AND_ROLES: dict[str, list[str]] = {
    "Engineering": [
        "Software Engineer",
        "Senior Software Engineer",
        "Tech Lead",
        "Staff Engineer",
        "QA Engineer",
        "DevOps Engineer",
        "Engineering Manager",
    ],
    "Product": [
        "Associate Product Manager",
        "Product Manager",
        "Senior Product Manager",
        "Director of Product",
        "VP of Product",
    ],
    "Design": [
        "UI/UX Designer",
        "Senior Product Designer",
        "Lead Designer",
        "Design Systems Lead",
    ],
    "Sales": [
        "Sales Development Rep",
        "Account Executive",
        "Senior Account Executive",
        "Sales Manager",
        "VP of Sales",
    ],
    "Marketing": [
        "Marketing Specialist",
        "Growth Marketing Manager",
        "Content Strategist",
        "SEO Specialist",
        "Marketing Director",
    ],
    "Human Resources": [
        "HR Specialist",
        "Talent Acquisition Lead",
        "HR Business Partner",
        "Head of People",
    ],
    "Finance": [
        "Financial Analyst",
        "Senior Accountant",
        "Finance Controller",
        "CFO",
    ],
    "Legal": [
        "Legal Counsel",
        "Senior Corporate Counsel",
        "Compliance Officer",
    ],
    "Operations": [
        "Operations Coordinator",
        "Operations Manager",
        "Director of Operations",
    ],
}

EMPLOYMENT_TYPES: list[str] = ["Full-time", "Part-time", "Contractor"]

STATUSES: list[str] = ["Active", "On Leave", "Terminated"]


def convert_to_usd(amount: float, currency: str) -> float:
    """Convert an amount from native currency to USD using static conversion matrix."""
    currency_upper = currency.upper().strip()
    if currency_upper not in FX_RATES:
        raise ValueError(f"Unsupported currency: {currency}. Supported currencies: {sorted(SUPPORTED_CURRENCIES)}")
    rate = FX_RATES[currency_upper]
    return round(amount * rate, 2)


def calculate_salary_usd(base_salary: float, bonus: float, currency: str) -> float:
    """Calculate total annual compensation in USD: (base_salary + bonus) * FX_RATE."""
    total_native = (base_salary or 0.0) + (bonus or 0.0)
    return convert_to_usd(total_native, currency)
