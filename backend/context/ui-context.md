# UI / Frontend Integration Context

## Overview

While this repository contains the Python / FastAPI backend, it directly services a Next.js / React frontend designed for HR Managers to manage global salaries and view compensation analytics.

---

## API Contract & Endpoints

### 1. Employee Management (`/api/employees`)
- `GET /api/employees`: Paginated employee grid with multi-attribute filtering (`department`, `country`, `job_title`, `employment_type`, `status`), keyword search (`name`, `email`), and multi-column sorting (`base_salary`, `bonus`, `salary_usd`).
- `POST /api/employees`: Form-based creation of employee records with instant validation and `salary_usd` calculation.
- `GET /api/employees/{id}`: Single employee profile fetch.
- `PUT /api/employees/{id}`: Update employee details with automatic recalculation.
- `DELETE /api/employees/{id}`: Soft-delete employee (`is_deleted=True`).
- `GET /api/employees/export`: Streaming CSV export of filtered dataset for instant downloads.

### 2. Analytics & Reporting (`/api/analytics`)
- `GET /api/analytics/summary`: KPI summary cards (Total Annual Payroll USD, Average Salary USD, Median Salary USD, Currency Distribution).
- `GET /api/analytics/by-department`: Departmental breakdown (headcount, payroll, average, min/max salary).
- `GET /api/analytics/by-country`: Geographic breakdown across operating countries.

---

## CORS Configuration

To allow seamless local and production Next.js frontend integration:
- Allowed Origins: `http://localhost:3000`, `http://127.0.0.1:3000`, and environment-configured frontend URLs.
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- Allowed Headers: `*`.
- Expose Headers: `Content-Disposition` (for CSV export streaming file downloads).

---

## Latency Target

- **< 200ms**: All paginated queries and KPI aggregations over the 10,000 seeded dataset must respond in under 200ms to guarantee a smooth, responsive UI experience.
