from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    cpu_required: int = Field(gt=0)
    ram_required: int = Field(gt=0)
    storage_required: int = Field(gt=0)
    command: str = Field(
        default="echo CloudOS task executed successfully",
        min_length=1,
        max_length=500,
    )


class TaskResponse(BaseModel):
    id: int
    name: str
    cpu_required: int
    ram_required: int
    storage_required: int
    command: str
    status: str
    node_id: int | None = None
    container_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)