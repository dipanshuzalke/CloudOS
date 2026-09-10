from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VMCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    os: str

    region: str

    cpu: int = Field(gt=0)

    ram: int = Field(gt=0)

    storage: int = Field(gt=0)


class VMResponse(BaseModel):
    id: int
    name: str
    status: str
    cpu: int
    ram: int
    storage: int
    os: str
    region: str

    node_id: int | None = None

    ip: str | None = None
    uptime: str | None = None
    container_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)