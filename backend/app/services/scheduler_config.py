from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.scheduler_config import SchedulerConfig
from app.models.scheduler_history import SchedulerHistory


def get_scheduler_algorithm(db: Session) -> str:
    config = (
        db.query(SchedulerConfig)
        .order_by(SchedulerConfig.id)
        .first()
    )

    if not config:
        config = SchedulerConfig(
            algorithm="first_fit"
        )

        db.add(config)
        db.commit()
        db.refresh(config)

    return config.algorithm


def set_scheduler_algorithm(
    db: Session,
    algorithm: str,
) -> str:

    config = (
        db.query(SchedulerConfig)
        .order_by(SchedulerConfig.id)
        .first()
    )

    # If no scheduler configuration exists yet
    if not config:
        config = SchedulerConfig(
            algorithm=algorithm
        )

        db.add(config)

        history = SchedulerHistory(
            algorithm=algorithm,
            started_at=datetime.now(timezone.utc),
            ended_at=None,
        )

        db.add(history)

        db.commit()
        db.refresh(config)

        return config.algorithm

    # If the selected algorithm is already active,
    # don't create another history record.
    if config.algorithm == algorithm:
        return config.algorithm

    # ---------------------------------
    # Close previous history record
    # ---------------------------------
    current_history = (
        db.query(SchedulerHistory)
        .filter(
            SchedulerHistory.ended_at.is_(None)
        )
        .order_by(SchedulerHistory.id.desc())
        .first()
    )

    now = datetime.now(timezone.utc)

    if current_history:
        current_history.ended_at = now

    # ---------------------------------
    # Start new history record
    # ---------------------------------
    new_history = SchedulerHistory(
        algorithm=algorithm,
        started_at=now,
        ended_at=None,
    )

    db.add(new_history)

    # ---------------------------------
    # Update current configuration
    # ---------------------------------
    config.algorithm = algorithm
    config.updated_at = now

    db.commit()
    db.refresh(config)

    return config.algorithm