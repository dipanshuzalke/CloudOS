from sqlalchemy import Boolean, Column, DateTime, Float, Integer
from sqlalchemy.sql import func

from app.core.database import Base


class AutoScalingConfig(Base):
    __tablename__ = "autoscaling_config"

    id = Column(Integer, primary_key=True, index=True)
    enabled = Column(Boolean, nullable=False, default=False)
    cpu_threshold = Column(Float, nullable=False, default=70.0)
    scale_up_cpu = Column(Integer, nullable=False, default=1)
    cooldown_seconds = Column(Integer, nullable=False, default=60)
    last_scaled_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )