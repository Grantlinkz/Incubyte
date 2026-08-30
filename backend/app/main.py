from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
import app.models  # noqa: F401 - Register models with Base metadata
from app.routers.analytics import router as analytics_router
from app.routers.employees import router as employees_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager to handle startup and shutdown operations."""
    # Ensure database schema is created on application startup
    Base.metadata.create_all(bind=engine)
    yield


tags_metadata = [
    {
        "name": "Employees",
        "description": "Employee CRUD operations, server-side pagination, multi-attribute filtering, keyword search, multi-column sorting, and streaming CSV exports.",
    },
    {
        "name": "Analytics",
        "description": "Organization-wide compensation analytics, KPI summary statistics, departmental aggregations, and geographic breakdowns.",
    },
    {
        "name": "Health",
        "description": "System health and operational readiness verification.",
    },
]

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Production-grade, high-concurrency Backend API for the ACME Global Salary Management Platform. "
        "Engineered for sub-200ms query latency over 10,000 global employee records."
    ),
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Register API Routers
app.include_router(employees_router)
app.include_router(analytics_router)



@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
    }
