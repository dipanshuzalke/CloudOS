from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ComputeNodeResponse(BaseModel):
    id: int
    name: str

    total_cpu: int
    allocated_cpu: int
    available_cpu: int

    total_ram: int
    allocated_ram: int
    available_ram: int

    total_storage: int
    allocated_storage: int
    available_storage: int

    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )