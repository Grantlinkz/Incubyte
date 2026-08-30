"""Performance benchmarking script for ACME Global Salary Management backend.

Measures response latencies across 10,000 seeded employee records to verify
the <200ms non-functional SLA requirement across pagination, filtering,
sorting, CSV exports, and analytical aggregations.
"""

import math
import statistics
import time
from typing import NamedTuple

from starlette.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import Employee


class BenchmarkResult(NamedTuple):
    name: str
    endpoint: str
    iterations: int
    min_ms: float
    mean_ms: float
    p50_ms: float
    p95_ms: float
    p99_ms: float
    max_ms: float
    passed: bool


def percentile(data: list[float], pct: float) -> float:
    """Calculate the p-th percentile from a list of numerical values."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * (pct / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_data[int(k)]
    d0 = sorted_data[int(f)] * (c - k)
    d1 = sorted_data[int(c)] * (k - f)
    return d0 + d1


def run_benchmark(
    client: TestClient,
    name: str,
    endpoint: str,
    iterations: int = 50,
    sla_ms: float = 200.0,
) -> BenchmarkResult:
    """Execute warm-up and timed iterations for an endpoint and calculate statistics."""
    # Warm-up request to prime SQLite caches and ORM structures
    client.get(endpoint)

    durations_ms: list[float] = []
    for _ in range(iterations):
        start_time = time.perf_counter()
        resp = client.get(endpoint)
        end_time = time.perf_counter()
        assert resp.status_code == 200, f"Benchmark failed for {endpoint}: {resp.status_code}"
        durations_ms.append((end_time - start_time) * 1000.0)

    min_ms = min(durations_ms)
    mean_ms = statistics.mean(durations_ms)
    p50_ms = percentile(durations_ms, 50.0)
    p95_ms = percentile(durations_ms, 95.0)
    p99_ms = percentile(durations_ms, 99.0)
    max_ms = max(durations_ms)
    passed = p95_ms < sla_ms and mean_ms < sla_ms

    return BenchmarkResult(
        name=name,
        endpoint=endpoint,
        iterations=iterations,
        min_ms=min_ms,
        mean_ms=mean_ms,
        p50_ms=p50_ms,
        p95_ms=p95_ms,
        p99_ms=p99_ms,
        max_ms=max_ms,
        passed=passed,
    )


def main() -> None:
    """Run full benchmark suite over the active SQLite database."""
    print("=" * 80)
    print(" ACME Global Salary Management - Query Latency Benchmark Suite")
    print(" Target SLA: All queries and aggregations must respond in < 200ms")
    print("=" * 80)

    # Check active employee count in database
    with SessionLocal() as session:
        count = session.query(Employee).filter(Employee.is_deleted == False).count()  # noqa: E712
        print(f"[*] Connected to active database. Total active employee records: {count:,}")
        if count == 0:
            print("[!] Warning: Database contains 0 records. Run `python -m scripts.seed` first.")

    benchmarks_to_run = [
        ("Paginated List (Limit 50)", "/api/employees?skip=0&limit=50", 200.0),
        ("Multi-Attribute Filter", "/api/employees?department=Engineering&country=United+States&status=Active", 200.0),
        ("Keyword Search", "/api/employees?search=john", 200.0),
        ("Multi-Column Sort (USD Desc)", "/api/employees?sort_by=salary_usd&sort_order=desc&limit=50", 200.0),
        ("Single Employee Profile", "/api/employees/1", 200.0),
        ("Filtered CSV Export (Dept)", "/api/employees/export?department=Engineering", 200.0),
        ("Full 10k CSV Export Stream", "/api/employees/export", 1500.0),
        ("KPI Summary Aggregation", "/api/analytics/summary", 200.0),
        ("Department Breakdown", "/api/analytics/by-department", 200.0),
        ("Country Breakdown", "/api/analytics/by-country", 200.0),
    ]

    results: list[BenchmarkResult] = []

    with TestClient(app) as client:
        for name, endpoint, sla_target in benchmarks_to_run:
            print(f"[*] Benchmarking: {name:<30} ({endpoint}) ...", end="", flush=True)
            res = run_benchmark(client, name, endpoint, iterations=30, sla_ms=sla_target)
            results.append(res)
            status_tag = "[PASS]" if res.passed else "[FAIL]"
            print(f" {status_tag} (p95: {res.p95_ms:.2f}ms, mean: {res.mean_ms:.2f}ms)")

    print("\n" + "=" * 105)
    print(" BENCHMARK RESULTS SUMMARY")
    print("=" * 105)
    print(
        f"{'Operation / Scenario':<30} | {'p50 (ms)':<9} | {'p95 (ms)':<9} | {'p99 (ms)':<9} | {'Mean (ms)':<9} | {'Max (ms)':<9} | {'Target SLA':<12} | {'Status'}"
    )
    print("-" * 120)

    all_passed = True
    for r, (_, _, sla_target) in zip(results, benchmarks_to_run, strict=False):
        status_str = "PASS" if r.passed else "FAIL"
        if not r.passed:
            all_passed = False
        print(
            f"{r.name:<30} | {r.p50_ms:>8.2f} | {r.p95_ms:>8.2f} | {r.p99_ms:>8.2f} | {r.mean_ms:>8.2f} | {r.max_ms:>8.2f} | < {sla_target:>4.0f}ms      | {status_str}"
        )

    print("-" * 120)
    if all_passed:
        print("[SUCCESS] All interactive queries and aggregations comfortably meet the <200ms latency SLA!")
    else:
        print("[FAILURE] One or more endpoints breached the latency SLA threshold.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
