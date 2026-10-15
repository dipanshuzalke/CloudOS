from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.vm import VM
from app.models.vm_metric import VMMetric


router = APIRouter(
    prefix="/api/monitoring",
    tags=["Monitoring"],
)


@router.get("/vms")
def get_vm_metrics(
    hours: int = Query(default=24, ge=1, le=168),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return historical VM monitoring metrics
    for the currently authenticated user.
    """

    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    metrics = (
        db.query(VMMetric, VM)
        .join(VM, VM.id == VMMetric.vm_id)
        .filter(
            VM.user_id == current_user.id,
            VMMetric.recorded_at >= since,
        )
        .order_by(VMMetric.recorded_at.asc())
        .all()
    )

    return [
        {
            "vm_id": vm.id,
            "vm_name": vm.name,

            # VM allocated resources
            "allocated_cpu": vm.cpu,
            "allocated_ram": vm.ram,

            # Runtime metrics
            "cpu_percent": metric.cpu_percent,
            "memory_usage": metric.memory_usage,
            "memory_percent": metric.memory_percent,
            "network_rx_bytes": metric.network_rx_bytes,
            "network_tx_bytes": metric.network_tx_bytes,

            "recorded_at": metric.recorded_at,
        }
        for metric, vm in metrics
    ]