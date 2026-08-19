from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VMCreate(BaseModel):
    name: str
    cpu: int
    ram: int
    storage: int


class VMResponse(BaseModel):
    id: int
    name: str
    cpu: int
    ram: int
    storage: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)