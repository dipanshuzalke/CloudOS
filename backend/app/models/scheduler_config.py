from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class SchedulerConfig(Base):
    __tablename__ = "scheduler_config"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    algorithm = Column(
        String(50),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )