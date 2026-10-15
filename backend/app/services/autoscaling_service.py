from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.vm import VM
from app.models.compute_node import ComputeNode
from app.models.autoscaling_config import AutoScalingConfig
from app.models.vm_metric import VMMetric
from app.services.docker_service import update_vm_cpu_limit
from app.services.resource_manager import (
    get_available_cpu,
)


def detect_high_cpu_vms(db: Session) -> list[dict]:
    config = (
        db.query(AutoScalingConfig)
        .order_by(AutoScalingConfig.id.asc())
        .first()
    )

    if not config or not config.enabled:
        return []

    # Do not trigger another scaling action during cooldown.
    now = datetime.now(timezone.utc)

    if config.last_scaled_at:
        cooldown_end = config.last_scaled_at + timedelta(
            seconds=config.cooldown_seconds
        )

        if now < cooldown_end:
            return []

    vms = (
        db.query(VM)
        .filter(
            VM.status == "running",
            VM.container_id.isnot(None),
        )
        .all()
    )

    candidates = []

    for vm in vms:
        # Get the two latest monitoring samples for this VM.
        samples = (
            db.query(VMMetric)
            .filter(VMMetric.vm_id == vm.id)
            .order_by(VMMetric.recorded_at.desc())
            .limit(2)
            .all()
        )

        # Require two samples to avoid triggering on one spike.
        if len(samples) < 2:
            continue

        if all(
            sample.cpu_percent >= config.cpu_threshold
            for sample in samples
        ):
            candidates.append({
                "vm_id": vm.id,
                "vm_name": vm.name,
                "current_cpu_percent": samples[0].cpu_percent,
                "cpu_threshold": config.cpu_threshold,
                "allocated_cpu": vm.cpu,
                "scale_up_cpu": config.scale_up_cpu,
            })

    return candidates

def scale_up_vm(db, vm_id: int) -> dict:
    vm = (
        db.query(VM)
        .filter(VM.id == vm_id)
        .with_for_update()
        .first()
    )

    if not vm:
        raise ValueError("VM not found")

    if vm.status != "running" or not vm.container_id:
        raise ValueError("Only running VMs can be scaled")

    if vm.node_id is None:
        raise ValueError("VM is not assigned to a compute node")

    config = (
        db.query(AutoScalingConfig)
        .order_by(AutoScalingConfig.id.asc())
        .first()
    )

    if not config or not config.enabled:
        raise ValueError("Auto-scaling is disabled")

    now = datetime.now(timezone.utc)

    if config.last_scaled_at:
        elapsed = (
            now - config.last_scaled_at
        ).total_seconds()

        if elapsed < config.cooldown_seconds:
            raise ValueError("Auto-scaling cooldown is active")

    node = (
        db.query(ComputeNode)
        .filter(ComputeNode.id == vm.node_id)
        .with_for_update()
        .first()
    )

    if not node:
        raise ValueError("Compute node not found")

    if node.status != "active":
        raise ValueError("Compute node is not active")

    extra_cpu = config.scale_up_cpu

    if get_available_cpu(node) < extra_cpu:
        raise ValueError("Insufficient CPU capacity on compute node")

    old_cpu = vm.cpu
    new_cpu = old_cpu + extra_cpu

    # Update Docker first, then persist the matching allocation.
    update_vm_cpu_limit(vm.container_id, new_cpu)

    try:
        node.allocated_cpu += extra_cpu
        vm.cpu = new_cpu
        config.last_scaled_at = now

        db.commit()

    except Exception:
        db.rollback()

        # Restore the original Docker CPU limit if DB persistence fails.
        try:
            update_vm_cpu_limit(vm.container_id, old_cpu)
        except Exception:
            # A failed rollback here needs manual consistency recovery.
            pass

        raise

    return {
        "vm_id": vm.id,
        "vm_name": vm.name,
        "previous_cpu": old_cpu,
        "current_cpu": new_cpu,
        "added_cpu": extra_cpu,
        "compute_node": node.id,
        "message": "VM scaled up successfully",
    }