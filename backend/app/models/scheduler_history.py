from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class SchedulerHistory(Base):
    __tablename__ = "scheduler_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    algorithm = Column(
        String(50),
        nullable=False,
    )

    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    ended_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )