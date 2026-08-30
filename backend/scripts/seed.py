"""High-performance synthetic employee data seeder using Faker and chunked SQLAlchemy 2.0 inserts."""

from datetime import datetime, timedelta, timezone
import random
import time
from typing import Any

from faker import Faker
from sqlalchemy import delete, func, insert, select

from app.constants.fx_rates import (
    COUNTRY_CURRENCY_MAP,
    COUNTRY_SALARY_RANGES,
    DEPARTMENTS_AND_ROLES,
    EMPLOYMENT_TYPES,
    FX_RATES,
    STATUSES,
)
from app.database import Base, SessionLocal, engine
from app.models import Employee

TOTAL_RECORDS: int = 10_000
CHUNK_SIZE: int = 5_000
RANDOM_SEED: int = 42


def build_name_pools(faker: Faker, pool_size: int = 400) -> tuple[list[str], list[str]]:
    """Pre-generate pools of first and last names for fast in-memory sampling."""
    first_names = [faker.first_name() for _ in range(pool_size)]
    last_names = [faker.last_name() for _ in range(pool_size)]
    return first_names, last_names


def generate_employee_batch_fast(
    first_names: list[str],
    last_names: list[str],
    start_idx: int,
    count: int,
    countries: list[str],
    departments: list[str],
    now: datetime,
) -> list[dict[str, Any]]:
    """Generate a batch of realistic employee records using fast in-memory sampling."""
    batch: list[dict[str, Any]] = []

    for i in range(start_idx, start_idx + count):
        country = random.choice(countries)
        currency = COUNTRY_CURRENCY_MAP[country]
        rate = FX_RATES[currency]
        department = random.choice(departments)
        job_title = random.choice(DEPARTMENTS_AND_ROLES[department])

        # Sample localized salary and bonus
        min_base, max_base, min_bonus, max_bonus = COUNTRY_SALARY_RANGES[country]
        base_salary = round(random.uniform(min_base, max_base), 2)
        has_bonus = random.random() < 0.70
        bonus = round(random.uniform(min_bonus, max_bonus), 2) if has_bonus else 0.0

        # Calculate normalized USD total compensation
        salary_usd = round((base_salary + bonus) * rate, 2)

        # Weighted employment type and status distribution
        employment_type = random.choices(EMPLOYMENT_TYPES, weights=[0.85, 0.10, 0.05])[0]
        status = random.choices(STATUSES, weights=[0.92, 0.05, 0.03])[0]

        # ~2% soft-deleted records for realistic soft-delete filter testing
        is_deleted = random.random() < 0.02

        # Fast name sampling and unique email
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        clean_first = first_name.lower().replace("'", "").replace(" ", "")
        clean_last = last_name.lower().replace("'", "").replace(" ", "")
        email = f"{clean_first}.{clean_last}.{i:05d}@acme.corp"

        # Realistic creation timestamp within past 3 years
        days_ago = random.randint(1, 1095)
        created_at = now - timedelta(days=days_ago)
        updated_at = created_at + timedelta(days=random.randint(0, min(days_ago, 60)))

        batch.append(
            {
                "name": full_name,
                "email": email,
                "job_title": job_title,
                "department": department,
                "country": country,
                "employment_type": employment_type,
                "base_salary": base_salary,
                "bonus": bonus,
                "currency": currency,
                "salary_usd": salary_usd,
                "status": status,
                "is_deleted": is_deleted,
                "created_at": created_at,
                "updated_at": updated_at,
            }
        )

    return batch


def seed_database(total_records: int = TOTAL_RECORDS, chunk_size: int = CHUNK_SIZE) -> None:
    """Seed SQLite database with realistic international employee records in bulk."""
    print("=" * 60)
    print(f"[*] Starting ultra-fast synthetic seeding for {total_records:,} records...")
    print("=" * 60)

    # Initialize Faker and random seeds for deterministic output
    random.seed(RANDOM_SEED)
    faker = Faker()
    Faker.seed(RANDOM_SEED)

    countries = list(COUNTRY_CURRENCY_MAP.keys())
    departments = list(DEPARTMENTS_AND_ROLES.keys())
    first_names, last_names = build_name_pools(faker, pool_size=400)
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    start_time = time.perf_counter()

    with SessionLocal() as session:
        # Clear existing records
        print("[*] Clearing existing employee records...")
        session.execute(delete(Employee))
        session.commit()

        print(f"[*] Generating and bulk inserting {total_records:,} records in chunks of {chunk_size:,}...")
        inserted_count = 0

        for start_idx in range(0, total_records, chunk_size):
            chunk_count = min(chunk_size, total_records - start_idx)
            batch = generate_employee_batch_fast(
                first_names=first_names,
                last_names=last_names,
                start_idx=start_idx + 1,
                count=chunk_count,
                countries=countries,
                departments=departments,
                now=now,
            )

            # High-performance bulk insert using Core insert statement
            session.execute(insert(Employee), batch)
            session.commit()
            inserted_count += len(batch)
            print(f"  -> Inserted {inserted_count:,} / {total_records:,} records...")

    duration = time.perf_counter() - start_time

    # Verification Query
    with SessionLocal() as session:
        total_in_db = session.scalar(select(func.count(Employee.id)))
        active_in_db = session.scalar(
            select(func.count(Employee.id)).where(Employee.is_deleted == False)  # noqa: E712
        )
        deleted_in_db = session.scalar(
            select(func.count(Employee.id)).where(Employee.is_deleted == True)  # noqa: E712
        )

    print("=" * 60)
    print("[+] Seeding Completed Successfully!")
    print(f"[*] Total Duration: {duration:.3f} seconds (Target: < 2.0s)")
    print(f"[*] Total Records in DB: {total_in_db:,}")
    print(f"   - Active Records: {active_in_db:,}")
    print(f"   - Soft-Deleted Records: {deleted_in_db:,}")
    print(f"[*] Operating Countries: {len(countries)} ({', '.join(countries)})")
    print(f"[*] Departments: {len(departments)} ({', '.join(departments)})")
    print("=" * 60)


if __name__ == "__main__":
    seed_database()
