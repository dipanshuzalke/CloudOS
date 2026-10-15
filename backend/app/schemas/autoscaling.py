from datetime import datetime

from pydantic import BaseModel, Field


class AutoScalingConfigUpdate(BaseModel):
    enabled: bool
    cpu_threshold: float = Field(ge=10, le=95)
    scale_up_cpu: int = Field(ge=1, le=4)
    cooldown_seconds: int = Field(ge=30, le=3600)


class AutoScalingConfigResponse(BaseModel):
    id: int
    enabled: bool
    cpu_threshold: float
    scale_up_cpu: int
    cooldown_seconds: int
    last_scaled_at: datetime | None = None
    updated_at: datetime