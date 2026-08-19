from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class VM(Base):
    __tablename__ = "vms"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    cpu = Column(Integer, nullable=False)

    ram = Column(Integer, nullable=False)

    storage = Column(Integer, nullable=False)

    status = Column(String(30), nullable=False, default="stopped")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )