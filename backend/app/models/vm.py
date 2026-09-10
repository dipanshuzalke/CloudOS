from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.core.database import Base


class VM(Base):
    __tablename__ = "vms"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(100), nullable=False)

    os = Column(String(50), nullable=False)

    region = Column(String(50), nullable=False)

    cpu = Column(Integer, nullable=False)

    ram = Column(Integer, nullable=False)

    storage = Column(Integer, nullable=False)

    status = Column(String(30), nullable=False, default="stopped")

    container_id = Column(
        String(100),
        nullable=True,
        unique=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )