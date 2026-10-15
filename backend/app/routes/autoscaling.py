from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.autoscaling_config import AutoScalingConfig
from app.schemas.autoscaling import (
    AutoScalingConfigUpdate,
    AutoScalingConfigResponse,
)
from app.services.autoscaling_service import detect_high_cpu_vms, scale_up_vm

router = APIRouter(
    prefix="/api/autoscaling",
    tags=["Auto-scaling"],
)


def get_or_create_config(db: Session) -> AutoScalingConfig:
    config = (
        db.query(AutoScalingConfig)
        .order_by(AutoScalingConfig.id.asc())
        .first()
    )

    if config is None:
        config = AutoScalingConfig(
            enabled=False,
            cpu_threshold=70.0,
            scale_up_cpu=1,
            cooldown_seconds=60,
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config


@router.get("", response_model=AutoScalingConfigResponse)
def get_autoscaling_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_or_create_config(db)


@router.put("", response_model=AutoScalingConfigResponse)
def update_autoscaling_config(
    data: AutoScalingConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    config = get_or_create_config(db)

    config.enabled = data.enabled
    config.cpu_threshold = data.cpu_threshold
    config.scale_up_cpu = data.scale_up_cpu
    config.cooldown_seconds = data.cooldown_seconds

    db.commit()
    db.refresh(config)

    return config

@router.get("/check")
def check_autoscaling(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidates = detect_high_cpu_vms(db)

    return {
        "enabled": bool(
            get_or_create_config(db).enabled
        ),
        "candidates": candidates,
        "count": len(candidates),
    }


@router.post("/scale/{vm_id}")
def scale_vm_endpoint(
    vm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Allow users to scale only their own VMs.
    vm = (
        db.query(VM)
        .filter(
            VM.id == vm_id,
            VM.user_id == current_user.id,
        )
        .first()
    )

    if not vm:
        raise HTTPException(
            status_code=404,
            detail="VM not found",
        )

    try:
        return scale_up_vm(db, vm_id)

    except ValueError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        )
