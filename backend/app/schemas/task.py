from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    name: str
    cpu_required: int
    ram_required: int


class TaskResponse(BaseModel):
    id: int
    name: str
    cpu_required: int
    ram_required: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)