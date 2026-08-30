from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Employee(Base):
    """SQLAlchemy ORM model representing an employee record with compensation and indexing."""

    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    employment_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    base_salary: Mapped[float] = mapped_column(Float, nullable=False)
    bonus: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    salary_usd: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Active", index=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        Index("ix_employees_active_dept_country", "is_deleted", "department", "country"),
        Index("ix_employees_active_salary", "is_deleted", "salary_usd"),
    )

    def __repr__(self) -> str:
        return f"<Employee(id={self.id}, name='{self.name}', department='{self.department}', salary_usd={self.salary_usd})>"
