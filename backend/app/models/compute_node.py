from sqlalchemy import func, Column, Integer, String, DateTime

from app.core.database import Base


class ComputeNode(Base):
    __tablename__ = "compute_nodes"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    total_cpu = Column(
        Integer,
        nullable=False,
    )

    total_ram = Column(
        Integer,
        nullable=False,
    )

    total_storage = Column(
        Integer,
        nullable=False,
    )

    allocated_cpu = Column(
        Integer,
        nullable=False,
        default=0,
    )

    allocated_ram = Column(
        Integer,
        nullable=False,
        default=0,
    )

    allocated_storage = Column(
        Integer,
        nullable=False,
        default=0,
    )

    status = Column(
        String(30),
        nullable=False,
        default="active",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )