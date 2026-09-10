from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.scheduler import (
    SchedulerResponse,
    SchedulerUpdate,
)
from app.services.scheduler import SUPPORTED_ALGORITHMS
from app.services.scheduler_config import (
    get_scheduler_algorithm,
    set_scheduler_algorithm,
)

router = APIRouter(
    prefix="/api/scheduler",
    tags=["Scheduler"],
)


@router.get("", response_model=SchedulerResponse)
def get_scheduler(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "algorithm": get_scheduler_algorithm(db),
        "available_algorithms": sorted(SUPPORTED_ALGORITHMS),
    }


@router.put("", response_model=SchedulerResponse)
def update_scheduler(
    scheduler_data: SchedulerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    algorithm = scheduler_data.algorithm.lower().strip()

    if algorithm not in SUPPORTED_ALGORITHMS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported scheduling algorithm: {algorithm}. "
                f"Available algorithms: "
                f"{', '.join(sorted(SUPPORTED_ALGORITHMS))}"
            ),
        )

    set_scheduler_algorithm(
        db=db,
        algorithm=algorithm,
    )

    return {
        "algorithm": get_scheduler_algorithm(db),
        "available_algorithms": sorted(SUPPORTED_ALGORITHMS),
    }