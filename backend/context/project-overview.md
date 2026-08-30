# Project Overview: ACME Global Salary Management

## Overview

ACME Global Salary Management is a centralized, high-performance web-based platform designed for HR Managers to manage compensation data for 10,000+ employees across international offices. It replaces fragmented, error-prone spreadsheets with automated data validation, sub-second query performance, paginated multi-attribute filtering, and real-time compensation analytics.

---

## Target Persona & Scale

- **Target User**: HR Manager
- **Scale**: 10,000 global employee records across multiple countries, departments, and currencies
- **Performance Target**: Server-side pagination, search, and analytical aggregations execute in <200ms

---

## Core Problem Statement

- **Spreadsheet Fragility**: Managing 10,000 global employee salary records across distributed spreadsheets leads to high maintenance overhead, lack of schema validation, formula errors, and slow reporting.
- **Currency & Equity Disparities**: Lack of standardized base-currency normalization makes it difficult for leadership to evaluate pay equity, departmental payroll distribution, and regional compensation metrics.
- **Reporting Bottlenecks**: Generating cross-country reports and aggregations requires manual slicing and spreadsheet calculations.

---

## Goals & Objectives

1. **Centralized Data Management**: Provide a validated, relational data model for employee profiles, salary, bonus, currency, and employment metadata.
2. **Sub-Second Performance**: Support paginated browsing, multi-attribute filtering, and keyword search across 10,000+ records in <200ms.
3. **Instant Compensation Analytics**: Real-time aggregation of total annual payroll, average salary, median salary, departmental distribution, and geographic breakdown.
4. **Deterministic Base Currency Normalization**: Convert all regional currencies to USD using a deterministic lookup matrix upon record creation/update without third-party network failure points.
5. **Data Export**: Stream filtered search and employee data as CSV files efficiently.

---

## In-Scope Features

### 1. Employee & Compensation Management
- **Paginated Data Grid**: Server-side pagination (`page`, `page_size`) optimized for 10,000+ records.
- **Multi-Attribute Filtering & Sorting**: Filter by `country`, `department`, `job_title`, `employment_type`, and `status`; sort by `base_salary`, `bonus`, `salary_usd`, etc.
- **Full-Text & Keyword Search**: Search across employee `name`, `email`, `job_title`.
- **CRUD Operations & Soft-Delete**:
  - `POST /api/employees`: Create new employee profile with automatic `salary_usd` calculation.
  - `GET /api/employees/{id}`: Fetch single employee profile.
  - `PUT /api/employees/{id}`: Update employee details with automatic `salary_usd` re-calculation.
  - `DELETE /api/employees/{id}`: Soft-delete employee (`is_deleted=True`).
- **CSV Data Export**: `GET /api/employees/export` streaming endpoint exporting filtered results.

### 2. Compensation Analytics & Reporting ("How ACME Pays")
- **Executive Summary KPIs (`GET /api/analytics/summary`)**:
  - Total annual payroll (USD)
  - Average salary (USD)
  - Median salary (USD) calculated via SQL window functions / sorted SQL queries
  - Currency distribution count & percentages
- **Departmental Breakdown (`GET /api/analytics/by-department`)**:
  - Headcount, total payroll, average salary, and min/max salary grouped by department.
- **Geographic Breakdown (`GET /api/analytics/by-country`)**:
  - Headcount, total payroll, average salary, and min/max salary grouped by country.

### 3. High-Performance Synthetic Seeding
- **Seed Script (`scripts/seed.py`)**: Generates 10,000 realistic international employee records using Faker and bulk SQL insertion in <2s.

---

## Deliberately Out-of-Scope (Trade-offs & Justification)

| Out-of-Scope Feature | Reasoning & Justification |
|---|---|
| **Complex Multi-Tier RBAC** | The target persona is strictly the HR Manager. Adding complex role hierarchies (e.g. employee self-service, line-manager approvals) adds unneeded authorization bloat for the MVP. |
| **Automated Payroll Execution & Banking Integration** | ACME needs a salary management and intelligence platform, not a direct payment gateway or automated tax-filing processor. |
| **Historical Compensation Auditing & Versioning** | Full temporal salary change logs require complex event-sourcing or versioned tables, which shifts focus away from delivering fast global aggregation and core management flows. |
| **Real-Time External Currency APIs** | Live exchange rate APIs introduce external latency, rate-limiting, and network failure points. The system stores native currency amounts alongside standardized base-currency equivalents deterministically. |

---

## Success Criteria

1. Database initializes with SQLite WAL mode enabled and composite indexes configured.
2. `scripts/seed.py` seeds 10,000 valid employee records in under 2 seconds.
3. Pagination, filtering, and search endpoints respond in `<200ms` over 10,000 records.
4. Median salary and summary KPI queries execute with high accuracy using SQL aggregations.
5. All automated unit and integration tests pass with 100% deterministic results (`pytest`).
