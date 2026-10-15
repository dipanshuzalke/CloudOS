from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, BigInteger
from sqlalchemy.sql import func

from app.core.database import Base


class VMMetric(Base):
    __tablename__ = "vm_metrics"

    id = Column(Integer, primary_key=True, index=True)

    vm_id = Column(
        Integer,
        ForeignKey("vms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    cpu_percent = Column(Float, nullable=False, default=0.0)

    memory_usage = Column(
        BigInteger,
        nullable=False,
        default=0,
    )

    memory_percent = Column(Float, nullable=False, default=0.0)

    network_rx_bytes = Column(
        BigInteger,
        nullable=False,
        default=0,
    )

    network_tx_bytes = Column(
        BigInteger,
        nullable=False,
        default=0,
    )

    recorded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )