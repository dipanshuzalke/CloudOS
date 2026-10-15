from sqlalchemy.orm import Session

from app.models.vm import VM
from app.models.vm_metric import VMMetric
from app.services.docker_service import client, get_container_stats


def collect_vm_metrics(db: Session) -> int:
    """
    Collect current Docker runtime metrics for all VMs
    that have an associated container.
    """

    vms = (
        db.query(VM)
        .filter(VM.container_id.isnot(None))
        .all()
    )

    collected = 0

    for vm in vms:
        try:
            container = client.containers.get(vm.container_id)

            container.reload()

            if container.status != "running":
                continue

            stats = get_container_stats(container)

            metric = VMMetric(
                vm_id=vm.id,
                cpu_percent=stats["cpu_percent"],
                memory_usage=stats["memory_usage"],
                memory_percent=stats["memory_percent"],
                network_rx_bytes=stats["network_rx_bytes"],
                network_tx_bytes=stats["network_tx_bytes"],
            )

            db.add(metric)
            collected += 1

        except Exception:
            # A VM/container may have been deleted or become unavailable.
            # Skip it and continue collecting metrics for other VMs.
            continue

    if collected:
        db.commit()

    return collected