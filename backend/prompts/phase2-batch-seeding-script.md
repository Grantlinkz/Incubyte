# Implementation Prompt: Phase 2 — Batch Seeding Script

## Goal
Implement the deterministic static FX conversion rates lookup matrix (including Nigeria / NGN) and a high-performance synthetic database seeding script (`scripts/seed.py`) using Faker to populate 10,000 realistic international employee compensation records in SQLite in under 2 seconds.

---

## Skills Read
- `.agents/skills/fastapi/SKILL.md` (Pydantic validation patterns, typed return signatures, clean separation of constants/services).

---

## Existing Code & Documentation Inspected
- `assesesment details/Backend Implementation Plan.pdf` (Phase 2 deliverables: `scripts/seed.py`, `app/constants/fx_rates.py`, bulk insertion in chunks <2s, multi-commit cadence).
- `assesesment details/Product Requirements Document.pdf` (10,000 records, global currencies, countries, departments, realistic compensation distribution).
- `assesesment details/Salary Management Assessment.pdf` (10k employee seeding requirement, deterministic data, clean architecture).
- `context/architecture.md` (FX rates definition, SQLite WAL mode compatibility, `salary_usd` derivation formula).
- `context/progress-tracker.md` (Current state and milestone goals for Phase 2).
- `app/models.py` (Employee ORM model fields and indexing).
- `app/database.py` (Engine and SessionLocal configuration).

---

## Decisions & Assumptions
1. **Deterministic Static FX Lookup Matrix (`app/constants/fx_rates.py`)**:
   - Zero external API dependencies to eliminate network latency and failure points.
   - Supported Currencies & Conversion Rates (to USD):
     - `USD`: 1.0
     - `EUR`: 1.08
     - `GBP`: 1.28
     - `INR`: 0.012
     - `CAD`: 0.74
     - `AUD`: 0.66
     - `SGD`: 0.75
     - `JPY`: 0.0067
     - `NGN`: 0.00067
   - Provide helper functions:
     - `convert_to_usd(amount: float, currency: str) -> float`
     - `calculate_salary_usd(base_salary: float, bonus: float, currency: str) -> float`
   - Provide standardized metadata lists (Supported Countries including Nigeria, Currencies, Departments, Job Titles by Department, Employment Types, Statuses).
2. **High-Performance Seeding Engine (`scripts/seed.py`)**:
   - Use Python's `faker` library and `random` with a fixed seed (`seed=42`) for 100% deterministic reproducibility.
   - Generate realistic localized compensation distributions per country/currency (e.g., Nigeria / NGN in millions of Naira, INR base salaries in Lakhs/Crores, USD in 60k-250k, JPY in millions, etc.).
   - Include realistic employment statuses (`Active` ~92%, `On Leave` ~5%, `Terminated` ~3%) and soft-deleted records (`is_deleted=True` for ~2% to test filter exclusions).
   - Use SQLAlchemy 2.0 core `insert(Employee)` with chunked batches (chunk size: 2,000) inside an explicit transaction to ensure all 10,000 records insert in `<2.0s`.
   - Provide clear CLI output with timing metrics and record distribution summary.
3. **Two Atomic Commits**:
   - Commit 1: `feat(constants): define static fx conversion rates lookup matrix`
   - Commit 2: `feat(seed): implement high-performance 10k employee bulk seeder with faker`

---

## Files to Create / Modify
- `app/constants/__init__.py` [NEW]
- `app/constants/fx_rates.py` [NEW]
- `scripts/__init__.py` [NEW]
- `scripts/seed.py` [NEW]
- `context/architecture.md` [MODIFY]
- `context/progress-tracker.md` [MODIFY]

---

## Implementation Details

### 1. `app/constants/fx_rates.py`
- Define `FX_RATES: dict[str, float]`:
  ```python
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
  ```
- Define `SUPPORTED_CURRENCIES = set(FX_RATES.keys())`.
- Define `COUNTRY_CURRENCY_MAP: dict[str, str]` mapping:
  - United States -> USD
  - Germany -> EUR
  - United Kingdom -> GBP
  - India -> INR
  - Canada -> CAD
  - Australia -> AUD
  - Singapore -> SGD
  - Japan -> JPY
  - Nigeria -> NGN
- Define `DEPARTMENTS_AND_ROLES: dict[str, list[str]]` containing realistic organizational roles:
  - Engineering (Software Engineer, Senior Software Engineer, Tech Lead, Staff Engineer, QA Engineer, DevOps Engineer, Engineering Manager)
  - Product (Associate Product Manager, Product Manager, Senior Product Manager, VP of Product)
  - Design (UI/UX Designer, Senior Product Designer, Lead Designer)
  - Sales (Account Executive, Senior Account Executive, Sales Manager, VP of Sales)
  - Marketing (Marketing Specialist, Growth Manager, Content Strategist, Marketing Director)
  - HR (HR Specialist, Talent Acquisition Lead, HR Business Partner, VP of People)
  - Finance (Financial Analyst, Senior Accountant, Controller, CFO)
  - Legal (Legal Counsel, Senior Corporate Counsel, Compliance Officer)
  - Operations (Operations Coordinator, Operations Manager, Director of Operations)
- Define `EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contractor"]`.
- Define `STATUSES = ["Active", "On Leave", "Terminated"]`.
- Define utility functions:
  - `convert_to_usd(amount: float, currency: str) -> float`
  - `calculate_salary_usd(base_salary: float, bonus: float, currency: str) -> float` (calculates `round((base_salary + bonus) * rate, 2)`).

### 2. `scripts/seed.py`
- Create entrypoint script that:
  - Initializes database schema using `Base.metadata.create_all(bind=engine)`.
  - Clears existing data if requested or re-populates cleanly.
  - Seeds exactly 10,000 employee records with realistic multi-country compensation data (including Nigeria / NGN).
  - Uses `insert(Employee)` in chunks of 2,000 records.
  - Measures execution time and prints performance benchmarks.

---

## Security & Concurrency Requirements
- Execute seeding within a managed SQLAlchemy transaction context (`with SessionLocal() as session: with session.begin(): ...`).
- Leverage SQLite WAL mode configured in `app/database.py` for maximum bulk insert throughput.

---

## Acceptance Criteria
1. `app/constants/fx_rates.py` contains all required currencies (including NGN), helper functions, and organizational metadata.
2. `scripts/seed.py` runs and seeds 10,000 valid, realistic records into SQLite in `< 2.0 seconds`.
3. Database reflects correct `salary_usd` computations across all 10,000 rows.
4. Both atomic commits are planned and executed according to convention.

---

## Verification Plan & Atomic Commits

### Verification Steps:
1. Run `python -m scripts.seed` or `python scripts/seed.py`.
2. Verify terminal output displays `< 2.0s` duration for 10,000 records.
3. Query SQLite database to verify count (`SELECT count(*) FROM employees;` == 10000) and verify that `salary_usd` matches `(base_salary + bonus) * FX_RATES[currency]`.

### Atomic Git Commits:
1. `feat(constants): define static fx conversion rates lookup matrix`
2. `feat(seed): implement high-performance 10k employee bulk seeder with faker`
