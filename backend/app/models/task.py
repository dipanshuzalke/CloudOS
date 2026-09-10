from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        )

    name = Column(String(100), nullable=False)

    cpu_required = Column(Integer, nullable=False)

    ram_required = Column(Integer, nullable=False)

    status = Column(String(30), nullable=False, default="queued")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )