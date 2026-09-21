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
        index=True,
    )

    node_id = Column(
        Integer,
        ForeignKey("compute_nodes.id"),
        nullable=True,
        index=True,
    )

    name = Column(String(100), nullable=False)

    cpu_required = Column(Integer, nullable=False)

    ram_required = Column(Integer, nullable=False)

    storage_required = Column(Integer, nullable=False)

    command = Column(
        String(500),
        nullable=False,
        default="echo CloudOS task executed successfully",
    )

    container_id = Column(String(100), nullable=True, unique=True)

    status = Column(
        String(30),
        nullable=False,
        default="queued",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )