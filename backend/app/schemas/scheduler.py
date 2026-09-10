from pydantic import BaseModel


class SchedulerResponse(BaseModel):
    algorithm: str
    available_algorithms: list[str]


class SchedulerUpdate(BaseModel):
    algorithm: str